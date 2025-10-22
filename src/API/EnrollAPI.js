import API_CONFIG from "./API_CONFIG";

// ✅ 내 수강신청 연습 기록 조회 API
export const fetchEnrollRecords = async (mode) => {
  const response = await API_CONFIG.get("/enroll-timer/me/recent", {
    params: { mode },
  });
  return response.data;
};

// ✅ 전체 사용자 수강신청 연습 기록 평균 조회 API
export const fetchAverageEnrollStats = async () => {
  const response = await API_CONFIG.get("/enroll-timer/stats/average-by-mode");
  return response.data;
};

// ✅ 수강신청 연습 시작 API
export const startEnrollTimer = async () => {
  const response = await API_CONFIG.post("/enroll-timer/start");
  return response.data;
};

// ✅ 수강신청 연습 종료 API
export const finishEnrollTimer = async (mode) => {
  const response = await API_CONFIG.post("/enroll-timer/finish", { mode });
  return response.data;
};

// ✅ 수강신청 연습 취소 API
export const cancelEnrollTimer = async () => {
  const response = await API_CONFIG.post("/enroll-timer/cancel");
  return response.data;
};
