import React from 'react';
import { View, ViewProps } from 'react-native';
import { tva } from '@gluestack-ui/utils/nativewind-utils';

const boxStyle = tva({ base: '' });

const vstackStyle = tva({
  base: 'flex-col',
  variants: {
    space: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
    },
  },
});

const hstackStyle = tva({
  base: 'flex-row items-center',
  variants: {
    space: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
    },
  },
});

const centerStyle = tva({
  base: 'items-center justify-center',
});

export interface BoxProps extends ViewProps {
  className?: string;
}

export const Box: React.FC<BoxProps> = ({ className, ...props }) => (
  <View className={boxStyle({ class: className })} {...props} />
);

export interface StackProps extends ViewProps {
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const VStack: React.FC<StackProps> = ({ space, className, ...props }) => (
  <View className={vstackStyle({ space, class: className })} {...props} />
);

export const HStack: React.FC<StackProps> = ({ space, className, ...props }) => (
  <View className={hstackStyle({ space, class: className })} {...props} />
);

export const Center: React.FC<BoxProps> = ({ className, ...props }) => (
  <View className={centerStyle({ class: className })} {...props} />
);
