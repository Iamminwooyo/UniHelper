import axios from "axios";

// 이메일 인증번호 전송 API
export const requestSignupEmail = async (email) => {
  const response = await axios.post("/auth/email/signup/request", { email });
  return response.data;
};

// 이메일 인증번호 확인 API
export const verifySignupEmail = async (email, code) => {
  const response = await axios.post("/auth/email/verify", { email, code });
  return response.data;
};

// 회원가입 API
export const signup = async ({ username, password, email, department, student_number }) => {
  return await axios.post("/auth/signup", {
    username,
    password,
    email,
    department,
    role: "STUDENT",
    student_number,
  });
};

// 로그인 API
export const login = async (email, password) => {
  const response = await axios.post("/auth/login", { email, password });
  return response.data;
};

// 사용자 정보 조회 API
export const fetchUserBrief = async (accessToken) => {
  const response = await axios.get("/mypage/brief", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

// 비밀번호 변경 이메일 인증번호 전송 API
export const requestPasswordResetEmail = async (email) => {
  const response = await axios.post("/auth/email/password-reset/request", { email });
  return response.data;
};

// 비밀번호 변경 이메일 인증번호 확인 API
export const verifyPasswordResetCode = async (email, code) => {
  const response = await axios.post("/auth/email/verify", { email, code });
  return response.data;
};

// 비밀번호 변경 API
export const resetPassword = async (email, newPassword) => {
  const response = await axios.post("/auth/password/reset/confirm", { email, newPassword });
  return response.data;
};

// 액세스 토큰 재발급 API
export const reissueToken = async (accessToken, refreshToken) => {
  const response = await axios.post("/auth/reissue", { accessToken, refreshToken });
  return response.data;
};

// 계정 이미지 API
export const fetchImagePreview = async (filename) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const safeFilename = filename.replace(/^\/files\//, "").replace(/ /g, "%20");

  const response = await axios.get(`/notices/image-preview?filename=${safeFilename}`, {
    responseType: "blob",
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};