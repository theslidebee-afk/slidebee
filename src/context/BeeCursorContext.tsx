import React, { createContext, useContext, useState, type ReactNode } from "react";

export type BeeCursorState = 
  | "default"
  | "hover"
  | "card"
  | "quote"
  | "perch"
  | "hidden";

interface BeeCursorContextType {
  beeState: BeeCursorState;
  setBeeState: (state: BeeCursorState) => void;
  perchTarget: { x: number; y: number } | null;
  setPerchTarget: (target: { x: number; y: number } | null) => void;
}

const BeeCursorContext = createContext<BeeCursorContextType | undefined>(undefined);

export const BeeCursorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [beeState, setBeeState] = useState<BeeCursorState>("default");
  const [perchTarget, setPerchTarget] = useState<{ x: number; y: number } | null>(null);

  return (
    <BeeCursorContext.Provider
      value={{
        beeState,
        setBeeState,
        perchTarget,
        setPerchTarget,
      }}
    >
      {children}
    </BeeCursorContext.Provider>
  );
};

export const useBeeCursor = (): BeeCursorContextType => {
  const context = useContext(BeeCursorContext);
  if (!context) {
    throw new Error("useBeeCursor must be used within a BeeCursorProvider");
  }
  return context;
};
