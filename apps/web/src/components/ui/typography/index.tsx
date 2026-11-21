import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const headingStyle = tv({
  base: 'font-sans font-black text-typography-900 tracking-tight',
  variants: {
    size: {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl sm:text-2xl',
      xl: 'text-2xl sm:text-3xl',
      '2xl': 'text-3xl sm:text-4xl',
      '3xl': 'text-4xl sm:text-5xl',
      '4xl': 'text-5xl sm:text-6xl lg:text-[64px] leading-[1.06]',
    },
  },
  defaultVariants: {
    size: 'xl',
  },
});

const textStyle = tv({
  base: 'font-sans text-typography-600',
  variants: {
    size: {
      '2xs': 'text-[10px]',
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
    bold: {
      true: 'font-bold',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingStyle> {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Tag = 'h2', size, className, ...props }, ref) => (
    <Tag ref={ref} className={headingStyle({ size, class: className })} {...props} />
  )
);
Heading.displayName = 'Heading';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof textStyle> {
  as?: 'p' | 'span' | 'div';
}

export const Text: React.FC<TextProps> = ({ as: Tag = 'p', size, bold, className, ...props }) => (
  <Tag className={textStyle({ size, bold, class: className })} {...props} />
);
