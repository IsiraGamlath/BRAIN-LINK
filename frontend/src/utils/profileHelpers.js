// Helper function to check if a user's academic profile is complete
export const isProfileComplete = (user) => {
  if (!user) return false;
  
  return (
    user.batch &&
    user.batch.toString().trim() !== "" &&
    user.semester &&
    user.semester.toString().trim() !== "" &&
    user.subgroup &&
    user.subgroup.toString().trim() !== "" &&
    user.studyType &&
    user.studyType.toString().trim() !== ""
  );
};

// Get missing fields in a profile
export const getMissingProfileFields = (user) => {
  const missing = [];
  
  if (!user.batch || user.batch.toString().trim() === "") {
    missing.push("batch");
  }
  
  if (!user.semester || user.semester.toString().trim() === "") {
    missing.push("semester");
  }
  
  if (!user.subgroup || user.subgroup.toString().trim() === "") {
    missing.push("subgroup");
  }
  
  if (!user.studyType || user.studyType.toString().trim() === "") {
    missing.push("studyType");
  }
  
  return missing;
};
