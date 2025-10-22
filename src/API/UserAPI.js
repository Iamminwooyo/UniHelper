import API_CONFIG from './API_CONFIG';

// 내 정보 조회 API
export const fetchMyPageInfo = async () => {
  const response = await API_CONFIG.get("/mypage/info");
  return response.data;
};

// 학점 정보 조회 API
export const fetchMyPageCredits = async () => {
  const response = await API_CONFIG.get("/mypage/credits");
  return response.data;
};

// 내 정보 수정 API
export const updateMyPageInfo = async (formData) => {
  const response = await API_CONFIG.patch("/mypage/info", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 학점 정보 PDF 업로드 API
export const uploadCreditsFile = async (formData) => {
  const response = await API_CONFIG.post("/credits/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 학점 정보 수정 API
export const updateCredits = async (payload) => {
  const response = await API_CONFIG.put("/credits/flat", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

// 프로필 이미지 API
export const fetchProfileImagePreview = async (filename) => {
  const safeFilename = filename.replace(/^\/files\//, "").replace(/ /g, "%20");
  const response = await API_CONFIG.get(`/notices/download?filename=${safeFilename}`, {
    responseType: "blob",
  });
  return response.data;
};

// 알림 조회 API
export const fetchAlarm = async ({ page = 1, size = 10 }) => {
  const params = { page: page - 1, size };
  const response = await API_CONFIG.get("/notifications/me", { params });
  return response.data;
};

// 알림 읽음 API
export const markAlarmsRead = async (ids) => {
  const response = await API_CONFIG.patch("/notifications/me/read", ids, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

// 알림 삭제 API
export const deleteAlarms = async (ids) => {
  const response = await API_CONFIG.delete("/notifications/me", {
    data: ids,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

// 알림 개수 조회 API
export const fetchUnreadAlarmCount = async () => {
  const response = await API_CONFIG.get("/notifications/me/unread-count");
  return response.data;
};
