import axios from "axios";
import { message } from "antd";
import { AlarmCountState, userBriefState } from "../Recoil/Atom";
import { useSetRecoilState } from "recoil";

// Axios 인스턴스 생성
const API_CONFIG = axios.create({
  baseURL: "/route",
});

// ✅ 내부에서 바로 재발급 함수 정의
const reissueToken = async (accessToken, refreshToken) => {
  const response = await axios.post("/route/auth/reissue", {
    accessToken,
    refreshToken,
  });
  return response.data;
};

// ✅ Recoil 상태 초기화용 전역 참조
let setUnreadCount = null;
let setUserBrief = null;

// ✅ Recoil 상태를 외부에서 주입
export const injectRecoilSetters = (unreadSetter, userSetter) => {
  setUnreadCount = unreadSetter;
  setUserBrief = userSetter;
};

// ✅ 자동 로그아웃 함수 정의
const autoLogout = () => {
  try {
    // 세션/로컬 초기화
    sessionStorage.clear();
    localStorage.clear();

    // Recoil 상태 초기화
    if (setUnreadCount) setUnreadCount(0);
    if (setUserBrief) setUserBrief(null);

    // 알림
    message.warning("세션이 만료되었습니다. 다시 로그인해주세요.");

    // 로그인 페이지 이동
    window.location.href = "/login";
  } catch (err) {
    console.error("❌ 자동 로그아웃 처리 중 오류:", err);
  }
};

// ✅ 요청 인터셉터: accessToken 자동 추가
API_CONFIG.interceptors.request.use((config) => {
  if (config.authRequired !== false) {
    const token = sessionStorage.getItem("accessToken");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ✅ 응답 인터셉터: 401 발생 시 자동 재발급 → 실패 시 자동 로그아웃
API_CONFIG.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.authRequired !== false) {
      originalRequest._retry = true;

      try {
        const accessToken = sessionStorage.getItem("accessToken");
        const refreshToken = sessionStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("리프레시 토큰 없음");

        const data = await reissueToken(accessToken, refreshToken);

        // 새 토큰 저장
        sessionStorage.setItem("accessToken", data.accessToken);
        sessionStorage.setItem("refreshToken", data.refreshToken);

        // Authorization 갱신 후 재요청
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API_CONFIG(originalRequest);
      } catch (reissueError) {
        console.error("❌ 토큰 재발급 실패:", reissueError);
        autoLogout(); // 🔥 여기서 자동 로그아웃 호출
      }
    }

    return Promise.reject(error);
  }
);

export default API_CONFIG;
