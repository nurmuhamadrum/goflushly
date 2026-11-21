import React from 'react';
import { View, ViewProps, Text as RNText, TextProps as RNTextProps } from 'react-native';
import { tva } from '@gluestack-ui/utils/nativewind-utils';

const cardStyle = tva({
  base: 'rounded-3xl',
  variants: {
    variant: {
      elevated: 'bg-background-0 border border-outline-200',
      navy: 'bg-background-900',
      filled: 'bg-background-50 border border-outline-200',
    },
    size: {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    },
  },
  defaultVariants: {
    variant: 'elevated',
    size: 'md',
  },
});

const badgeStyle = tva({
  base: 'flex-row items-center gap-1 rounded-full px-3 py-1',
  variants: {
    action: {
      primary: 'bg-primary-0',
      secondary: 'bg-secondary-0',
      muted: 'bg-background-100',
      solidPrimary: 'bg-primary-500',
    },
  },
  defaultVariants: {
    action: 'muted',
  },
});

const badgeTextStyle = tva({
  base: 'text-[11px] font-bold',
  variants: {
    action: {
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      muted: 'text-typography-600',
      solidPrimary: 'text-white',
    },
  },
  defaultVariants: {
    action: 'muted',
  },
});

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'navy' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({ variant, size, className, ...props }) => (
  <View className={cardStyle({ variant, size, class: className })} {...props} />
);

export interface BadgeProps extends ViewProps {
  action?: 'primary' | 'secondary' | 'muted' | 'solidPrimary';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ action, className, ...props }) => (
  <View className={badgeStyle({ action, class: className })} {...props} />
);

export interface BadgeTextProps extends RNTextProps {
  action?: 'primary' | 'secondary' | 'muted' | 'solidPrimary';
  className?: string;
}

export const BadgeText: React.FC<BadgeTextProps> = ({ action, className, ...props }) => (
  <RNText className={badgeTextStyle({ action, class: className })} {...props} />
);
