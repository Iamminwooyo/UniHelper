import "./Enroll.css";
import { useRef, useState, useEffect } from "react";
import { timeSlots } from "../../Data/Timedata";
import { courseList, enrolledList, getEnrollGuideSteps } from "../../Data/Enrolldata"; 
import { Tour, ConfigProvider } from "antd"; 
import { FaSearch } from "react-icons/fa";
import { FaDotCircle } from "react-icons/fa";

const EnrollGuide = () => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const refs = {
    refSelect: useRef(null),
    refSearch: useRef(null),
    refCourseList: useRef(null),
    refAddButton: useRef(null),
    refApplyList: useRef(null),
    refSaveButton: useRef(null),
    refCancelCheckbox: useRef(null),
    refTimetable: useRef(null),
    refSummarySave: useRef(null),
    refSummaryAllow: useRef(null),
    refSummaryTotalCredit: useRef(null),
    refSummaryMin: useRef(null),
    refSummaryMax: useRef(null),
    refSummaryCount: useRef(null),
    refAlt: useRef(null),
    refGrade: useRef(null),
    refHelp: useRef(null),
    refConfirm: useRef(null),
    refAll: useRef(null),
  };

  // 가이드 시작 함수
  const startGuide = () => {
    setCurrent(0);
    setOpen(true);
  };

  // 렌더링 함수
  useEffect(() => {
    setOpen(true);
  }, []);

  const steps = getEnrollGuideSteps(refs);

  return (
    <main className="enroll_layout">
      <section className="enroll_header">
        <h2 className="enroll_header_title">수강신청 가이드</h2>
      </section>

      <section className="enroll_body">
        <div className="enroll_guide_button_wrapper">
          <button className="enroll_guide_button" onClick={startGuide}>
            가이드 시작
          </button>
        </div>
        <div className="enroll_guide_menu">
          <select className="enroll_guide_select" ref={refs.refSelect}>
            <option>장바구니</option>
            <option>학과조회</option>
            <option>과목명조회</option>
          </select>
          <button className="enroll_guide_search" ref={refs.refSearch}>
            <FaSearch/>
            조건검색
          </button>
        </div>

        <div className="enroll_guide_container">
          <div className="enroll_guide_left">
            <div className="enroll_guide_list" ref={refs.refCourseList}>
              <div className="enroll_guide_title">
                <FaDotCircle className="enroll_guide_circle"/>
                <h3>수강신청 강좌 목록 조회 결과</h3>
                <span className="enroll_guide_count">
                  | 총 {courseList.length}건
                </span>
              </div>
              <div className="enroll_guide_scroll">
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
                    {courseList.map((c, i) => (
                        <tr key={i}>
                        <td>{c.division}</td>
                        <td>{c.code}</td>
                        <td>{c.name}</td>
                        <td>{c.grade}</td>
                        <td>{c.credit}</td>
                        <td>{c.professor}</td>
                        <td>{c.department}</td>
                        <td>
                            <button className="enroll_guide_plus" ref={i === 1 ? refs.refAddButton : null}>+추가</button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>

              <div className="enroll_guide_help">
                <button ref={refs.refAlt}>대체과목조회</button>
                <button ref={refs.refGrade}>취득성적내역</button>
                <button ref={refs.refHelp}>도움말</button>
                <button ref={refs.refConfirm}>수강신청확인서</button>
                <button ref={refs.refAll}>전수강신청내역조회</button>
              </div>
            </div>

            <div className="enroll_guide_apply" ref={refs.refApplyList}>
              <div className="enroll_guide_title">
                <FaDotCircle className="enroll_guide_circle"/>
                <h3>신청 목록</h3>
              </div>
              <div className="enroll_guide_scroll">
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
                    {enrolledList.map((e, i) => (
                      <tr key={i}>
                      <td>{e.division}</td>
                      <td>{e.code}</td>
                      <td>{e.name}</td>
                      <td>{e.grade}</td>
                      <td>{e.credit}</td>
                      <td>{e.type}</td>
                      <td>{e.retake}</td>
                      <td>
                          <input type="checkbox" ref={i === 0 ? refs.refCancelCheckbox : null}/>
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="enroll_guide_summary">
                <div className="enroll_guide_summary_left">
                  <div className="enroll_guide_summary_row">
                    <div className="enroll_guide_summary_item"  ref={refs.refSummarySave}>
                      <span className="enroll_guide_summary_label">학적 세이브 학점:</span>
                      <span className="enroll_guide_summary_value">3</span>
                    </div>
                    <div className="enroll_guide_summary_item" ref={refs.refSummaryAllow}>
                      <span className="enroll_guide_summary_label">4.0 이상 허용학점:</span>
                      <span className="enroll_guide_summary_value">0</span>
                    </div>
                    <div className="enroll_guide_summary_item">
                      <span className="enroll_guide_summary_label" ref={refs.refSummaryTotalCredit}>총 신청학점</span>
                      <span className="enroll_guide_summary_value" >
                        {enrolledList.reduce((sum, e) => sum + e.credit, 0)}
                      </span>
                    </div>
                  </div>

                  <div className="enroll_guide_summary_row">
                    <div className="enroll_guide_summary_item" ref={refs.refSummaryMin}>
                      <span className="enroll_guide_summary_label">신청제한최저학점:</span>
                      <span className="enroll_guide_summary_value">10</span>
                    </div>
                    <div className="enroll_guide_summary_item" ref={refs.refSummaryMax}>
                      <span className="enroll_guide_summary_label">신청제한최고학점:</span>
                      <span className="enroll_guide_summary_value">18</span>
                    </div>
                    <div className="enroll_guide_summary_item" ref={refs.refSummaryCount}>
                      <span className="enroll_guide_summary_label">총 신청과목수:</span>
                      <span className="enroll_guide_summary_value">
                        {enrolledList.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="enroll_guide_summary_right">
                  <button className="enroll_guide_save" ref={refs.refSaveButton}>
                    <span>저</span>
                    <span>장</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="enroll_guide_time" ref={refs.refTimetable}>
            <div className="enroll_guide_title">
              <FaDotCircle className="enroll_guide_circle"/>
              <h3>시간표</h3>
            </div>
            <div className="enroll_guide_time_scroll">
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
                        <td></td><td></td><td></td><td></td><td></td>
                        <td></td><td></td><td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    <ConfigProvider
      locale={{
        Tour: {
          Next: "다음",
          Previous: "이전",
          Finish: "완료",
        },
      }}
    >
      <Tour
        open={open}
        current={current}
        onChange={(step) => setCurrent(step)}
        onClose={() => setOpen(false)}
        steps={steps}
      />
    </ConfigProvider>
    </main>
  );
};

export default EnrollGuide;
