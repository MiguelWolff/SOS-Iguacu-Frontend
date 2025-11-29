import React from 'react';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, className }) => {
  return (
    <div
      className={className}
      style={{
        background: '#fff',
        padding: 14,
        borderRadius: 10,
        boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

