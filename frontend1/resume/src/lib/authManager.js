/**
 * User ID Management
 * Generates and persists unique user IDs in localStorage
 * Also stores role information
 */

const USER_ID_KEY = 'resumate_user_id';
const USER_ROLE_KEY = 'resumate_user_role';
const USER_NAME_KEY = 'resumate_user_name';
const USER_EMAIL_KEY = 'resumate_user_email';
const USER_BRANCH_KEY = 'resumate_user_branch';
const PROFILE_COMPLETE_KEY = 'resumate_profile_complete';

export const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const setUserId = (userId) => {
  localStorage.setItem(USER_ID_KEY, userId);
};

export const getUserRole = () => {
  return localStorage.getItem(USER_ROLE_KEY) || null;
};

export const setUserRole = (role) => {
  localStorage.setItem(USER_ROLE_KEY, role);
};

export const getUserName = () => {
  return localStorage.getItem(USER_NAME_KEY) || '';
};

export const setUserName = (name) => {
  localStorage.setItem(USER_NAME_KEY, name);
};

export const getUserEmail = () => {
  return localStorage.getItem(USER_EMAIL_KEY) || '';
};

export const setUserEmail = (email) => {
  localStorage.setItem(USER_EMAIL_KEY, email);
};

export const getUserBranch = () => {
  return localStorage.getItem(USER_BRANCH_KEY) || '';
};

export const setUserBranch = (branch) => {
  localStorage.setItem(USER_BRANCH_KEY, branch);
};

export const isAuthenticated = () => {
  const userId = getUserId();
  const role = getUserRole();
  return !!userId && !!role;
};

export const isProfileComplete = () => {
  return localStorage.getItem(PROFILE_COMPLETE_KEY) === 'true';
};

export const setProfileComplete = (complete) => {
  localStorage.setItem(PROFILE_COMPLETE_KEY, complete ? 'true' : 'false');
};

export const logout = () => {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_BRANCH_KEY);
  localStorage.removeItem(PROFILE_COMPLETE_KEY);
};

export const getUserProfile = () => {
  return {
    userId: getUserId(),
    role: getUserRole(),
    name: getUserName(),
    email: getUserEmail(),
    branch: getUserBranch(),
    isAuthenticated: isAuthenticated()
  };
};

export const setUserProfile = (profile) => {
  if (profile.userId) setUserId(profile.userId);
  if (profile.role) setUserRole(profile.role);
  if (profile.name) setUserName(profile.name);
  if (profile.email) setUserEmail(profile.email);
  if (profile.branch) setUserBranch(profile.branch);
};
