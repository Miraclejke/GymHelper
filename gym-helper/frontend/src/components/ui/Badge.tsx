import type { ReactNode } from 'react';

type BadgeProps = {
  tone?: 'neutral' | 'success' | 'warning' | 'info';
  children: ReactNode;
};

export default function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
