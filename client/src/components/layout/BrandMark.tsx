export function BrandMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#0f766e" />
      <path d="M10 8h3v13h9v3H10z" fill="#fff" />
    </svg>
  );
}
