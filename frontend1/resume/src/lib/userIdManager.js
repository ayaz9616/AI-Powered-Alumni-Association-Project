export function getUserId() {
  try {
    const key = 'resumate_user_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'anon-' + Date.now();
  }
}

// User data management for mentorship platform
export const getUserData = () => {
  try {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setUserData = (userData) => {
  try {
    localStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
};

export const clearUserData = () => {
  try {
    localStorage.removeItem('userData');
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
};

export const isAuthenticated = () => {
  return !!getUserData();
};

export const getUserRole = () => {
  const userData = getUserData();
  return userData?.role || null;
};

export const logout = () => {
  clearUserData();
  // Keep userId for future logins
};
