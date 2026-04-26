export default function Skeleton({ className, width, height, circle }: { className?: string, width?: string|number, height?: string|number, circle?: boolean }) {
  return (
    <div
      className={`skeleton ${className || ''}`}
      style={{
        width: width || '100%',
        height: height || '16px',
        borderRadius: circle ? '50%' : 'var(--radius-md)'
      }}
    />
  )
}
