import React, { createContext, useContext, useMemo, useState } from "react";

const TEST_USERS = [
  {
    name: "Sarah Ahmed",
    itNumber: "IT23709584",
    specialization: "IT",
    batch: "128",
    semester: "2",
    subgroup: "1.1",
    studyType: "Weekend",
  },
  {
    name: "Nimal Perera",
    itNumber: "IT23709585",
    specialization: "IT",
    batch: "128",
    semester: "2",
    subgroup: "1.1",
    studyType: "Weekend",
  },
  {
    name: "Kavindi Silva",
    itNumber: "IT23709586",
    specialization: "IT",
    batch: "128",
    semester: "2",
    subgroup: "1.1",
    studyType: "Weekend",
  },
];

const STORAGE_KEY = "brainlink.testing.currentUserItNumber";
const CurrentUserContext = createContext(null);

const getInitialUser = () => {
  const savedItNumber = localStorage.getItem(STORAGE_KEY);
  const fromStorage = TEST_USERS.find((u) => u.itNumber === savedItNumber);
  return fromStorage || TEST_USERS[0];
};

export const TestingUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(getInitialUser);

  const setCurrentUserByItNumber = (itNumber) => {
    const selectedUser = TEST_USERS.find((u) => u.itNumber === itNumber);
    if (!selectedUser) {
      return;
    }

    setCurrentUser(selectedUser);
    localStorage.setItem(STORAGE_KEY, selectedUser.itNumber);
  };

  const value = useMemo(
    () => ({
      currentUser,
      testUsers: TEST_USERS,
      setCurrentUserByItNumber,
      isTestingContext: true,
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
