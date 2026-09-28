export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <span className={`font-extrabold tracking-tight ${sizes[size]}`}>
      <span className="text-gray-900">Style</span>
      <span className="text-brand-600">Freds</span>
    </span>
  );
}