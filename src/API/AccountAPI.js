import API_CONFIG from './API_CONFIG';

// ✅ 로그인 필요 없는 API: authRequired: false
export const requestSignupEmail = async (email) => {
  const response = await API_CONFIG.post(
    "/auth/email/signup/request",
    { email },
    { authRequired: false }
  );
  return response.data;
};

export const verifySignupEmail = async (email, code) => {
  const response = await API_CONFIG.post(
    "/auth/email/verify",
    { email, code },
    { authRequired: false }
  );
  return response.data;
};

export const signup = async ({ username, password, email, department, student_number }) => {
  const response = await API_CONFIG.post(
    "/auth/signup",
    {
      username,
      password,
      email,
      department,
      role: "STUDENT",
      student_number,
    },
    { authRequired: false }
  );
  return response.data;
};

export const login = async (email, password) => {
  const response = await API_CONFIG.post(
    "/auth/login",
    { email, password },
    { authRequired: false }
  );
  return response.data;
};

export const requestPasswordResetEmail = async (email) => {
  const response = await API_CONFIG.post(
    "/auth/email/password-reset/request",
    { email },
    { authRequired: false }
  );
  return response.data;
};

export const verifyPasswordResetCode = async (email, code) => {
  const response = await API_CONFIG.post(
    "/auth/email/verify",
    { email, code },
    { authRequired: false }
  );
  return response.data;
};

export const resetPassword = async (email, newPassword) => {
  const response = await API_CONFIG.post(
    "/auth/password/reset/confirm",
    { email, newPassword },
    { authRequired: false }
  );
  return response.data;
};

// ✅ 로그인 필요 API: 인터셉터가 Authorization 헤더 자동 추가
export const fetchUserBrief = async () => {
  const response = await API_CONFIG.get("/mypage/brief");
  return response.data;
};

export const fetchImagePreview = async (filename) => {
  const safeFilename = encodeURIComponent(filename.replace(/^\/files\//, ""));
  const response = await API_CONFIG.get(`/notices/download?filename=${safeFilename}`, {
    responseType: "blob",
  });
  return response.data;
};
