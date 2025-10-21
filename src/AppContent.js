import { useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { message } from "antd";
import { fetchImagePreview } from "./API/AccountAPI";
import { AlarmCountState, userBriefState } from "./Recoil/Atom";
import Layout from "./Component/Layout/Layout";

function AppContent() {
  const navigate = useNavigate();
  const setUnreadCount = useSetRecoilState(AlarmCountState);
  const setUserBrief = useSetRecoilState(userBriefState);
  const userBrief = useRecoilValue(userBriefState);

  // ✅ 로그아웃 처리 함수
  const handleLogout = () => {
    try {
      sessionStorage.clear();
      localStorage.clear();

      setUnreadCount(0);
      setUserBrief(null);

      message.warning("세션이 만료되었습니다. 다시 로그인해주세요.");
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

  // ✅ 일정 시간(2분) 후 자동 로그아웃
  useEffect(() => {
    const AUTO_LOGOUT_TIME = 1 * 60 * 1000; // 2분
    const timer = setTimeout(() => {
      console.log("🕒 세션 만료로 자동 로그아웃");
      handleLogout();
    }, AUTO_LOGOUT_TIME);

    return () => clearTimeout(timer);
  }, []);

  // ✅ userBrief 없으면 로그인 페이지로 이동
  if (!userBrief) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}

export default AppContent;
