import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
      {label && (
        <label style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <input
        style={{
          padding: 8,
          border: '1px solid #e6edf3',
          borderRadius: 6,
        }}
        {...props}
      />
    </div>
  );
};

