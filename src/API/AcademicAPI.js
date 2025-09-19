import axios from "axios";

// 챗봇 질의응답 API
export const askChatbot = async (question) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await axios.post(
    "/chatbot/ask",
    { question },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data; 
};

// 챗봇 질문 기록 조회 API
export const fetchChatHistory = async (limit = 50) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await axios.get("/chatbot/history", {
    params: { limit },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

// 챗봇 질문 기록 상세조회 API
export const fetchChatHistoryDetail = async (id) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await axios.get(`/chatbot/history/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

// 폴더 목록 조회 API
export const fetchCollections = async () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await axios.get("/admin/processing/collections", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

// 파일 목록 조회
export const fetchFileTree = async () => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await axios.get("/admin/processing/files/tree", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data; 
};

// 파일 업로드 API
export const uploadFiles = async (formData, collectionName) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await axios.post(
    `/admin/processing/files?collection_name=${encodeURIComponent(collectionName)}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// 문의 목록 조회 API
export const fetchInquiries = async (page, size) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const params = {
    page: page - 1,
    size,
  };

  const response = await axios.get("/admin/inquiries", {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

// 문의 등록 API
export const createInquiry = async ({ title, content }) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await axios.post(
    "/inquiries",
    { title, content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

// 문의 삭제 API
export const deleteInquiries = async (ids) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await axios.delete("/admin/inquiries", {
    data: { pids: ids },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

// 학사정보 파일 다운로드 API
export const downloadFileById = async (id) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const response = await axios.get(`/admin/processing/files/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });

  return response.data;
};