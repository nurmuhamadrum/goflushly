import React, { createContext, useContext } from 'react';
import { View, ViewProps } from 'react-native';

export type GluestackMode = 'light' | 'dark';

const GluestackUIContext = createContext<{ mode: GluestackMode }>({ mode: 'light' });

export const useGluestackUI = () => useContext(GluestackUIContext);

export interface GluestackUIProviderProps extends ViewProps {
  mode?: GluestackMode;
  children: React.ReactNode;
}

export const GluestackUIProvider: React.FC<GluestackUIProviderProps> = ({
  mode = 'light',
  children,
  style,
  ...props
}) => {
  return (
    <GluestackUIContext.Provider value={{ mode }}>
      <View
        className="flex-1 bg-background-50"
        style={[{ flex: 1 }, style]}
        {...props}
      >
        {children}
      </View>
    </GluestackUIContext.Provider>
  );
};
