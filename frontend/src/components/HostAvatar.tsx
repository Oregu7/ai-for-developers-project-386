import { cn } from '@/lib/utils';

export function HostAvatar({ size = 56 }: { size?: number }) {
  return (
    <div
      className={cn('relative shrink-0 overflow-hidden rounded-full')}
      style={{
        width: size,
        height: size,
        background:
          'linear-gradient(180deg, #fdba74 0%, #fdba74 50%, #2dd4bf 50%, #2dd4bf 100%)',
      }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          top: size * 0.14,
          background: '#fdba74',
        }}
      />
    </div>
  );
}
