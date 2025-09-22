export const handleLogout = (navigate, setUnreadCount, setIsLoggedIn) => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  if (setUnreadCount) setUnreadCount(0);
  if (setIsLoggedIn) setIsLoggedIn(false);
  navigate("/login");
};