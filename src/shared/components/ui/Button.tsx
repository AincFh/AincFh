import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: React.ElementType;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  as: Component = 'button',
  isLoading = false,
  ...props
}) => {
  const baseStyles = 'rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none';

  const variantStyles = {
    default: 'bg-[#0071e3] hover:bg-[#0077ED] text-white shadow-sm hover:shadow-md',
    outline: 'border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-foreground',
    ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground/80 hover:text-foreground',
    glass: 'glass hover:bg-white/80 dark:hover:bg-white/10 text-foreground border-white/20 shadow-sm'
  };

  const sizeStyles = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-[15px]',
    lg: 'px-8 py-3.5 text-[17px]'
  };

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </Component>
  );
};