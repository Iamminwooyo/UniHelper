import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { message } from "antd";
import { reissueToken, fetchImagePreview } from "./API/AccountAPI";
import { AlarmCountState, userBriefState } from "./Recoil/Atom";
import Layout from "./Component/Layout/Layout";

function AppContent() {
  const navigate = useNavigate();
  const setUnreadCount = useSetRecoilState(AlarmCountState);
  const setUserBrief = useSetRecoilState(userBriefState);

  // ✅ 로그아웃 처리 함수 (이 컴포넌트 안에서 직접 정의)
  const handleLogout = () => {
    try {
      // 세션/스토리지 초기화
      sessionStorage.clear();
      localStorage.clear();

      // Recoil 상태 초기화
      setUnreadCount(0);
      setUserBrief(null);

      // 알림 메시지
      message.warning("세션이 만료되었습니다. 다시 로그인해주세요.");

      // 로그인 페이지로 이동
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("❌ 로그아웃 처리 중 오류:", err);
    }
  };

  // ✅ 세션 정보 동기화 + 프로필 이미지 복원
  useEffect(() => {
    const syncUserBrief = async () => {
      const savedUser = sessionStorage.getItem("userBrief");
      if (!savedUser) return;
      const parsed = JSON.parse(savedUser);

      if (parsed.profileImage?.serverUrl) {
        try {
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

  // ✅ 토큰 재발급 주기적 수행
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
        } else {
          // 토큰이 없으면 즉시 로그아웃
          handleLogout();
        }
      } catch (err) {
        console.error("❌ 주기적 토큰 갱신 실패:", err);
        handleLogout();
      }
    }, 50 * 60 * 1000); // 50분마다 재발급

    return () => clearInterval(interval);
  }, []);

  return <Layout />;
}

export default AppContent;
