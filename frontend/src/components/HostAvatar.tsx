import { cn } from '@/lib/utils';

export function HostAvatar({ size = 56 }: { size?: number }) {
  const fontSize = Math.round(size * 0.38);

  return (
    <div
      className={cn('relative shrink-0 overflow-hidden rounded-full')}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, oklch(0.55 0.22 280) 0%, oklch(0.62 0.18 195) 100%)',
      }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center font-bold text-white"
        style={{ fontSize }}
      >
        T
      </div>
    </div>
  );
}
