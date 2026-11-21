import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text as RNText,
  TextProps as RNTextProps,
  ActivityIndicator,
} from 'react-native';
import { tva } from '@gluestack-ui/utils/nativewind-utils';

const buttonStyle = tva({
  base: 'flex-row items-center justify-center gap-2 rounded-full',
  variants: {
    action: {
      primary: 'bg-primary-500',
      secondary: 'bg-secondary-500',
      neutral: 'bg-background-100 border border-outline-200',
      danger: 'bg-[#EF4444]',
    },
    size: {
      xs: 'px-3 py-1.5',
      sm: 'px-4 py-2',
      md: 'px-5 py-3',
      lg: 'px-6 py-3.5',
    },
  },
  defaultVariants: {
    action: 'primary',
    size: 'lg',
  },
});

const buttonTextStyle = tva({
  base: 'font-extrabold text-sm',
  variants: {
    action: {
      primary: 'text-white',
      secondary: 'text-white',
      neutral: 'text-typography-900',
      danger: 'text-white',
    },
  },
  defaultVariants: {
    action: 'primary',
  },
});

export interface ButtonProps extends TouchableOpacityProps {
  action?: 'primary' | 'secondary' | 'neutral' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  action,
  size,
  className,
  activeOpacity = 0.85,
  ...props
}) => (
  <TouchableOpacity
    activeOpacity={activeOpacity}
    className={buttonStyle({ action, size, class: className })}
    {...props}
  />
);

export interface ButtonTextProps extends RNTextProps {
  action?: 'primary' | 'secondary' | 'neutral' | 'danger';
  className?: string;
}

export const ButtonText: React.FC<ButtonTextProps> = ({ action, className, ...props }) => (
  <RNText className={buttonTextStyle({ action, class: className })} {...props} />
);

export const ButtonSpinner: React.FC<{ color?: string }> = ({ color = '#FFFFFF' }) => (
  <ActivityIndicator size="small" color={color} />
);
