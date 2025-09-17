import "./User.css";
import { useState } from "react";
import UserModal from "../../Component/Modal/UserModal";
import { userData } from "../../Data/Userdata";
import { FiEdit2 } from "react-icons/fi";

const User = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [activeTab, setActiveTab] = useState("major"); // 기본 전공 탭

  const handleOpenModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMode(null);
  };

  const handleSuccess = (data) => {
    console.log("수정된 데이터:", data);
    // TODO: setState 또는 API 연동
  };

  const gradeData = userData.grades[activeTab];

  return (
    <main className="user_layout">
      <section className="user_header">
        <h2 className="user_header_title">내 정보</h2>
      </section>

      <section className="user_body">
        <div className="user_info">
          {/* 내 정보 */}
          <div className="user_profile">
            <div className="user_profile_title">
              <h3>사용자 정보</h3>
              <FiEdit2
                className="user_icon"
                onClick={() => handleOpenModal("profile")}
              />
            </div>

            <div className="user_profile_container">
              <img src="/image/profile.png" className="user_profile_img" alt="" />

              <div className="user_profile_row">
                <span className="user_profile_label">이름</span>
                <span className="user_profile_value">{userData.name || ""}</span>
              </div>
              <div className="user_profile_row">
                <span className="user_profile_label">학과</span>
                <span className="user_profile_value">{userData.department || ""}</span>
              </div>
              <div className="user_profile_row">
                <span className="user_profile_label">학번</span>
                <span className="user_profile_value">{userData.studentId || ""}</span>
              </div>
              <div className="user_profile_row">
                <span className="user_profile_label">학기</span>
                <span className="user_profile_value">{userData.grade || ""}</span>
              </div>
               {/* 부전공: 있을 때만 표시 */}
              {userData.minor && (
                <div className="user_profile_row">
                  <span className="user_profile_label">부전공</span>
                  <span className="user_profile_value">{userData.minor}</span>
                </div>
              )}

              {/* 복수전공: 있을 때만 표시 */}
              {userData.double && (
                <div className="user_profile_row">
                  <span className="user_profile_label">복수전공</span>
                  <span className="user_profile_value">{userData.double}</span>
                </div>
              )}
            </div>
          </div>

          {/* 학점 정보 */}
          <div className="user_grade">
            <div className="user_grade_title">
              <h3>학점 정보</h3>
              <FiEdit2
                className="user_icon"
                onClick={() => handleOpenModal("grade")}
              />
            </div>

            {/* 탭 */}
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

            {/* 내용 */}
           <div className="user_grade_container">
            {activeTab === "major" && (
              <>
                <div className="user_grade_box">
                    <div className="user_grade_row">
                        <span className="user_grade_label">전공</span>
                        <span className="user_grade_value">{userData.grades.major.main}</span>
                    </div>
                    <div className="user_grade_row">
                        <span className="user_grade_label">기초전공</span>
                        <span className="user_grade_value">{userData.grades.major.basic}</span>
                    </div>
                    <div className="user_grade_row">
                        <span className="user_grade_label">교양필수</span>
                        <span className="user_grade_value">{userData.grades.major.required}</span>
                    </div>
                </div>

                <div className="user_grade_summary">
                    <div className="user_summary_row">
                    <span className="user_summary_label">총 이수학점</span>
                    <span className="user_summary_value">{userData.grades.major.total}</span>
                    </div>
                    <div className="user_summary_row">
                    <span className="user_summary_label">평점</span>
                    <span className="user_summary_value">{userData.grades.major.gpa}</span>
                    </div>
                </div>
                </>
            )}

            {activeTab === "minor" && (
                userData.grades.minor ? (
                <>
                    <div className="user_grade_box">
                        <div className="user_grade_row">
                            <span className="user_grade_label">부전공</span>
                            <span className="user_grade_value">{userData.grades.minor.main}</span>
                        </div>
                        <div className="user_grade_row">
                            <span className="user_grade_label">기초전공</span>
                            <span className="user_grade_value">{userData.grades.minor.basic}</span>
                        </div>
                        <div className="user_grade_row">
                            <span className="user_grade_label">교양필수</span>
                            <span className="user_grade_value">{userData.grades.minor.required}</span>
                        </div>
                    </div>

                    <div className="user_grade_summary">
                    <div className="user_summary_row">
                        <span className="user_summary_label">총 이수학점</span>
                        <span className="user_summary_value">{userData.grades.minor.total}</span>
                    </div>
                    <div className="user_summary_row">
                        <span className="user_summary_label">평점</span>
                        <span className="user_summary_value">{userData.grades.minor.gpa}</span>
                    </div>
                    </div>
                </>
                ) : (
                <p className="user_grade_empty">부전공 대상자가 아닙니다.</p>
                )
            )}

            {activeTab === "double" && (
                userData.grades.double ? (
                <>
                    <div className="user_grade_box">
                        <div className="user_grade_row">
                            <span className="user_grade_label">복수전공</span>
                            <span className="user_grade_value">{userData.grades.double.main}</span>
                        </div>
                        <div className="user_grade_row">
                            <span className="user_grade_label">기초전공</span>
                            <span className="user_grade_value">{userData.grades.double.basic}</span>
                        </div>
                        <div className="user_grade_row">
                            <span className="user_grade_label">교양필수</span>
                            <span className="user_grade_value">{userData.grades.double.required}</span>
                        </div>
                    </div>
                   

                    <div className="user_grade_summary">
                      <div className="user_summary_row">
                          <span className="user_summary_label">총 이수학점</span>
                          <span className="user_summary_value">{userData.grades.double.total}</span>
                      </div>
                      <div className="user_summary_row">
                          <span className="user_summary_label">평점</span>
                          <span className="user_summary_value">{userData.grades.double.gpa}</span>
                      </div>
                    </div>
                </>
                ) : (
                <p className="user_grade_empty">복수전공 대상자가 아닙니다.</p>
                )
            )}
            </div>
          </div>
        </div>
      </section>

      <UserModal
        open={isModalOpen}
        onCancel={handleCloseModal}
        initialData={modalMode === "profile" ? userData : userData.grades}
        mode={modalMode}
        onSuccess={handleSuccess}
      />
    </main>
  );
};

export default User;
