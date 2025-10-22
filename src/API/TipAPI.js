// TipAPI.js
import API_CONFIG from "./API_CONFIG";

// Tip 조회 API
export const fetchTips = async ({ page, size, sortOrder, keyword }) => {
  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
    sort: sortOrder === "최신순" ? "latest" : "popular",
  };

  const response = await API_CONFIG.get("/community", { params });
  return response.data;
};

// Tip 상세 조회
export const fetchTipDetail = async (tipId) => {
  const response = await API_CONFIG.get(`/community/${tipId}`);
  return response.data;
};

// 작성한 Tip 목록 조회
export const fetchMyTips = async ({ page, size, keyword }) => {
  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
  };

  const response = await API_CONFIG.get("/community/mine", { params });
  return response.data;
};

// 저장한 Tip 조회 API
export const fetchBookmarkedTips = async ({ page, size, keyword }) => {
  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
  };

  const response = await API_CONFIG.get("/community/bookmarked", { params });
  return response.data;
};

// Tip 생성 API
export const createTip = async (formData) => {
  const response = await API_CONFIG.post("/community", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Tip 수정 API
export const updateTip = async (tipId, formData) => {
  const response = await API_CONFIG.patch(`/community/${tipId}`, formData);
  return response.data;
};

// Tip 삭제 API
export const deleteTip = async (tipId) => {
  const response = await API_CONFIG.delete(`/community/${tipId}`);
  return response.data;
};

// Tip 댓글 조회
export const fetchTipComments = async (tipId, page = 0, size = 5) => {
  const params = { page: page - 1, size };
  const response = await API_CONFIG.get(`/community/${tipId}/comments`, {
    params,
  });
  return response.data;
};

// Tip 댓글 작성
export const addTipComment = async (tipId, content) => {
  await API_CONFIG.post(`/community/${tipId}/comments`, { content });
};

// Tip 댓글 수정
export const updateTipComment = async (commentId, content) => {
  await API_CONFIG.patch(`/community/comments/${commentId}`, { content });
};

// Tip 댓글 삭제
export const deleteTipComment = async (commentId) => {
  await API_CONFIG.delete(`/community/comments/${commentId}`);
};

// Tip 저장 토글 API
export const bookmarkTip = async (tipId) => {
  await API_CONFIG.post(`/community/${tipId}/bookmark`);
};

// Tip 반응 API
export const reactToTip = async (tipId, type) => {
  await API_CONFIG.post(`/community/${tipId}/reactions`, { type });
};

// Tip 이미지 미리보기 API
export const fetchTipImagePreview = async (filename) => {
  const safeFilename = filename.replace(/^\/files\//, "").replace(/ /g, "%20");
  const response = await API_CONFIG.get(
    `/notices/image-preview?filename=${safeFilename}`,
    { responseType: "blob" }
  );
  return response.data;
};
