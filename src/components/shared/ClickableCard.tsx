import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ClickableCardProps {
  to: string;
  children: ReactNode;
  className?: string;
}

export default function ClickableCard({ to, children, className }: ClickableCardProps) {
  return (
    <Link to={to} className={className ? `${className} block` : 'block'}>
      {children}
    </Link>
  );
}
