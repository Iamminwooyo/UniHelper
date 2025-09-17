import axios from "axios";

// 알림 조회 API
export const fetchAlarm = async ({ page = 1, size = 10 }) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const params = {
    page: page - 1,
    size,
  };

  const response = await axios.get("/notifications/me", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 알림 읽음 API
export const markAlarmsRead = async (ids) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await axios.patch("/notifications/me/read", ids, {
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

  const response = await axios.delete("/notifications/me", {
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

  const response = await axios.get("/notifications/me/unread-count", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};