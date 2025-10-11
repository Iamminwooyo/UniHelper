import API_CONFIG from './API_CONFIG';
import qs from "qs";

// 공지사항 조회 API
export const fetchNotices = async ({ page, size, keyword, departments }) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
    departments: departments?.length ? departments : undefined,
  };

  const response = await API_CONFIG.get("/notices", {
    params,
    headers: { Authorization: `Bearer ${token}` },
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return response.data;
};

// 공지사항 상세 조회 API
export const fetchNoticeDetail = async (noticeId) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.get(`/notices/${noticeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 작성한 공지사항 조회 API
export const fetchMyNotices = async ({ page, size, keyword }) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
  };

  const response = await API_CONFIG.get("/notices/me", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 구독한 공지사항 조회 API
export const fetchSubscribedNotices = async ({ page, size, keyword }) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
  };

  const response = await API_CONFIG.get("/notices/subscribed", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 구독한 특정 공지사항 조회 API
export const fetchAuthorNotices = async ({ authorId, page, size, keyword }) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
  };

  const response = await API_CONFIG.get(`/notices/author/${authorId}`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 구독 목록 조회 API
export const fetchSubscribedAuthors = async () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.get("/bookmarks/authors", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 공지사항 생성 API
export const createNotice = async (formData) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.post("/notices", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// 공지사항 수정 API
export const updateNotice = async (noticeId, formData) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.patch(`/notices/${noticeId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// 공지사항 삭제 API
export const deleteNotice = async (noticeId) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.delete(`/notices/${noticeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// 공지사항 구독 API
export const subscribeAuthor = async (authorId) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.post(`/bookmarks/${authorId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 공지사항 구독 취소 API
export const unsubscribeAuthor = async (authorId) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.delete(`/bookmarks/${authorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 공지사항 이미지 API
export const fetchNoticeImagePreview = async (filename) => {
  const token = sessionStorage.getItem("accessToken");
  const safe = filename.replace(/^\/files\//, "").split(" ").join("%20");

  const response = await API_CONFIG.get(`/notices/image-preview?filename=${safe}`, {
    responseType: "blob",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 공지사항 파일 다운로드 API
export const downloadNoticeFile = async (filename) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const encoded = encodeURIComponent(filename);

  const response = await API_CONFIG.get(`/notices/download?filename=${encoded}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });

  return response.data;
};