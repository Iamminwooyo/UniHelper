import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { reissueToken } from './API/AccountAPI'; 
import { handleLogout } from "./Utils/LogoutHelper";
import { AlarmCountState } from "./Recoil/Atom";
import Layout from './Component/Layout/Layout';

function AppContent() {
  const navigate = useNavigate();
  const setUnreadCount = useSetRecoilState(AlarmCountState);

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
    }, 3 * 60 * 1000); // ✅ 3분마다 실행

    return () => clearInterval(interval);
  }, [navigate, setUnreadCount]);

  return <Layout />;
}

export default AppContent;
