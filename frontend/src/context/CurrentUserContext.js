import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "brainlink.currentUserProfile";
const CurrentUserContext = createContext(null);
const PROFILE_API_BASE = "http://localhost:5000/api/profile";

const DEFAULT_CURRENT_USER = {
  name: "",
  itNumber: "",
  specialization: "IT",
  batch: "",
  semester: "",
  subgroup: "1.1",
  studyType: "Weekend",
};

const getInitialUser = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return stored ? { ...DEFAULT_CURRENT_USER, ...stored } : DEFAULT_CURRENT_USER;
  } catch {
    return DEFAULT_CURRENT_USER;
  }
};

export const TestingUserProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(getInitialUser);

  useEffect(() => {
    const syncUserFromAuth = async () => {
      if (!authUser) {
        setCurrentUser(DEFAULT_CURRENT_USER);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      const baseUser = {
        ...DEFAULT_CURRENT_USER,
        name: authUser.fullName || "",
        itNumber: authUser.slIIId || "",
        specialization: authUser.specialization || "IT",
        semester: authUser.semester ? String(authUser.semester) : "",
      };

      // Keep auth identity fields authoritative; only merge saved academic fields.
      const localMerged = { ...getInitialUser(), ...baseUser };
      setCurrentUser(localMerged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localMerged));

      if (!baseUser.itNumber) {
        return;
      }

      try {
        const response = await axios.get(`${PROFILE_API_BASE}/${baseUser.itNumber}`);
        const profile = response.data?.profile;

        if (profile) {
          const merged = {
            ...localMerged,
            batch: profile.batch || localMerged.batch,
            semester: profile.semester || localMerged.semester,
            studyType: profile.studyType || localMerged.studyType,
            subgroup: profile.subgroup || localMerged.subgroup,
          };

          setCurrentUser(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
      } catch {
        // Keep local/auth merged profile if backend profile is not yet created.
      }
    };

    syncUserFromAuth();
  }, [authUser]);

  const setCurrentUserByItNumber = () => {
    return;
  };

  const setCurrentUserProfile = (partialProfile) => {
    setCurrentUser((prev) => {
      const next = { ...prev, ...partialProfile };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo(
    () => ({
      currentUser,
      testUsers: [],
      setCurrentUserByItNumber,
      setCurrentUserProfile,
      isTestingContext: false,
    }),
    [currentUser]
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
};

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error("useCurrentUser must be used inside TestingUserProvider");
  }

  return context;
};
