import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { reissueToken } from "./API/AccountAPI";
import { handleLogout } from "./Utils/LogoutHelper";
import { AlarmCountState, userBriefState } from "./Recoil/Atom";
import Layout from "./Component/Layout/Layout";

function AppContent() {
  const navigate = useNavigate();
  const setUnreadCount = useSetRecoilState(AlarmCountState);
  const setUserBrief = useSetRecoilState(userBriefState);

  // 1️⃣ 앱 시작 시 + sessionStorage 변경 시 userBrief 동기화
  useEffect(() => {
    const syncUserBrief = () => {
      const savedUser = sessionStorage.getItem("userBrief");
      if (savedUser) {
        setUserBrief(JSON.parse(savedUser));
      }
    };

    // 앱 로드시 즉시 실행
    syncUserBrief();

    // 세션스토리지 변경 감지 (로그인 시 userBrief가 바뀜)
    window.addEventListener("storage", syncUserBrief);

    // 정리
    return () => {
      window.removeEventListener("storage", syncUserBrief);
    };
  }, [setUserBrief]);

  // 2️⃣ 25분마다 토큰 재발급
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        const refreshToken = sessionStorage.getItem("refreshToken");

        if (accessToken && refreshToken) {
          const data = await reissueToken(accessToken, refreshToken);

          if (data?.accessToken) {
            sessionStorage.setItem("accessToken", data.accessToken);
          }
          if (data?.refreshToken) {
            sessionStorage.setItem("refreshToken", data.refreshToken);
          }

          console.log("✅ 토큰 갱신 완료");
        }
      } catch (err) {
        console.error("❌ 주기적 토큰 갱신 실패:", err);
        handleLogout(navigate, setUnreadCount);
      }
    }, 25 * 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate, setUnreadCount]);

  return <Layout />;
}

export default AppContent;
