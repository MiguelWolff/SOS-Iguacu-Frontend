import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'orange' | 'dark';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: '#2b6cb0', color: '#fff' },
  secondary: { background: 'transparent', color: '#333' },
  danger: { background: '#e63946', color: '#fff' },
  orange: { background: '#ff9900', color: '#fff' },
  dark: { background: '#333', color: '#fff' },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  style,
  ...props
}) => {
  return (
    <button
      style={{
        padding: '8px 10px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

