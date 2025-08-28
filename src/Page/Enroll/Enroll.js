import "./Enroll.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DeptModal, SaveModal } from "../../Component/Modal/PracticeModal";
import { timeSlots } from "../../Data/Timedata";
import { courseData } from "../../Data/Enrolldata";
import { finishEnrollTimer, cancelEnrollTimer } from "../../API/EnrollAPI";
import { FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { FaDotCircle } from "react-icons/fa";

const Enroll = () => {
  const mode = sessionStorage.getItem("practiceMode");
  const [searchMode, setSearchMode] = useState("basket");
  const [appliedList, setAppliedList] = useState([]);
  const [cancelSet, setCancelSet] = useState(new Set());
  const [timetable, setTimetable] = useState({});

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  // ✅ missionCourses 불러오기
  const [missionCourses, setMissionCourses] = useState([]);

  // ✅ 조회 목록
  const [displayList, setDisplayList] = useState([]);

  // ✅ 저장/타이머 상태
  const [savedList, setSavedList] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(null);

  // ✅ 모달
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // 검색 조건 입력값
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [gradeFilter, setGradeFilter] = useState(""); 
  const [subjectKeyword, setSubjectKeyword] = useState("");

  const [hoverTopCourse, setHoverTopCourse] = useState(null);
  const [hoverBottomCourse, setHoverBottomCourse] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const mission = JSON.parse(sessionStorage.getItem("missionCourses") || "[]");
    setMissionCourses(mission);

    if (mode === "practicebasket") {
      setDisplayList(mission);
      setSearchMode("basket");
    } else {
      setDisplayList(
        courseData.filter(
         (c) =>
           c.department.includes("테스트학과") &&
           String(c.grade) === "1"
        )
      );
      setSearchMode("department");
      setDeptCode("3251"); 
      setDeptName("테스트학과");
      setGradeFilter("1");     
    }

    setStartTime(Date.now());
  }, [mode]);

  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(async () => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      if (diff > 30) {
        clearInterval(timer);

        try {
          await cancelEnrollTimer();
        } catch (err) {
          console.error("연습 취소 API 실패:", err);
        }

        sessionStorage.setItem("missionResult", JSON.stringify({
          success: false,
          reason: "timeout"
        }));

        navigate("/enroll/practice");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, navigate]);
  

  /// ✅ 과목 추가
  const handleAdd = (course) => {
    if (!appliedList.find((c) => c.code === course.code)) {
        setAppliedList([...appliedList, course]);

        const newTimetable = { ...timetable };
        const { day, start, end } = course.schedule[0];
        for (let i = start; i <= end; i++) {
        newTimetable[`${day}-${i}`] = course.code;
        }
        setTimetable(newTimetable);
    } else {
        window.alert("이미 수강신청한 과목입니다.");
    }
  };

  // ✅ 체크박스 토글
  const toggleCancel = (code) => {
    const newSet = new Set(cancelSet);
    newSet.has(code) ? newSet.delete(code) : newSet.add(code);
    setCancelSet(newSet);
  };

  // ✅ 조건검색
  const handleSearch = () => {
    if (mode === "practicebasic") {
      if (searchMode === "basket") {
        setDisplayList([]);
      } else if(searchMode === "department") {
        setDisplayList(
          courseData.filter(
            (c) =>
            (deptName === "" || c.department === deptName) &&
            (gradeFilter === "" || String(c.grade) === gradeFilter)
          )
        );
      } else if (searchMode === "subject") {
        if (!subjectKeyword.trim()) {
          window.alert("학수번호나 과목명을 입력하세요!");
          return;
        }
        setDisplayList(
          courseData.filter(
            (c) =>
            c.name.includes(subjectKeyword) || c.code.includes(subjectKeyword)
          )
        );
      }
    }
  };

  const handleSaveClick = () => {
    const confirmed = window.confirm("저장 하시겠습니까?");
    if (confirmed) {
      handleSave();
    } else {
      console.log("저장 취소됨");
    }
  };

  const handleDeleteImmediate = (course) => {
    const newTimetable = { ...timetable };
    const { day, start, end } = course.schedule[0];
    for (let i = start; i <= end; i++) {
      if (newTimetable[`${day}-${i}`] === course.code) {
        delete newTimetable[`${day}-${i}`];
      }
    }

    setTimetable(newTimetable);
    setAppliedList(appliedList.filter((c) => c.code !== course.code));
  };

  const handleSave = async () => {
    let newApplied = appliedList;

    if (cancelSet.size > 0) {
        const removedCourses = appliedList.filter((c) => cancelSet.has(c.code));

        const newTimetable = { ...timetable };
        removedCourses.forEach((course) => {
        const { day, start, end } = course.schedule[0];
        for (let i = start; i <= end; i++) {
            if (newTimetable[`${day}-${i}`] === course.code) {
            delete newTimetable[`${day}-${i}`];
            }
        }
        });
        setTimetable(newTimetable);

        newApplied = appliedList.filter((c) => !cancelSet.has(c.code));
        setAppliedList(newApplied);
        setCancelSet(new Set());
    }

    setSavedList(newApplied);

    // ✅ 1. 미션 판정
    let allMatched = false;
    if (mode === "practicebasket" || mode === "practicebasic") {
        allMatched =
        newApplied.length === missionCourses.length &&
        newApplied.every((c) => missionCourses.some((m) => m.code === c.code));
    }

    if (allMatched && !elapsedTime) {
      try {
        const apiMode = mode === "practicebasic" ? "BASIC"
                      : mode === "practicebasket" ? "CART"
                      : mode;           
        const result = await finishEnrollTimer(apiMode);

        sessionStorage.setItem("missionResult", JSON.stringify({
          success: true,
          time: result.measuredSeconds,
          mode: result.mode,
          finishedAt: result.finishedAt,
          diffVsOthers: result.diffVsOthersSeconds
        }));

        navigate("/enroll/practice");
        return;
      } catch (error) {
        console.error("미션 저장 API 실패:", error);
      }
    }

    setIsSaveModalOpen(true);
  };


  return (
    <main className="enroll_background">
      <section className="enroll_head">
        <h2 className="enroll_head_title">
          {mode === "practicebasket" ? "장바구니 수강신청" : "기본 수강신청"}
        </h2>
      </section>

      <section className="enroll_main">
        <div className="enroll_menu">
          <div className="enroll_menu_wrap">
            <select
              className="enroll_select"
              value={searchMode}
              onChange={(e) => {
                const value = e.target.value;
                setSearchMode(value);

                 if (value === "department") {
                    setDeptName("테스트학과");
                    setDeptCode("3251");
                    setGradeFilter("1");
                    } else if (value === "subject") {
                    setSubjectKeyword("");
                    } else if (value === "basket") {
                    
                    }
                }}        
                disabled={mode === "practicebasket"}
            >
              <option value="basket">장바구니</option>
              <option value="department">학과조회</option>
              <option value="subject">과목명조회</option>
            </select>

            {mode !== "practicebasket" && searchMode === "department" && (
              <div className="enroll_condition">
                <input
                  className="enroll_condition_code"
                  type="text"
                  placeholder="학과 코드"
                  value={deptCode}
                  readOnly
                />
               <div className="enroll_condition_name_wrap">
                <input
                    className="enroll_condition_name"
                    type="text"
                    placeholder="학과명"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                />
                {deptName && (
                    <button
                    type="button"
                    className="icon_btn clear_btn"
                    onClick={() => {
                        setDeptName("");
                        setDeptCode("");
                    }}
                    >
                    <IoClose />
                    </button>
                )}
                <button
                    type="button"
                    className="icon_btn search_btn"
                    onClick={() => setIsDeptModalOpen(true)} // 모달 열기
                >
                    <FaSearch />
                </button>
                </div>
                <select className="enroll_condition_grade" value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                  <option value="4">4학년</option>
                </select>
              </div>
            )}

            {/* ✅ 과목명조회 조건 */}
            {mode !== "practicebasket" && searchMode === "subject" && (
              <div className="enroll_condition">
                <input
                  className="enroll_condition_subject"
                  type="text"
                  placeholder="학수번호나 과목명을 입력하세요."
                  value={subjectKeyword}
                  onChange={(e) => setSubjectKeyword(e.target.value)}
                />
              </div>
            )}
          </div>
          <button className="enroll_search" onClick={handleSearch}>
            <FaSearch /> 조건검색
          </button>
        </div>

        <div className="enroll_container">
          {/* ✅ 좌측 영역 */}
          <div className="enroll_left">
            {/* 조회 목록 */}
            <div className="enroll_list">
              <div className="enroll_title">
                <FaDotCircle className="enroll_circle"/>
                <h3>수강신청 강좌 목록 조회 결과</h3>
                <span className="enroll_count">
                  <span style={{opacity:'0.5'}}>|</span> 총 <span style={{color:'red'}}>{displayList.length}</span>건
                </span>
              </div>
              <div className="enroll_scroll">
                <table>
                  <thead>
                    <tr>
                      <th>이수구분</th>
                      <th>학수번호</th>
                      <th>교과목명</th>
                      <th>학년</th>
                      <th>학점</th>
                      <th>담당교수</th>
                      <th>학과</th>
                      <th>선택</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayList.map((c, i) => (
                      <tr key={i}
                      onMouseEnter={() => setHoverTopCourse(c)}
                      onMouseLeave={() => setHoverTopCourse(null)}
                      >
                        <td>{c.division}</td>
                        <td>{c.code}</td>
                        <td>{c.name}</td>
                        <td>{c.grade}</td>
                        <td>{c.credit}</td>
                        <td>{c.professor}</td>
                        <td>{c.department}</td>
                        <td>
                          <button
                            className="enroll_plus"
                            onClick={() => handleAdd(c)}
                          >
                            +추가
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="enroll_help">
                <button>대체과목조회</button>
                <button>취득성적내역</button>
                <button>도움말</button>
                <button>수강신청확인서</button>
                <button>전수강신청내역조회</button>
              </div>
            </div>

            {/* 신청 목록 */}
            <div className="enroll_apply">
              <div className="enroll_title">
                <FaDotCircle className="enroll_circle"/>
                <h3>신청 목록</h3>
              </div>
              <div className="enroll_scroll">
                <table>
                  <thead>
                    <tr>
                      <th>이수구분</th>
                      <th>학수번호</th>
                      <th>교과목명</th>
                      <th>학년</th>
                      <th>학점</th>
                      <th>수강구분</th>
                      <th>재이수과목</th>
                      <th>취소</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedList.map((e, i) => (
                      <tr
                      key={i}
                      onMouseEnter={() => setHoverBottomCourse(e)}
                      onMouseLeave={() => setHoverBottomCourse(null)}
                      >
                        <td>{e.division}</td>
                        <td>{e.code}</td>
                        <td>{e.name}</td>
                        <td>{e.grade}</td>
                        <td>{e.credit}</td>
                        <td>{e.type}</td>
                        <td>{e.retake}</td>
                        <td>
                            {savedList.find((s) => s.code === e.code) ? (
                            <input
                                type="checkbox"
                                checked={cancelSet.has(e.code)}
                                onChange={() => toggleCancel(e.code)}
                            />
                            ) : (
                            <div
                                className="enroll_apply_cancle"
                                onClick={() => handleDeleteImmediate(e)}
                            >
                                x
                            </div>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="enroll_summary">
                <div className="enroll_summary_left">
                  <div className="enroll_summary_row">
                    <div className="enroll_summary_item">
                      <span className="enroll_summary_label">학적 세이브 학점:</span>
                      <span className="enroll_summary_value">3</span>
                    </div>
                    <div className="enroll_summary_item">
                      <span className="enroll_summary_label">4.0 이상 허용학점:</span>
                      <span className="enroll_summary_value">0</span>
                    </div>
                    <div className="enroll_summary_item">
                      <span className="enroll_summary_label">*총 <span style={{color:"blue"}}>신청학점</span></span>
                      <span className="enroll_summary_value" style={{color:"red", }}>
                        {appliedList.reduce((sum, e) => sum + e.credit, 0)}
                      </span>
                    </div>
                  </div>

                  <div className="enroll_summary_row">
                    <div className="enroll_summary_item">
                      <span className="enroll_summary_label">신청제한최저학점:</span>
                      <span className="enroll_summary_value">10</span>
                    </div>
                    <div className="enroll_summary_item">
                      <span className="enroll_summary_label">신청제한최고학점:</span>
                      <span className="enroll_summary_value">18</span>
                    </div>
                    <div className="enroll_summary_item">
                      <span className="enroll_summary_label">*총 <span style={{color:"blue"}}>신청과목</span>수:</span>
                      <span className="enroll_summary_value">
                        {appliedList.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="enroll_summary_right">
                  <button className="enroll_save" onClick={handleSaveClick}>
                    <span>저</span>
                    <span>장</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ 우측 시간표 */}
          <div className="enroll_time">
            <div className="enroll_title">
              <FaDotCircle className="enroll_circle"/>
              <h3>시간표</h3>
            </div>
            <div className="enroll_time_scroll">
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Time</th>
                    <th>월</th>
                    <th>화</th>
                    <th>수</th>
                    <th>목</th>
                    <th>금</th>
                    <th>야외1</th>
                    <th>야외2</th>
                    <th>야외3</th>
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, i) => (
                    <tr key={i}>
                      <td>{String(i + 1).padStart(2, "0")}</td>
                      <td>{time}</td>
                      {["월","화","수","목","금","야외1","야외2","야외3"].map((day) => (
                        <td
                        key={day}
                        className={
                            (hoverTopCourse &&
                            hoverTopCourse.schedule.some(
                                (s) => s.day === day && i + 1 >= s.start && i + 1 <= s.end
                            )
                            ? "highlight_top"
                            : ""
                            ) +
                            " " +
                            (hoverBottomCourse &&
                            hoverBottomCourse.schedule.some(
                                (s) => s.day === day && i + 1 >= s.start && i + 1 <= s.end
                            )
                            ? "highlight_bottom"
                            : ""
                            )
                        }
                        >
                        {timetable[`${day}-${i + 1}`] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <DeptModal
        open={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        setDeptName={setDeptName}
        setDeptCode={setDeptCode}
      />

     <SaveModal
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
    />
    </main>
  );
};

export default Enroll;
