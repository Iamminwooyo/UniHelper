import API_CONFIG from "./API_CONFIG";

// ✅ 챗봇 질의응답 API
export const askChatbot = async (question) => {
  const response = await API_CONFIG.post("/chatbot/ask", { question });
  return response.data;
};

// ✅ 챗봇 질문 기록 조회 API
export const fetchChatHistory = async (limit = 50) => {
  const response = await API_CONFIG.get("/chatbot/history", {
    params: { limit },
  });
  return response.data;
};

// ✅ 챗봇 질문 기록 상세조회 API
export const fetchChatHistoryDetail = async (id) => {
  const response = await API_CONFIG.get(`/chatbot/history/${id}`);
  return response.data;
};

// ✅ 폴더 목록 조회 API
export const fetchCollections = async () => {
  const response = await API_CONFIG.get("/admin/processing/collections");
  return response.data;
};

// ✅ 파일 목록 조회
export const fetchFileTree = async () => {
  const response = await API_CONFIG.get("/admin/processing/files/tree");
  return response.data;
};

// ✅ 파일 업로드 API
export const uploadFiles = async (formData, collectionName) => {
  const response = await API_CONFIG.post(
    `/admin/processing/files?collection_name=${encodeURIComponent(collectionName)}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

// ✅ 문의 목록 조회 API
export const fetchInquiries = async (page, size) => {
  const response = await API_CONFIG.get("/admin/inquiries", {
    params: { page: page - 1, size },
  });
  return response.data;
};

// ✅ 문의 등록 API
export const createInquiry = async ({ title, content }) => {
  const response = await API_CONFIG.post("/inquiries", { title, content });
  return response.data;
};

// ✅ 문의 삭제 API
export const deleteInquiries = async (ids) => {
  const response = await API_CONFIG.delete("/admin/inquiries", {
    data: { pids: ids },
  });
  return response.data;
};

// ✅ 학사정보 파일 다운로드 API
export const downloadFileById = async (id) => {
  const response = await API_CONFIG.get(`/admin/processing/files/${id}/download`, {
    responseType: "blob",
  });
  return response.data;
};

// ✅ 문의 프로필 이미지 API
export const fetchInquriesImagePreview = async (filename) => {
  const safeFilename = filename.replace(/^\/files\//, "").replace(/ /g, "%20");

  const response = await API_CONFIG.get(`/notices/download?filename=${safeFilename}`, {
    responseType: "blob",
  });
  return response.data;
};
