import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const cardStyle = tv({
  base: 'rounded-3xl transition-all duration-300',
  variants: {
    variant: {
      elevated: 'bg-background-0 border border-outline-200 shadow-sm hover:shadow-xl',
      outline: 'bg-background-0 border border-outline-200 shadow-xs',
      highlighted: 'bg-background-0 border-2 border-primary-500 shadow-xl shadow-primary-500/10',
      navy: 'bg-background-900 text-white shadow-2xl',
      filled: 'bg-background-50 border border-outline-200',
    },
    size: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-7 sm:p-8',
      xl: 'p-8 sm:p-10 md:p-12',
    },
  },
  defaultVariants: {
    variant: 'elevated',
    size: 'md',
  },
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardStyle> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ variant, size, className, ...props }, ref) => (
  <div ref={ref} className={cardStyle({ variant, size, class: className })} {...props} />
));
Card.displayName = 'Card';
