import { useState, useRef, useEffect } from "react";
import "./Academic.css";
import ChatModal from "../../Component/Modal/ChatModal";
import { Collapse, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const antIcon = (
  <LoadingOutlined style={{ fontSize: 18, color: "#78d900" }} spin />
);

const historyDummy = [
  { question: "개강일이 언제인가요?", answer: "2025년 3월 2일입니다." },
  { question: "종강일은 언제인가요?", answer: "2025년 6월 20일입니다." },
  { question: "수강신청 일정 알려주세요", answer: "수강신청은 2월 중순에 진행됩니다." },
  { question: "휴학은 어떻게 하나요?", answer: "휴학 신청은 학생 포털에서 가능합니다." },
  { question: "등록금 납부 일정은?", answer: "등록금 납부는 2월 초에 진행됩니다." },
  { question: "성적 열람은 언제?", answer: "성적 열람은 6월 말에 가능합니다." },
  { question: "계절학기 일정은?", answer: "계절학기는 7월 초에 시작됩니다." },
  { question: "복학 신청은?", answer: "복학 신청도 학생 포털에서 할 수 있습니다." },
  { question: "졸업 요건 알려주세요", answer: "졸업 요건은 전공 60학점 이상, 총 130학점 이상입니다." },
  { question: "지도 교수 상담은?", answer: "학기마다 1회 이상 지도교수 상담이 필요합니다." },
  { question: "영어 교양 필수 대체 자격증에 대해서 알려줘", answer: "영어 교양 필수 과목(English1·2 또는 구 영어연습1·2)을 대체할 수 있는 자격증(공인 영어 시험)과 그 기준은 다음과 같습니다.\n\n- TOEIC: 900점 이상 (만점 990점)\n- TOEFL iBT: 101점 이상 (만점 120점)\n- New TEPS: 480점 이상 (만점 600점)\n\n위의 기준 점수 이상을 취득하면 해당 영어 교양 필수 과목을 대체할 수 있으며, 학점 인정 점수는 95점, 등급은 A+로 인정됩니다.\n\n즉, 위의 공인 영어 시험에서 일정 점수 이상을 취득하면 영어 교양 필수 과목을 수강하지 않고도 이수한 것으로 인정받을 수 있습니다." },
  { question: "컴퓨터과학과 졸업 요건에 대해 알려줘", answer: "컴퓨터과학과 졸업 요건은 다음과 같습니다.\n\n1. 졸업이수학점: 총 130학점 이상 이수해야 합니다.\n2. 교양필수\n   - 2019학번 이전: 7학점 이상\n   - 2020학번: 11학점 이상\n   - 2021학번부터: 별도 기준 없음\n3. 교양선택\n   - 2024학번 이전: 16학점 이상\n   - 2025학번부터: 별도 기준 없음\n4. 기초전공(필수): 12학점 이상 이수\n5. 전문전공\n   - 단일전공자: 54학점 이상\n   - 부전공/복수/연계전공자: 33학점 이상\n6. 논문: 졸업을 위해 논문을 패스해야 하며, 논문 대체 시험 등은 학과에 문의해야 합니다.\n7. AI융합학부-AI 교과목을 반드시 수강해야 하며, 빅데이터 교과목을 이수할 경우 일반선택으로만 인정됩니다.\n\n자세한 이수구분별 성적현황은 학교 종합정보서비스에서 확인할 수 있습니다." },
];

const AcademicChat = () => {
  const [messages, setMessages] = useState([
    { role: "bot", text: "무엇을 도와드릴까요? 😊" },
  ]);
  const [input, setInput] = useState("");

  // 질문에만 ref 연결
  const questionRef = useRef(null);
  const chatRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQA, setSelectedQA] = useState(null);

  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);

  // 질문 전송 핸들러
  const handleSend = () => {
    if (!input.trim()) return;

    const userQuestion = input.trim();
    const found = historyDummy.find((item) => item.question === userQuestion);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userQuestion },
      {
        role: "bot",
        text: found ? found.answer : "이건 데모용 답변이에요 😎",
      },
    ]);

    setInput("");
  };

  // ✅ 새로운 질문이 추가되면 질문을 맨 위로 스크롤
  // ✅ 새로운 질문이 추가되면 채팅창 맨 위로 스크롤
  useEffect(() => {
    if (messages.length < 2) return;
    const lastIndex = messages.length - 2; // 직전 메시지 = 질문

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


  // 하드코딩된 데이터 5개씩 잘라서 로드
  const fetchHistory = async (page) => {
    const pageSize = 5;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const slice = historyDummy.slice(start, end);

    if (slice.length === 0) {
      setHasMore(false);
      return;
    }

    setHistory((prev) => [...prev, ...slice]);
  };

  useEffect(() => {
    if (hasMore) fetchHistory(page);
  }, [page]);

  // 무한 스크롤 감지
  useEffect(() => {
    if (!loader.current || !hasMore) return;

    let timer = null;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !timer) {
        timer = setTimeout(() => {
          setPage((prev) => prev + 1);
          timer = null;
        }, 300);
      }
    });

    observer.observe(loader.current);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [hasMore]);

  const handleHistoryClick = (msg) => {
    setSelectedQA(msg);
    setModalOpen(true);
  };

  return (
    <main className="academic_layout">
      <section className="academic_header">
        <h2 className="academic_header_title">학사정보 챗봇</h2>
      </section>

      <section className="academic_chat_body">
        <div className="academic_chat_warning">
          <Collapse>
            <Panel header="주의사항" key="1">
              <p>이 챗봇은 매 학기 종합정보서비스 종합강의시간표를 기준으로 답변을 제공합니다.</p>
              <p>각 질문은 개별로 전에 했던 대화 내용이 이어지지 않습니다.</p>
            </Panel>
          </Collapse>
        </div>

        <div className="academic_chat_container">
          {/* 채팅 */}
          <div className="academic_chat_main">
            <div className="academic_chat" ref={chatRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`academic_chat_row ${msg.role}`}>
                  {msg.role === "bot" && (
                    <img src="/image/chatbot.png" alt="bot" className="academic_chat_avatar" />
                  )}
                  <div className={`academic_chat_message ${msg.role}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="academic_chat_input">
              <input
                type="text"
                value={input}
                placeholder="질문을 입력하세요..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend}>전송</button>
            </div>
          </div>

          {/* 기록 */}
          <div className="academic_chat_history">
            <h3>최근 질문 목록</h3>
            <div className="academic_chat_list">
              {history.map((msg, idx) => (
                <div
                  key={idx}
                  className="academic_chat_list_item"
                  onClick={() => handleHistoryClick(msg)}
                >
                  {msg.question.length > 12
                    ? msg.question.slice(0, 12) + "..."
                    : msg.question}
                </div>
              ))}

              {hasMore && (
                <div ref={loader} className="academic_chat_loader">
                  <Spin indicator={antIcon} size="small" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedQA && modalOpen && (
        <ChatModal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          qna={selectedQA}
        />
      )}
    </main>
  );
};

export default AcademicChat;
