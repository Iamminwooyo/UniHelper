import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { reissueToken, fetchImagePreview } from "./API/AccountAPI";
import { handleLogout } from "./Utils/LogoutHelper";
import { AlarmCountState, userBriefState } from "./Recoil/Atom";
import Layout from "./Component/Layout/Layout";

function AppContent() {
  const navigate = useNavigate();
  const setUnreadCount = useSetRecoilState(AlarmCountState);
  const setUserBrief = useSetRecoilState(userBriefState);

  // 세션 정보 동기화 + 프로필 이미지 복원
  useEffect(() => {
    const syncUserBrief = async () => {
      const savedUser = sessionStorage.getItem("userBrief");
      if (!savedUser) return;
      const parsed = JSON.parse(savedUser);

      if (parsed.profileImage?.serverUrl) {
        try {
          // 📸 공지사항 방식 그대로 사용
          const blob = await fetchImagePreview(parsed.profileImage.serverUrl);
          const url = URL.createObjectURL(blob);
          setUserBrief({
            ...parsed,
            profileImage: { ...parsed.profileImage, url },
          });
        } catch (err) {
          console.error("❌ 프로필 이미지 복원 실패:", err);
          setUserBrief(parsed);
        }
      } else {
        setUserBrief(parsed);
      }
    };

    syncUserBrief();
    window.addEventListener("storage", syncUserBrief);
    return () => window.removeEventListener("storage", syncUserBrief);
  }, [setUserBrief]);

  // 토큰 재발급
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        const refreshToken = sessionStorage.getItem("refreshToken");

        if (accessToken && refreshToken) {
          const data = await reissueToken(accessToken, refreshToken);
          if (data?.accessToken) sessionStorage.setItem("accessToken", data.accessToken);
          if (data?.refreshToken) sessionStorage.setItem("refreshToken", data.refreshToken);
          console.log("✅ 토큰 갱신 완료");
        }
      } catch (err) {
        console.error("❌ 주기적 토큰 갱신 실패:", err);
        handleLogout(navigate, setUnreadCount);
      }
    }, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate, setUnreadCount]);

  return <Layout />;
}

export default AppContent;
