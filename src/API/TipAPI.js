import API_CONFIG from './API_CONFIG';

// Tip 조회 API
export const fetchTips = async ({ page, size, sortOrder, keyword }) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
    sort: sortOrder === "최신순" ? "latest" : "popular",
  };

  const response = await API_CONFIG.get("/community", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// Tip 상세 조회
export const fetchTipDetail = async (tipId) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.get(`/community/${tipId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 작성한 Tip 목록 조회
export const fetchMyTips = async ({ page, size, keyword }) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
  };

  const response = await API_CONFIG.get("/community/mine", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 저장한 Tip 조회 API
export const fetchBookmarkedTips = async ({ page, size, keyword }) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const params = {
    page: page - 1,
    size,
    keyword: keyword?.trim() || undefined,
  };

  const response = await API_CONFIG.get("/community/bookmarked", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// Tip 생성 API
export const createTip = async (formData) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.post("/community", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Tip 수정 API
export const updateTip = async (tipId, formData) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.patch(`/community/${tipId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Tip 삭제 API
export const deleteTip = async (tipId) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await API_CONFIG.delete(`/community/${tipId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// Tip 댓글 조회
export const fetchTipComments = async (tipId, page = 0, size = 5) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const params = {
    page: page - 1,
    size,
  };

  const response = await API_CONFIG.get(`/community/${tipId}/comments`, {
    params,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });

  return response.data;
};

// Tip 댓글 작성
export const addTipComment = async (tipId, content) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  await API_CONFIG.post(
    `/community/${tipId}/comments`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Tip 댓글 수정
export const updateTipComment = async (commentId, content) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  await API_CONFIG.patch(
    `/community/comments/${commentId}`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Tip 댓글 삭제
export const deleteTipComment = async (commentId) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  await API_CONFIG.delete(`/community/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Tip 저장 토글 API
export const bookmarkTip = async (tipId) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  await API_CONFIG.post(`/community/${tipId}/bookmark`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Tip 반응 API
export const reactToTip = async (tipId, type) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  await API_CONFIG.post(
    `/community/${tipId}/reactions`,
    { type },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Tip 이미지 API
export const fetchTipImagePreview = async (filename) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const safeFilename = filename.replace(/^\/files\//, "").replace(/ /g, "%20");

  const response = await API_CONFIG.get(`/notices/image-preview?filename=${safeFilename}`, {
    responseType: "blob",
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};
