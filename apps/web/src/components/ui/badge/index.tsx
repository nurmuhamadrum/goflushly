import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const badgeStyle = tv({
  base: 'inline-flex items-center gap-1.5 rounded-full font-sans font-bold',
  variants: {
    action: {
      primary: 'bg-primary-0 text-primary-500 border border-primary-100',
      secondary: 'bg-secondary-0 text-secondary-500 border border-secondary-100',
      muted: 'bg-background-100 text-typography-900 border border-outline-100',
      solidPrimary: 'bg-primary-500 text-white shadow-sm',
      solidSecondary: 'bg-secondary-500 text-white shadow-sm',
    },
    size: {
      sm: 'px-2.5 py-0.5 text-[10px]',
      md: 'px-3 py-1 text-[11px]',
      lg: 'px-3.5 py-1.5 text-xs',
    },
  },
  defaultVariants: {
    action: 'muted',
    size: 'md',
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeStyle> {}

export const Badge: React.FC<BadgeProps> = ({ action, size, className, ...props }) => (
  <span className={badgeStyle({ action, size, class: className })} {...props} />
);

export const BadgeText: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = '', ...props }) => (
  <span className={`font-bold leading-none ${className}`} {...props} />
);
