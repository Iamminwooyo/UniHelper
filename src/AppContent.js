import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { message } from "antd";
import { fetchImagePreview } from "./API/AccountAPI"; // reissueToken 제거
import { AlarmCountState, userBriefState } from "./Recoil/Atom";
import Layout from "./Component/Layout/Layout";

function AppContent() {
  const navigate = useNavigate();
  const setUnreadCount = useSetRecoilState(AlarmCountState);
  const setUserBrief = useSetRecoilState(userBriefState);

  // ✅ 로그아웃 처리 함수
  const handleLogout = () => {
    try {
      sessionStorage.clear();
      localStorage.clear();

      setUnreadCount(0);
      setUserBrief(null);

      message.warning("세션이 만료되었습니다. 다시 로그인해주세요.");
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

  // ✅ 일정 시간(예: 1시간) 후 자동 로그아웃
  useEffect(() => {
    const AUTO_LOGOUT_TIME = 2 * 60 * 1000; // 1시간 (단위: ms)
    const timer = setTimeout(() => {
      console.log("🕒 세션 만료로 자동 로그아웃");
      handleLogout();
    }, AUTO_LOGOUT_TIME);

    return () => clearTimeout(timer);
  }, []); // 마운트 시 1회 실행

  return <Layout />;
}

export default AppContent;
