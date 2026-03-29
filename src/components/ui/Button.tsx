import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const VARIANTS = {
  primary: 'bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 hover:bg-yellow-400/30',
  secondary: 'bg-blue-500/20 border border-blue-400/40 text-blue-300 hover:bg-blue-500/30',
  ghost: 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white',
  danger: 'bg-red-500/20 border border-red-400/40 text-red-300 hover:bg-red-500/30',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
