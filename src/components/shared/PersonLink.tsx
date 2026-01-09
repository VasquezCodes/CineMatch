import Link from 'next/link';
import { cn } from '@/lib/utils';

type PersonLinkProps = {
  name: string;
  className?: string;
  children?: React.ReactNode;
};

export function PersonLink({ name, className, children }: PersonLinkProps) {
  return (
    <Link
      href={`/person/${encodeURIComponent(name)}`}
      className={cn(
        'hover:underline hover:text-primary transition-colors cursor-pointer',
        className
      )}
    >
      {children || name}
    </Link>
  );
}
