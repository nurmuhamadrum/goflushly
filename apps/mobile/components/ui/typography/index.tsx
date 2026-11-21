import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { tva } from '@gluestack-ui/utils/nativewind-utils';

const headingStyle = tva({
  base: 'font-extrabold text-typography-900 tracking-tight',
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

const textStyle = tva({
  base: 'text-typography-600',
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

export interface HeadingProps extends RNTextProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({ size, className, ...props }) => (
  <RNText className={headingStyle({ size, class: className })} {...props} />
);

export interface TextProps extends RNTextProps {
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg';
  bold?: boolean;
  className?: string;
}

export const Text: React.FC<TextProps> = ({ size, bold, className, ...props }) => (
  <RNText className={textStyle({ size, bold, class: className })} {...props} />
);
