"use client";

import { createContext, useContext, useEffect, useState } from "react";

type TooltipContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
};

const TooltipContext = createContext<TooltipContextValue>({
  enabled: true,
  setEnabled: () => {}
});

const STORAGE_KEY = "neatcurb:tooltips";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "off") setEnabled(false);
  }, []);

  const handleSet = (value: boolean) => {
    setEnabled(value);
    window.localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
  };

  return (
    <TooltipContext.Provider value={{ enabled, setEnabled: handleSet }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltips() {
  return useContext(TooltipContext);
}
