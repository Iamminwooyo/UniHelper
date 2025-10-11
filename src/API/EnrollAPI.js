import API_CONFIG from './API_CONFIG';

// 내 수강신청 연습 기록 조회 API
export const fetchEnrollRecords = async (mode) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const params = { mode };

  const response = await API_CONFIG.get("/enroll-timer/me/recent", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });

  return response.data;
};

// 전체 사용자 수강신청 연습 기록 평균 조회 API
export const fetchAverageEnrollStats = async () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.get("/enroll-timer/stats/average-by-mode", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data; 
};

// 수강신청 연습 시작 API
export const startEnrollTimer = async () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.post("/enroll-timer/start", null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data; 
};

// 수강신청 연습 종료 API
export const finishEnrollTimer = async (mode) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.post("/enroll-timer/finish", {mode}, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data; 
};

// 수강신청 연습 취소 API
export const cancelEnrollTimer = async () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.post("/enroll-timer/cancel", null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data; 
};