import React, { createContext, useContext } from 'react';

export type GluestackMode = 'light' | 'dark';

interface GluestackContextValue {
  mode: GluestackMode;
}

const GluestackUIContext = createContext<GluestackContextValue>({ mode: 'light' });

export const useGluestackUI = () => useContext(GluestackUIContext);

export interface GluestackUIProviderProps {
  mode?: GluestackMode;
  children: React.ReactNode;
}

export const GluestackUIProvider: React.FC<GluestackUIProviderProps> = ({
  mode = 'light',
  children,
}) => {
  return (
    <GluestackUIContext.Provider value={{ mode }}>
      <div
        data-gluestack-mode={mode}
        className="min-h-screen bg-background-50 text-typography-900 font-sans antialiased selection:bg-primary-500 selection:text-white"
      >
        {children}
      </div>
    </GluestackUIContext.Provider>
  );
};
