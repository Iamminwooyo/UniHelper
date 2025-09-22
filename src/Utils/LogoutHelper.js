export const handleLogout = (navigate, setUnreadCount, setIsLoggedIn) => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("userBrief");
  if (setUnreadCount) setUnreadCount(0);
  if (setIsLoggedIn) setIsLoggedIn(false);
  navigate("/login");
};