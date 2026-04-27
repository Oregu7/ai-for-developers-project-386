import { test, expect, type Page } from '@playwright/test';

test.describe('Каталог событий', () => {
  test('отображает карточки типов событий', async ({ page }) => {
    await page.goto('/book');
    await expect(
      page.getByRole('heading', { name: 'Выберите тип события' }),
    ).toBeVisible();
    await expect(page.getByText('Tota').first()).toBeVisible();
    await expect(page.getByText('Встреча 15 минут')).toBeVisible();
    await expect(page.getByText('Встреча 30 минут')).toBeVisible();
  });

  test('карточка типа события ведёт на страницу бронирования', async ({
    page,
  }) => {
    await page.goto('/book');
    await page.getByText('Встреча 15 минут').click();
    await expect(page).toHaveURL(/.*\/book\/[a-f0-9-]+/);
  });
});

async function bookSlot(page: Page, name: string, email: string) {
  await page.goto('/book');
  await page.getByText('Встреча 15 минут').click();
  await expect(page).toHaveURL(/.*\/book\/[a-f0-9-]+/);
  await expect(
    page.getByRole('heading', { name: 'Встреча 15 минут' }),
  ).toBeVisible();

  await page.waitForSelector('text=Календарь');

  const dayWithSlots = page
    .locator('[data-testid^="calendar-day-"]')
    .filter({ hasText: /\d+ св\./ })
    .first();
  await dayWithSlots.click();

  const availableSlots = page.locator('[data-testid="slot-available"]');
  await expect(availableSlots.first()).toBeVisible({ timeout: 10_000 });
  await availableSlots.first().click();

  await page.getByRole('button', { name: 'Продолжить' }).first().click();

  await expect(page.getByText('Данные для записи')).toBeVisible();
  await page.getByLabel('Имя').fill(name);
  await page.getByLabel('Email').fill(email);

  await page.getByRole('button', { name: 'Забронировать' }).click();

  await expect(page.getByText('Встреча забронирована!')).toBeVisible();
}

test.describe('Полный сценарий бронирования', () => {
  test('гость бронирует слот — полный путь от каталога до подтверждения', async ({
    page,
  }) => {
    await bookSlot(page, 'Иван Тестов', `ivan-${Date.now()}@test.com`);
  });

  test('забронированная встреча появляется в админке', async ({ page }) => {
    const email = `admin-${Date.now()}@test.com`;
    await bookSlot(page, 'Админ Тест', email);

    await page.goto('/admin');
    await expect(
      page.getByRole('heading', { name: 'Админка' }),
    ).toBeVisible();

    await expect(page.getByText('Админ Тест')).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });
});
