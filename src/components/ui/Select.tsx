import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({ label, options, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
      {label && (
        <label style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <select
        style={{
          padding: 8,
          border: '1px solid #e6edf3',
          borderRadius: 6,
        }}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

