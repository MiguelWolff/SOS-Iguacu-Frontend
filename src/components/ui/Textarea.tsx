import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 8 }}>
      {label && (
        <label style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <textarea
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

