import API_CONFIG from './API_CONFIG';

// 내 정보 조회 API
export const fetchMyPageInfo = async () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.get("/mypage/info", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 학점 정보 조회 API
export const fetchMyPageCredits = async () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.get("/mypage/credits", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 내 정보 수정 API
export const updateMyPageInfo = async (formData) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.patch("/mypage/info", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// 학점 정보 PDF 업로드 API
export const uploadCreditsFile = async (formData) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.post("/credits/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// 학점 정보 수정 API
export const updateCredits = async (payload) => {
  const token = sessionStorage.getItem("accessToken");
  const res = await API_CONFIG.put("/credits/flat", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

// 프로필 이미지 API
export const fetchProfileImagePreview = async (filename) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const safeFilename = filename.replace(/^\/files\//, "").replace(/ /g, "%20");

  const response = await API_CONFIG.get(`/notices/download?filename=${safeFilename}`, {
    responseType: "blob",
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 알림 조회 API
export const fetchAlarm = async ({ page = 1, size = 10 }) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const params = {
    page: page - 1,
    size,
  };

  const response = await API_CONFIG.get("/notifications/me", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 알림 읽음 API
export const markAlarmsRead = async (ids) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.patch("/notifications/me/read", ids, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

// 알림 삭제 API
export const deleteAlarms = async (ids) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.delete("/notifications/me", {
    data: ids,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

// 알림 개수 조회 API
export const fetchUnreadAlarmCount = async () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.get("/notifications/me/unread-count", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};
