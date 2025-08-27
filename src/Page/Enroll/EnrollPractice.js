import "./Enroll.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TextModal from "../../Component/Modal/TextModal";
import EnrollModal from "../../Component/Modal/EnrollModal";
import { myRecords, myAverage, userAverage } from "../../Data/Enrolldata";

const EnrollPractice = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false); 
  const [mode, setMode] = useState(null);
  const [missionTime, setMissionTime] = useState(null);

  const navigate = useNavigate(); 

  useEffect(() => {
    const result = JSON.parse(sessionStorage.getItem("missionResult") || "null");
    if (result?.success) {
      setMode(result.mode);
      setMissionTime(result.time);
      setIsEnrollModalOpen(true);
    }
  }, []);

  

  // 모달 열기 함수
  const handleOpenModal = (mode) => {
    setMode(mode);
    setIsModalOpen(true);
  };

  // 모달 확인 함수
  const handleConfirm = () => {
    sessionStorage.setItem("practiceMode", mode); 
    setIsModalOpen(false);
    navigate("/enroll");  
  };

  return (
    <main className="enroll_layout">
      <section className="enroll_header">
        <h2 className="enroll_header_title">수강신청 연습</h2>
      </section>

      <section className="enroll_body">
        <div className="enroll_practice_container">
          <div className="enroll_practice_left">
            <div className="enroll_practice_mode" onClick={() => handleOpenModal("practicebasic")}>
              <h3>기본 수강신청</h3>
              <p>장바구니를 담지 않은 상태로 학과조회, 과목명 조회를 사용하여 연습합니다.</p>
            </div>

            <div className="enroll_practice_mode" onClick={() => handleOpenModal("practicebasket")}>
              <h3>장바구니 수강신청</h3>
              <p>장바구니를 담은 상태로 장바구니를 사용하여 연습합니다.</p>
            </div>
          </div>

          <div className="enroll_practice_right">
            <div className="enroll_practice_record">
              <h3>나의 기록</h3>

              <div className="enroll_practice_tab">
                <div className="enroll_practice_button">기본</div>
                <div className="enroll_practice_button">장바구니</div>
              </div>

              <div className="enroll_practice_record_list">
                {myRecords.basic.map((record, index) => (
                  <p key={record.id}>
                    <span className="enroll_practice_record_index">{index + 1}.</span>
                    <span className="enroll_practice_record_text">{record.date} - {record.time}초</span>
                  </p>
                ))}
              </div>

              <div className="enroll_practice_record_average">
                <span className="enroll_practice_record_label">내 평균 : </span>
                <span className="enroll_practice_record_value">{myAverage.basic}초</span>
              </div>
            </div>

            <div className="enroll_practice_average">
              <h3>사용자 평균 시간</h3>
              <div className="enroll_practice_average_time">
                <p>
                  <span className="enroll_practice_average_label">기본</span><br />
                  <span className="enroll_practice_average_value">{userAverage.basic}초</span>
                </p>
                <p>
                  <span className="enroll_practice_average_label">장바구니</span><br />
                  <span className="enroll_practice_average_value">{userAverage.basket}초</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="enroll_practice_warning">
          해당 서비스는 모의 수강신청으로 실제 수강신청이 아닙니다.
        </p>
      </section>

      <TextModal 
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        mode={mode}
        onConfirm={handleConfirm}   
      />

       <EnrollModal
        open={isEnrollModalOpen}
        onCancel={() => setIsEnrollModalOpen(false)}
        mode={mode}
        name="수강신청"
        title="수강신청 완료"
        time={missionTime}
        onConfirm={() => setIsEnrollModalOpen(false)}
      />
    </main>
  );
};

export default EnrollPractice;
