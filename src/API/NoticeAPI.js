// NoticeAPI.js
import API_CONFIG from "./API_CONFIG";
import qs from "qs";

// 공지사항 조회 API
export const fetchNotices = async ({ page, size, keyword, departments }) => {
  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
    departments: Array.isArray(departments)
      ? departments.join(",")
      : departments || undefined,
  };

  const response = await API_CONFIG.get("/notices", {
    params,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return response.data;
};

// 공지사항 상세 조회 API
export const fetchNoticeDetail = async (noticeId) => {
  const response = await API_CONFIG.get(`/notices/${noticeId}`);
  return response.data;
};

// 작성한 공지사항 조회 API
export const fetchMyNotices = async ({ page, size, keyword }) => {
  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
  };

  const response = await API_CONFIG.get("/notices/me", { params });
  return response.data;
};

// 구독한 공지사항 조회 API
export const fetchSubscribedNotices = async ({ page, size, keyword }) => {
  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
  };

  const response = await API_CONFIG.get("/notices/subscribed", { params });
  return response.data;
};

// 구독한 특정 공지사항 조회 API
export const fetchAuthorNotices = async ({ authorId, page, size, keyword }) => {
  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
  };

  const response = await API_CONFIG.get(`/notices/author/${authorId}`, {
    params,
  });

  return response.data;
};

// 구독 목록 조회 API
export const fetchSubscribedAuthors = async () => {
  const response = await API_CONFIG.get("/bookmarks/authors");
  return response.data;
};

// 공지사항 생성 API
export const createNotice = async (formData) => {
  const response = await API_CONFIG.post("/notices", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// 공지사항 수정 API
export const updateNotice = async (noticeId, formData) => {
  const response = await API_CONFIG.patch(`/notices/${noticeId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// 공지사항 삭제 API
export const deleteNotice = async (noticeId) => {
  const response = await API_CONFIG.delete(`/notices/${noticeId}`);
  return response.data;
};

// 공지사항 구독 API
export const subscribeAuthor = async (authorId) => {
  const response = await API_CONFIG.post(`/bookmarks/${authorId}`);
  return response.data;
};

// 공지사항 구독 취소 API
export const unsubscribeAuthor = async (authorId) => {
  const response = await API_CONFIG.delete(`/bookmarks/${authorId}`);
  return response.data;
};

// 공지사항 이미지 미리보기 API
export const fetchNoticeImagePreview = async (filename) => {
  const safe = filename.replace(/^\/files\//, "").split(" ").join("%20");

  const response = await API_CONFIG.get(
    `/notices/image-preview?filename=${safe}`,
    { responseType: "blob" }
  );
  return response.data;
};

// 공지사항 파일 다운로드 API
export const downloadNoticeFile = async (filename) => {
  const encoded = encodeURIComponent(filename);

  const response = await API_CONFIG.get(
    `/notices/download?filename=${encoded}`,
    { responseType: "blob" }
  );

  return response.data;
};
