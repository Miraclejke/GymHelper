import type { SelectHTMLAttributes } from 'react';

type Option = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
};

export default function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <label className={`field ${className}`.trim()}>
      {label && <span className="field-label">{label}</span>}
      <select className="select" {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}