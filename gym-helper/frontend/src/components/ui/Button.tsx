import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'subtle';
};

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={`btn btn-${variant} ${className}`.trim()} {...props} />;
}
