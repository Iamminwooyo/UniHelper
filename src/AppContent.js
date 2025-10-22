import { useEffect } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { fetchImagePreview } from "./API/AccountAPI";
import { userBriefState } from "./Recoil/Atom";
import Layout from "./Component/Layout/Layout";

function AppContent() {
  const setUserBrief = useSetRecoilState(userBriefState);

  // 세션 정보 동기화 + 프로필 이미지 복원
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

  return <Layout />;
}

export default AppContent;
