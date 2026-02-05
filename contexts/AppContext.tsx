import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Lawyer, Office, UserPreferences } from "../types";
import {
  getCurrentLawyer,
  getOffice,
  getPreferences,
} from "../utils/settingsPersistence";

interface AppContextType {
  lawyer: Lawyer | null;
  office: Office;
  preferences: UserPreferences;
  refreshAll: () => void;
  updateLocalLawyer: (lawyer: Lawyer) => void;
  updateLocalOffice: (office: Office) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [office, setOffice] = useState<Office>(getOffice());
  const [preferences, setPreferences] =
    useState<UserPreferences>(getPreferences());

  const refreshAll = useCallback(() => {
    setLawyer(getCurrentLawyer());
    setOffice(getOffice());
    setPreferences(getPreferences());
  }, []);

  useEffect(() => {
    refreshAll();

    // Ouvir mudanças de outras abas
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.includes("legalflow") || e.key === "current_lawyer") {
        refreshAll();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshAll]);

  return (
    <AppContext.Provider
      value={{
        lawyer,
        office,
        preferences,
        refreshAll,
        updateLocalLawyer: setLawyer,
        updateLocalOffice: setOffice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
