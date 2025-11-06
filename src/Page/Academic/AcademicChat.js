import { useState, useRef, useEffect } from "react";
import "./Academic.css";
import ChatModal from "../../Component/Modal/ChatModal";
import TimetableModal from "../../Component/Modal/TimetableModal";
import { askChatbot, fetchChatHistory, fetchChatHistoryDetail } from "../../API/AcademicAPI";
import { useRecoilState } from "recoil";
import { askingState } from "../../Recoil/Atom";
import { Collapse, Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";

const { Panel } = Collapse;

const AcademicChat = () => {
  const [messages, setMessages] = useState([
    { role: "bot", text: "무엇을 도와드릴까요? 😊" },
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQA, setSelectedQA] = useState(null);

   const [recommendModalOpen, setRecommendModalOpen] = useState(false);

  const [isAsking, setIsAsking] = useRecoilState(askingState);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const isFetchingDetailRef = useRef(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // 채팅 전송 함수
  const handleSend = async () => {
    if (!input.trim()) {
      message.error("질문을 입력해주세요.");
      return;
    }
    if (isAsking) {
      message.warning("이전 질문에 대한 답변을 기다려주세요.");
      return;
    }

    const userQuestion = input.trim();

    setMessages((prev) => [...prev, { role: "user", text: userQuestion }]);
    setInput("");
    setIsAsking(true);

    setMessages((prev) => [...prev, { role: "bot", text: "loading" }]);

    try {
      const res = await askChatbot(userQuestion);

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "bot",
          text: res.answer || "답변을 찾지 못했어요 🤔",
        };
        return newMessages;
      });
    } catch (err) {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "bot",
          text:
            err.response?.status === 502
              ? "502 Bad Gateway: 서버가 응답하지 않아요 😢"
              : "서버 오류가 발생했어요 😢",
        };
        return newMessages;
      });
    } finally {
      setIsAsking(false);
    }
  };

  // 채팅창 스크롤 이동 함수
  useEffect(() => {
    if (messages.length < 2) return;
    const lastIndex = messages.length - 2;

    if (messages[lastIndex]?.role === "user" && chatRef.current) {
      const questionEl = chatRef.current.children[lastIndex];
      if (questionEl) {
        const container = chatRef.current;
        const targetTop = questionEl.offsetTop - container.offsetTop;

        container.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
      }
    }
  }, [messages]);

  // 질문 변환 함수
  const formatUserQuestion = (apiQuestion) => {
    if (!apiQuestion) return "";

    // 전공/교양 판별
    const isMajor = apiQuestion.includes("전공") || apiQuestion.includes("기전");
    const isLiberal = apiQuestion.includes("교선") || apiQuestion.includes("교필");

    // 각 정보 추출
    const matchDept = apiQuestion.match(/'제목': '([^']+)'/);
    const matchCategory = apiQuestion.match(/'이수구분': '([^']+)'/);
    const matchDay = apiQuestion.match(/'강의시간': '([^']+)'/);
    const matchCredit = apiQuestion.match(/'학점': '([^']+)'/);
    const matchGrade = apiQuestion.match(/(\d학년)/);
    const matchTime = apiQuestion.match(/(\d+)\s*시간/);

    const department = matchDept?.[1] || "";
    const category = matchCategory?.[1] || "";
    const day = matchDay?.[1] ? `${matchDay[1]}요일` : "";
    const credit = matchCredit?.[1] ? `${matchCredit[1]}학점짜리` : "";
    const grade = matchGrade?.[1] || "";
    const time = matchTime?.[1] ? `${matchTime[1]}시간` : "";

    // 보기 좋은 형태로 조합
    let result = "";

    if (isMajor) {
      result = `${day} ${credit} ${grade} ${department} ${category} ${time} 수업 알려줘`;
    } else if (isLiberal) {
      result = `${day} ${credit} ${category} ${time} 수업 알려줘`;
    } else {
      result = apiQuestion.replace(/'[^']+':/g, "").replace(/'/g, "");
    }

    return result.trim();
  };

  // 지난 질문 조회 함수
  const loadHistory = async () => {
    if (loadingHistory) return;
    setLoadingHistory(true);
    try {
      const res = await fetchChatHistory(20);

      const formatted = (res || []).map(item => ({
        ...item,
        question: formatUserQuestion(item.question),
      }));

      setHistory(formatted);
    } catch (err) {
      message.error("최근 질문 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // 지난 질문 상세조회 함수
  const handleHistoryClick = async (msg) => {
    if (isFetchingDetailRef.current) return;
    isFetchingDetailRef.current = true;

    try {
      const detail = await fetchChatHistoryDetail(msg.id);

      const formattedDetail = {
        ...detail,
        question: formatUserQuestion(detail.question),
      };

      setSelectedQA(formattedDetail);
      setModalOpen(true);
    } catch (err) {
      message.error("질문 상세를 불러오지 못했습니다.");
    } finally {
      isFetchingDetailRef.current = false;
    }
  };

  // 시간표 추천 함수
  const handleTimetableRecommend = async (data) => {
  setRecommendModalOpen(false);

  // 1. 카테고리 변환
  let categoryMap = {
    전공: "전공",
    "기초전공": "기전",
    "교양선택": "교선",
    "교양필수": "교필",
  };

  const apiCategory = categoryMap[data.category] || data.category;

  // 2. 제목 결정
  let title = "";
  if (data.category === "전공" || data.category === "기초전공") {
    title = data.department;
  } else if (data.category === "교양선택") {
    title = data.liberalArea ? data.liberalArea.replace(/\s+/g, "") : "";
  } else if (data.category === "교양필수") {
    title = "교양필수";
  }

  // API용 요일
  const dayMapAPI = { 월요일: "월", 화요일: "화", 수요일: "수", 목요일: "목", 금요일: "금" };
  const dayShort = dayMapAPI[data.day] || data.day;

  // 유저용 요일
  const dayMapUser = { 월요일: "월요일", 화요일: "화요일", 수요일: "수요일", 목요일: "목요일", 금요일: "금요일" };
  const userDay = dayMapUser[data.day] || data.day;

  // 4. API에 보낼 문자열
  let apiQuestionParts = [];
  if (title) apiQuestionParts.push(`'제목': '${title}'`);
  if (apiCategory) apiQuestionParts.push(`'이수구분': '${apiCategory}'`);
  if (dayShort) apiQuestionParts.push(`'강의시간': '${dayShort}'`);
  if (data.credit) apiQuestionParts.push(`'학점': '${data.credit}'`);
  if (data.grade && (data.category === "전공" || data.category === "기초전공")) {
    apiQuestionParts.push(`${data.grade}`);
  }
  if (data.timePeriod) apiQuestionParts.push(`${data.timePeriod} 시간`);

  const apiQuestion = apiQuestionParts.join(", ") + "에 해당하는 수업 알려줘";

  // 5. 유저에게 보여줄 문자열
  let userQuestionParts = [];
  if (data.category === "전공" || data.category === "기초전공") {
    if (data.credit) userQuestionParts.push(`${data.credit}학점짜리`);
    if (data.department) userQuestionParts.push(`${data.department}`);
    if (data.grade) userQuestionParts.push(`${data.grade}`);
    userQuestionParts.push(data.category);
    if (data.day) userQuestionParts.push(`${userDay}`);
    if (data.timePeriod) userQuestionParts.push(`${data.timePeriod} 시간`);
  } else if (data.category === "교양선택") {
    if (data.liberalArea) userQuestionParts.push(`${data.liberalArea}`);
    if (data.credit) userQuestionParts.push(`${data.credit}학점짜리`);
    if (data.day) userQuestionParts.push(`${userDay}`);
    if (data.timePeriod) userQuestionParts.push(`${data.timePeriod} 시간`);
  } else if (data.category === "교양필수") {
    if (data.credit) userQuestionParts.push(`${data.credit}학점짜리`);
    userQuestionParts.push(data.category);
    if (data.day) userQuestionParts.push(`${userDay}`);
    if (data.timePeriod) userQuestionParts.push(`${data.timePeriod} 시간`);
  }

  const userQuestion = userQuestionParts.join(" ") + "에 해당하는 수업 알려줘";

  // 6. 먼저 유저에게 보여주기
  setMessages((prev) => [...prev, { role: "user", text: userQuestion }]);

  // 7. API 호출
  setIsAsking(true);
  setMessages((prev) => [...prev, { role: "bot", text: "loading" }]);

  try {
    const res = await askChatbot(apiQuestion);

    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = {
        role: "bot",
        text: res.answer || "추천 결과를 찾지 못했어요 🤔",
      };
      return newMessages;
    });
  } catch (err) {
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = {
        role: "bot",
        text:
          err.response?.status === 502
            ? "502 Bad Gateway: 서버가 응답하지 않아요 😢"
            : "서버 오류가 발생했어요 😢",
      };
      return newMessages;
    });
  } finally {
    setIsAsking(false);
  }
};



  return (
    <main className="academic_layout">
      <section className="academic_header">
        <h2 className="academic_header_title">학사정보 챗봇</h2>
      </section>

      <section className="academic_chat_body">
        <div className="academic_chat_warning">
          <Collapse defaultActiveKey={["1"]}>
            <Panel header="주의사항" key="1">
              <p>
                이 챗봇은 매 학기 종합정보서비스 종합강의시간표를 기준으로 답변을
                제공하며,
              </p>
              <p>각 질문은 개별로 처리되어 전에 했던 대화 내용이 이어지지 않습니다.</p>
              <p style={{color:'red'}}>잘못된 정보나 오답을 제공할 수 있으니, 반드시 추가 검증이 필요합니다.</p>
            </Panel>
          </Collapse>
        </div>

        <div className="academic_chat_container">
          <div className="academic_chat_main">
            <div className="academic_chat" ref={chatRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`academic_chat_row ${msg.role}`}>
                  {msg.role === "bot" && (
                    <img
                      src="/image/chatbot.png"
                      alt="bot"
                      className="academic_chat_avatar"
                    />
                  )}
                  <div className={`academic_chat_message ${msg.role}`}>
                    {msg.text === "loading" ? (
                      <span>
                        대답을 찾는 중...
                        <Spin
                          indicator={
                            <LoadingOutlined
                              style={{ color: "#78d900", marginLeft: "10px" }}
                              spin
                            />
                          }
                          size="small"
                        />
                      </span>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="academic_chat_recommend"
              onClick={() => setRecommendModalOpen(true)}
              // onClick={() => { message.open({ type: "info", content: "기능 추가 예정입니다. 다음에 이용해 주세요!", duration: 2.5,}); }}
            >
              <span>시간표 추천</span>
            </div>

            <div className="academic_chat_input">
              <input
                type="text"
                value={input}
                placeholder="질문을 입력하세요..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    handleSend();
                  }
                }}
              />
              <button onClick={handleSend}>전송</button>
              {isMobile && (
                <button onClick={() => setIsDrawerOpen(true)}> 지난 질문 </button>
              )}
            </div>
          </div>

          {!isMobile && (
            <div className="academic_chat_history">
              <h3>지난 질문 목록</h3>
              <div className="academic_chat_list">
                {loadingHistory ? (
                  <div className="academic_history_empty">불러오는 중...</div>
                ) : history.length === 0 ? (
                  <div className="academic_history_empty">
                    지난 질문이 없습니다.
                  </div>
                ) : (
                  history.map((msg) => (
                    <div
                      key={msg.id}
                      className="academic_chat_list_item"
                      onClick={() => handleHistoryClick(msg)}
                    >
                      {msg.question?.length > 12
                        ? msg.question.slice(0, 12) + "..."
                        : msg.question}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {isMobile && (
            <>
              <div
                className={`academic_history_mask ${
                  isDrawerOpen ? "open" : ""
                }`}
                onClick={() => setIsDrawerOpen(false)}
              ></div>
              <div
                className={`academic_history_panel ${
                  isDrawerOpen ? "open" : ""
                }`}
              >
                <div className="academic_history_panel_header">
                  지난 질문 목록
                </div>
                <div className="academic_chat_list">
                  {loadingHistory ? (
                    <div className="academic_history_empty">불러오는 중...</div>
                  ) : history.length === 0 ? (
                    <div className="academic_history_empty">
                      지난 질문이 없습니다.
                    </div>
                  ) : (
                    history.map((msg) => (
                      <div
                        key={msg.id}
                        className="academic_chat_list_item"
                        onClick={() => {
                          handleHistoryClick(msg);
                          setIsDrawerOpen(false);
                        }}
                      >
                        {msg.question?.length > 20
                          ? msg.question.slice(0, 20) + "..."
                          : msg.question}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {selectedQA && modalOpen && (
        <ChatModal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          qna={selectedQA}
        />
      )}

      {recommendModalOpen && (
        <TimetableModal
          open={recommendModalOpen}
          onCancel={() => setRecommendModalOpen(false)}
          onSuccess={handleTimetableRecommend}
        />
      )}
    </main>
  );
};

export default AcademicChat;