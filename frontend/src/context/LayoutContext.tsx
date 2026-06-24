import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface LayoutHeaderConfig {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  primaryAction?: React.ReactNode;
  subtitle?: string;
}

interface LayoutContextValue {
  header: LayoutHeaderConfig;
  setHeader: (config: LayoutHeaderConfig) => void;
  clearHeader: () => void;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [header, setHeaderState] = useState<LayoutHeaderConfig>({});

  const setHeader = useCallback((config: LayoutHeaderConfig) => {
    setHeaderState(config);
  }, []);

  const clearHeader = useCallback(() => {
    setHeaderState({});
  }, []);

  return (
    <LayoutContext.Provider value={{ header, setHeader, clearHeader }}>
      {children}
    </LayoutContext.Provider>
  );
};

export function useLayoutHeader(config: LayoutHeaderConfig, deps: unknown[] = []) {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutHeader must be used within LayoutProvider');
  }

  const { setHeader, clearHeader } = context;

  useEffect(() => {
    setHeader(config);
    return () => clearHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return context;
}

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within LayoutProvider');
  }
  return context;
}
