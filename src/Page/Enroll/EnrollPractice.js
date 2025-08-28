import "./Enroll.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TextModal from "../../Component/Modal/TextModal";
import EnrollModal from "../../Component/Modal/EnrollModal";
import { fetchEnrollRecords, fetchAverageEnrollStats, startEnrollTimer } from "../../API/EnrollAPI"; 
import { message } from "antd";

const EnrollPractice = () => {
  const [selectedTab, setSelectedTab] = useState("BASIC");

  const isFetchingRef = useRef(false);
  const [isFetchingRecords, setIsFetchingRecords] = useState(false);
  const [records, setRecords] = useState([]);  
  const [myAvg, setMyAvg] = useState(null); 

  const [isFetchingAvg, setIsFetchingAvg] = useState(false);
  const [userAvg, setUserAvg] = useState({ basicAverageSeconds: null, cartAverageSeconds: null });

  const [mode, setMode] = useState(null);

  const [missionDiff, setMissionDiff] = useState(null);
  const [missionFinishedAt, setMissionFinishedAt] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false); 
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);

  const [missionTime, setMissionTime] = useState(null);

  const navigate = useNavigate(); 

  // 내 기록 조회 함수
  useEffect(() => {
    const loadRecords = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsFetchingRecords(true);

      try {
        const recordData = await fetchEnrollRecords(selectedTab);
        setRecords(recordData.items || []);
        setMyAvg(recordData.myRecent5Average ?? null);
      } catch (error) {
        console.error("내 기록 불러오기 실패:", error);
        message.error("내 기록을 불러오는데 실패했습니다.");
      } finally {
        setIsFetchingRecords(false);
        isFetchingRef.current = false;
      }
    };
    loadRecords();
  }, [selectedTab]);

  // 사용자 평균 조회 함수
  useEffect(() => {
    const loadAvg = async () => {
      setIsFetchingAvg(true);
      try {
        const avgData = await fetchAverageEnrollStats();
        setUserAvg(avgData);
      } catch (error) {
        console.error("사용자 평균 불러오기 실패:", error);
        message.error("사용자 평균을 불러오는데 실패했습니다.");
      } finally {
        setIsFetchingAvg(false);
      }
    };
    loadAvg();
  }, []);

  // 성공 / 실패 모달 열기 함수
  useEffect(() => {
    console.log("📌 missionResult:", sessionStorage.getItem("missionResult"));
    const result = JSON.parse(sessionStorage.getItem("missionResult") || "null");
    if (result) {
      if (result.success) {
        setMode(result.mode);
        setMissionTime(result.time);
        setMissionDiff(result.diffVsOthers);
        setMissionFinishedAt(result.finishedAt);
        setIsEnrollModalOpen(true);
      } else if (result.reason === "timeout") {
        setMode("practicefail");
        setIsFailModalOpen(true);
      }
    }
  }, []);

  // 모달 열기 함수
  const handleOpenModal = (mode) => {
    setMode(mode);
    setIsModalOpen(true);
  };

  // 수강신청 연습 시작 함수
  const handleConfirm = async () => {
    try {
      await startEnrollTimer();

      sessionStorage.setItem("practiceMode", mode); 
      setIsModalOpen(false);
      navigate("/enroll");  
    } catch (error) {
      console.error("타이머 시작 실패:", error);
      alert("연습을 시작할 수 없습니다. 다시 시도해주세요.");
    }
  };

  // 날짜 변환 함수
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
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
                  <div 
                    className={`enroll_practice_button ${selectedTab === "BASIC" ? "active" : ""}`} 
                    onClick={() => setSelectedTab("BASIC")}
                  >
                    기본
                  </div>
                  <div 
                    className={`enroll_practice_button ${selectedTab === "CART" ? "active" : ""}`} 
                    onClick={() => setSelectedTab("CART")}
                  >
                    장바구니
                  </div>
              </div>

               {isFetchingRecords ? (
                  <p className="enroll_practice_empty">불러오는 중...</p>
                ) : records.length === 0 ? (
                  <p className="enroll_practice_empty">기록이 존재하지 않습니다.</p>
                ) : (
                  <>
                    <div className="enroll_practice_record_list">
                      {records.map((record, index) => (
                        <p key={index}>
                          <span className="enroll_practice_record_index">{index + 1}.</span>
                          <span className="enroll_practice_record_text">
                            {formatDate(record.finishedAt)} - {record.durationSeconds}초
                          </span>
                        </p>
                      ))}
                    </div>

                    <div className="enroll_practice_record_average">
                      <span className="enroll_practice_record_label">내 평균 : </span>
                      <span className="enroll_practice_record_value">
                        {myAvg && myAvg > 0 ? `${myAvg}초` : "기록 없음"}
                      </span>
                    </div>
                  </>
                )}
            </div>

            <div className="enroll_practice_average">
              <h3>사용자 평균 시간</h3>
              {isFetchingAvg ? (
                <p className="enroll_practice_empty">불러오는 중...</p>
              ) : (!userAvg.basicAverageSeconds && !userAvg.cartAverageSeconds) ? (
                <p className="enroll_practice_empty">기록이 존재하지 않습니다.</p>
              ) : (
                <div className="enroll_practice_average_time">
                  <p>
                    <span className="enroll_practice_average_label">기본</span><br />
                    <span className="enroll_practice_average_value">
                      {userAvg.basicAverageSeconds && userAvg.basicAverageSeconds > 0
                        ? `${userAvg.basicAverageSeconds}초`
                        : "기록 없음"}
                    </span>
                  </p>
                  <p>
                    <span className="enroll_practice_average_label">장바구니</span><br />
                    <span className="enroll_practice_average_value">
                      {userAvg.cartAverageSeconds && userAvg.cartAverageSeconds > 0
                        ? `${userAvg.cartAverageSeconds}초`
                        : "기록 없음"}
                    </span>
                  </p>
                </div>
              )}
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
        time={missionTime}
        diffVsOthers={missionDiff}
        finishedAt={missionFinishedAt}
        onConfirm={() => setIsEnrollModalOpen(false)}
      />

      <TextModal
        open={isFailModalOpen}
        onCancel={() => {
          setIsFailModalOpen(false);
          sessionStorage.removeItem("missionResult");
        }}
        mode={mode}
      />
    </main>
  );
};

export default EnrollPractice;
