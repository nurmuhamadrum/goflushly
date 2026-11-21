import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const buttonStyle = tv({
  base: 'inline-flex items-center justify-center gap-2 font-sans font-bold rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer',
  variants: {
    action: {
      primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm shadow-primary-500/25 hover:shadow-md',
      secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-sm shadow-secondary-500/25',
      neutral: 'bg-background-200 hover:bg-outline-200 text-typography-900',
      white: 'bg-background-0 hover:bg-background-50 text-typography-900 border border-outline-200 shadow-xs',
      dark: 'bg-background-900 hover:bg-typography-800 text-white shadow-xs',
    },
    variant: {
      solid: '',
      outline: 'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-0 shadow-none',
      link: 'bg-transparent hover:underline shadow-none px-0 py-0',
    },
    size: {
      xs: 'px-3.5 py-1.5 text-xs',
      sm: 'px-4 py-2 text-xs sm:text-sm',
      md: 'px-6 py-3 text-xs sm:text-sm',
      lg: 'px-7 py-3.5 text-sm sm:text-base',
    },
  },
  defaultVariants: {
    action: 'primary',
    variant: 'solid',
    size: 'md',
  },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyle> {
  href?: string;
  target?: string;
  rel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  action,
  variant,
  size,
  className,
  href,
  target,
  rel,
  type = 'button',
  children,
  ...props
}) => {
  const classes = buttonStyle({ action, variant, size, class: className });
  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
};

export const ButtonText: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = '', ...props }) => (
  <span className={`font-bold leading-none ${className}`} {...props} />
);
