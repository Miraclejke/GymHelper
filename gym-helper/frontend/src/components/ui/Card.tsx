import type { ReactNode } from 'react';

type CardProps = {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
  actions?: ReactNode;
};

export default function Card({ title, subtitle, className = '', children, actions }: CardProps) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || actions) && (
        <header className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}
