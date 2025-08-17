const BASE_URL = "http://localhost:8080";

export const getImageUrl = (path) => {
  if (!path) return "/images/default.png";
  return path.startsWith("http") ? encodeURI(path) : `${BASE_URL}${encodeURI(path)}`;
};