import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { reissueToken } from "./API/AccountAPI";
import { handleLogout } from "./Utils/LogoutHelper";
import { AlarmCountState, userBriefState } from "./Recoil/Atom"; // ✅ userBriefState import
import Layout from "./Component/Layout/Layout";

function AppContent() {
  const navigate = useNavigate();
  const setUnreadCount = useSetRecoilState(AlarmCountState);
  const setUserBrief = useSetRecoilState(userBriefState); // ✅ recoil setter

  // 1️⃣ 앱 시작 시 세션스토리지에 있는 유저 정보 복원
  useEffect(() => {
    const savedUser = sessionStorage.getItem("userBrief");
    if (savedUser) {
      setUserBrief(JSON.parse(savedUser));
    }
  }, [setUserBrief]);

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

          console.log("토큰 갱신 완료");
        }
      } catch (err) {
        console.error("주기적 토큰 갱신 실패", err);
        handleLogout(navigate, setUnreadCount);
      }
    }, 25 * 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate, setUnreadCount]);

  return <Layout />;
}

export default AppContent;
