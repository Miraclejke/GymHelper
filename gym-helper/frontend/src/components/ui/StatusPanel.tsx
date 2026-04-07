import Button from './Button';

type StatusPanelProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'loading' | 'error' | 'empty';
};

export default function StatusPanel({
  title,
  description,
  actionLabel,
  onAction,
  variant = 'empty',
}: StatusPanelProps) {
  return (
    <div className={`status-panel ${variant}`.trim()}>
      <h3>{title}</h3>
      {description && <p className="muted">{description}</p>}
      {actionLabel && onAction && (
        <Button variant={variant === 'error' ? 'ghost' : 'primary'} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
