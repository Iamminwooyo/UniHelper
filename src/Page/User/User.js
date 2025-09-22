import "./User.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { userBriefState } from "../../Recoil/Atom";
import { useMediaQuery } from "react-responsive"
import UserModal from "../../Component/Modal/UserModal";
import { fetchMyPageInfo, fetchMyPageCredits, updateMyPageInfo, updateCredits, fetchProfileImagePreview } from "../../API/UserAPI";
import { message } from "antd";
import { FiEdit2 } from "react-icons/fi";

const User = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);

  const [userData, setUserData] = useState(null);

  const [isUserInfoFetching, setIsUserInfoFetching] = useState(false);
  const isUserInfoFetchingRef = useRef(false);

  const isUpdatingRef = useRef(false);

  const [credits, setCredits] = useState(null);
  const [isCreditsFetching, setIsCreditsFetching] = useState(false);

  const [activeTab, setActiveTab] = useState("major");

  const setUserBrief = useSetRecoilState(userBriefState);

  const savedUser = sessionStorage.getItem("userBrief");
  const user = savedUser ? JSON.parse(savedUser) : {};

  const isMobile = useMediaQuery({ maxWidth: 768 });

  // 사용자 정보 조회 함수
  const loadUserData = useCallback(async () => {
    if (isUserInfoFetchingRef.current) return;
    isUserInfoFetchingRef.current = true;
    setIsUserInfoFetching(true);

    try {
      const data = await fetchMyPageInfo();

      let profileUrl = "/image/profile.png";
      if (data?.profileImageUrl) {
        try {
          const blob = await fetchProfileImagePreview(data.profileImageUrl);
          profileUrl = URL.createObjectURL(blob);
        } catch (err) {
          console.error("❌ 프로필 이미지 불러오기 실패:", err);
        }
      }

      const mergedData = { ...data, profileUrl };
      setUserData(mergedData);
      return mergedData;
    } catch (error) {
      console.error("❌ 사용자 정보 불러오기 실패:", error);
    } finally {
      setIsUserInfoFetching(false);
      isUserInfoFetchingRef.current = false;
    }
  }, []);

  // 학점 정보 조회 함수
  const loadCredits = useCallback(async () => {
    if (isCreditsFetching) return;
    setIsCreditsFetching(true);

    try {
      const data = await fetchMyPageCredits();
      setCredits(data);
    } catch (err) {
      console.error("❌ 학점 정보 불러오기 실패:", err);
    } finally {
      setIsCreditsFetching(false);
    }
  }, []);

  // 렌더링 함수
  useEffect(() => {
    loadUserData();
    loadCredits();
  }, [loadUserData, loadCredits]);

  // 모달 열기 함수
  const handleOpenModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  // 모달 닫기 함수
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMode(null);
  };

  // 수정 함수
  const handleSuccess = async (data) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      if (modalMode === "profile") {
        const formData = new FormData();
        formData.append("payload", JSON.stringify({
          username: data.username,
          studentNumber: data.studentNumber,
          department: data.department,
          gradeLabel: data.gradeLabel,
          minor: data.minor,
          doubleMajor: data.doubleMajor,
        }));

        if (data.profileImageFile) {
          formData.append("profileImage", data.profileImageFile);
        } else if (data.profileImageUrl) {
          formData.append("profileImageUrl", data.profileImageUrl);
        } else {
        }

        await updateMyPageInfo(formData);
        message.success("내 정보가 수정되었습니다.");

       const updatedData = await loadUserData();
        if (updatedData) {
          const newUserBrief = {
            ...user,
            department: updatedData.department,
            student_number: updatedData.studentNumber,
            profileImage: { url: updatedData.profileUrl || "/image/profile.png" },
          };
          sessionStorage.setItem("userBrief", JSON.stringify(newUserBrief));
          setUserBrief(newUserBrief);
        }
      }

      if (modalMode === "grade") {
        const payload = {
          "전공": Number(data.major) || 0,
          "기초전공": Number(data.basicMajor) || 0,
          "교양필수": Number(data.generalRequired) || 0,
          "부/복수 전공": Number(data.linkedMajor) || 0,
          "부/복수 기초전공": Number(data.subMinor) || 0,
          "총 이수학점": Number(data.totalCredits) || 0,
          "평점": Number(data.gpa) || 0,
        };

        await updateCredits(payload);
        message.success("학점 정보가 수정되었습니다.");
        await loadCredits();
      }
    } catch (err) {
      message.error("수정 중 오류가 발생했습니다.");
    } finally {
      isUpdatingRef.current = false;
    }
  };

  return (
    <main className="user_layout">
      <section className="user_header">
        <h2 className="user_header_title">내 정보</h2>
      </section>

      <section className="user_body">
        <div className="user_info">
          <div className="user_profile">
            <div className="user_profile_title">
              <h3>사용자 정보</h3>
              <FiEdit2
                className="user_icon"
                onClick={() => handleOpenModal("profile")}
              />
            </div>

            <div className="user_profile_container">
              {isUserInfoFetching ? (
                <div className="user_profile_empty">불러오는 중...</div>
              ) : isMobile ? (
                <div className="user_profile_mobile">
                  <div className="user_profile_img_wrap">
                    <span className="user_profile_img_text">프로필 이미지</span>
                    <img
                      src={userData?.profileUrl || "/image/profile.png"}
                      className="user_profile_img"
                      alt="프로필"
                    />
                  </div>
                  <div className="user_profile_details">
                    <div className="user_profile_row">
                      <span className="user_profile_label">이름</span>
                      <span className="user_profile_value">{userData?.username || ""}</span>
                    </div>
                    <div className="user_profile_row">
                      <span className="user_profile_label">
                        {user.roleType === "STUDENT" ? "학과" : "부서"}
                      </span>
                      <span className="user_profile_value">{userData?.department || ""}</span>
                    </div>
                    {user.roleType === "STUDENT" && (
                      <>
                        <div className="user_profile_row">
                          <span className="user_profile_label">학번</span>
                          <span className="user_profile_value">{userData?.studentNumber || ""}</span>
                        </div>
                        <div className="user_profile_row">
                          <span className="user_profile_label">학기</span>
                          <span className="user_profile_value">{userData?.gradeLabel || ""}</span>
                        </div>
                        {userData?.minor && (
                          <div className="user_profile_row">
                            <span className="user_profile_label">부전공</span>
                            <span className="user_profile_value">{userData?.minor}</span>
                          </div>
                        )}
                        {userData?.doubleMajor && (
                          <div className="user_profile_row">
                            <span className="user_profile_label">복수전공</span>
                            <span className="user_profile_value">{userData?.doubleMajor}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <span className="user_profile_img_text">프로필 이미지</span>
                  <img
                    src={userData?.profileUrl || "/image/profile.png"}
                    className="user_profile_img"
                    alt="프로필"
                  />
                  <div className="user_profile_row">
                    <span className="user_profile_label">이름</span>
                    <span className="user_profile_value">{userData?.username || ""}</span>
                  </div>
                  <div className="user_profile_row">
                    <span className="user_profile_label">
                      {user.roleType === "STUDENT" ? "학과" : "부서"}
                    </span>
                    <span className="user_profile_value">{userData?.department || ""}</span>
                  </div>
                  {user.roleType === "STUDENT" && (
                    <>
                      <div className="user_profile_row">
                        <span className="user_profile_label">학번</span>
                        <span className="user_profile_value">{userData?.studentNumber || ""}</span>
                      </div>
                      <div className="user_profile_row">
                        <span className="user_profile_label">학기</span>
                        <span className="user_profile_value">{userData?.gradeLabel || ""}</span>
                      </div>
                      {userData?.minor && (
                        <div className="user_profile_row">
                          <span className="user_profile_label">부전공</span>
                          <span className="user_profile_value">{userData?.minor}</span>
                        </div>
                      )}
                      {userData?.doubleMajor && (
                        <div className="user_profile_row">
                          <span className="user_profile_label">복수전공</span>
                          <span className="user_profile_value">{userData?.doubleMajor}</span>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="user_grade">
            <div className="user_grade_title">
              <h3>학점 정보</h3>
              {user.roleType === "STUDENT" && (
                <FiEdit2
                  className="user_icon"
                  onClick={() => handleOpenModal("grade")}
                />
              )}
            </div>

            <div className="user_grade_tab">
              <button
                className={activeTab === "major" ? "active" : ""}
                onClick={() => setActiveTab("major")}
              >
                전공
              </button>
              <button
                className={activeTab === "minor" ? "active" : ""}
                onClick={() => setActiveTab("minor")}
              >
                부전공
              </button>
              <button
                className={activeTab === "double" ? "active" : ""}
                onClick={() => setActiveTab("double")}
              >
                복수전공
              </button>
            </div>

            <div className="user_grade_container">
              {isCreditsFetching ? (
                <p className="user_grade_empty">불러오는 중...</p>
              ) : user.roleType !== "STUDENT" ? (
                <p className="user_grade_empty">
                  {activeTab === "minor"
                    ? "부전공 대상자가 아닙니다."
                    : activeTab === "double"
                    ? "복수전공 대상자가 아닙니다."
                    : "전공 대상자가 아닙니다."}
                </p>
              ) : credits ? (
                ((activeTab === "minor" && !credits?.minorMinimumRequiredCredits) ||
                  (activeTab === "double" && !credits?.doubleMinimumRequiredCredits)) ? (
                  <p className="user_grade_empty">
                    {activeTab === "minor"
                      ? "부전공 대상자가 아닙니다."
                      : "복수전공 대상자가 아닙니다."}
                  </p>
                ) : (
                  <>
                    <div className="user_grade_box">
                      <div className="user_grade_row">
                        <span className="user_grade_label">
                          {activeTab === "major"
                            ? "전공"
                            : activeTab === "minor"
                            ? "부전공"
                            : "복수전공"}
                        </span>
                        <span className="user_grade_value">
                          {activeTab === "major"
                            ? `${credits?.majorCredits ?? 0} / ${credits?.requiredSingleMajorMinimumCredits ?? 0}`
                            : activeTab === "minor"
                            ? `${credits?.minorMinimumRequiredCredits ?? 0} / ${credits?.requiredMinorMinimumRequiredCredits ?? 0}`
                            : `${credits?.doubleMinimumRequiredCredits ?? 0} / ${credits?.requiredDoubleMinimumRequiredCredits ?? 0}`}
                        </span>
                      </div>

                      <div className="user_grade_row">
                        <span className="user_grade_label">기초전공</span>
                        <span className="user_grade_value">
                          {activeTab === "major"
                            ? `${credits?.basicMajorCredits ?? 0} / ${credits?.requiredBasicMajorCredits ?? 0}`
                            : activeTab === "minor"
                            ? `${credits?.minorBasicMajorCredits ?? 0} / ${credits?.requiredMinorBasicMajorCredits ?? 0}`
                            : `${credits?.doubleBasicMajorCredits ?? 0} / ${credits?.requiredDoubleBasicMajorCredits ?? 0}`}
                        </span>
                      </div>

                      <div className="user_grade_row">
                        <span className="user_grade_label">교양필수</span>
                        <span className="user_grade_value">
                          {`${credits?.generalRequiredCredits ?? 0} / ${credits?.requiredGeneralRequiredCredits ?? 0}`}
                        </span>
                      </div>
                    </div>

                    <div className="user_grade_summary">
                      <div className="user_summary_row">
                        <span className="user_summary_label">총 이수학점</span>
                        <span className="user_summary_value">
                          {`${credits?.totalCredits ?? 0} / ${credits?.requiredGraduationTotal ?? 0}`}
                        </span>
                      </div>
                      <div className="user_summary_row">
                        <span className="user_summary_label">평점</span>
                        <span className="user_summary_value">{credits?.gpa ?? 0}</span>
                      </div>
                    </div>
                  </>
                )
              ) : (
                <p className="user_grade_empty">데이터가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <UserModal
        open={isModalOpen}
        onCancel={handleCloseModal}
        initialData={modalMode === "profile" ? userData : null}
        mode={modalMode}
        onSuccess={handleSuccess}
      />
    </main>
  );
};

export default User;
