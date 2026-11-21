import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const boxStyle = tv({
  base: '',
});

const vstackStyle = tv({
  base: 'flex flex-col',
  variants: {
    space: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
      '2xl': 'gap-8',
      '3xl': 'gap-10',
    },
  },
});

const hstackStyle = tv({
  base: 'flex flex-row items-center',
  variants: {
    space: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
      '2xl': 'gap-8',
    },
  },
});

const centerStyle = tv({
  base: 'flex items-center justify-center',
});

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof boxStyle> {}
export const Box = React.forwardRef<HTMLDivElement, BoxProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={boxStyle({ class: className })} {...props} />
));
Box.displayName = 'Box';

export interface VStackProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof vstackStyle> {}
export const VStack = React.forwardRef<HTMLDivElement, VStackProps>(({ space, className, ...props }, ref) => (
  <div ref={ref} className={vstackStyle({ space, class: className })} {...props} />
));
VStack.displayName = 'VStack';

export interface HStackProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof hstackStyle> {}
export const HStack = React.forwardRef<HTMLDivElement, HStackProps>(({ space, className, ...props }, ref) => (
  <div ref={ref} className={hstackStyle({ space, class: className })} {...props} />
));
HStack.displayName = 'HStack';

export interface CenterProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof centerStyle> {}
export const Center = React.forwardRef<HTMLDivElement, CenterProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={centerStyle({ class: className })} {...props} />
));
Center.displayName = 'Center';
