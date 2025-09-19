import { useState, useRef, useEffect } from "react";
import "./Academic.css";
import ChatModal from "../../Component/Modal/ChatModal";
import { askChatbot, fetchChatHistory, fetchChatHistoryDetail } from "../../API/AcademicAPI";
import { useRecoilState } from "recoil";
import { askingState } from "../../Recoil/Atom";
import { Collapse, Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const antIcon = (
  <LoadingOutlined style={{ fontSize: 18, color: "#78d900" }} spin />
);

const AcademicChat = () => {
  const [messages, setMessages] = useState([
    { role: "bot", text: "무엇을 도와드릴까요? 😊" },
  ]);
  const [input, setInput] = useState("");

  const chatRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQA, setSelectedQA] = useState(null);

  const [isAsking, setIsAsking] = useRecoilState(askingState);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 질문 전송 핸들러
  const handleSend = async () => {
    if (!input.trim()) return;
    if (isAsking) {
      message.warning("이전 질문에 대한 답변을 기다려주세요 🙏");
      return;
    }

    const userQuestion = input.trim();
    console.log("📤 보내는 질문:", userQuestion);

    setMessages((prev) => [...prev, { role: "user", text: userQuestion }]);
    setInput("");
    setIsAsking(true);

    // ✅ 임시 로딩 메시지 추가
    setMessages((prev) => [...prev, { role: "bot", text: "loading" }]);

    try {
      const res = await askChatbot(userQuestion);
      console.log("📥 받은 응답:", res);

      // ✅ 마지막 메시지를 답변으로 교체
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "bot",
          text: res.answer || "답변을 찾지 못했어요 🤔",
        };
        return newMessages;
      });
    } catch (err) {
      console.error("❌ 챗봇 API 호출 실패:", err);

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

  // 서버에서 챗봇 질문 기록 불러오기
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetchChatHistory(20); // limit = 20
      console.log("📥 최근 질문 목록:", res);
      setHistory(res || []);
    } catch (err) {
      console.error("❌ 최근 질문 불러오기 실패:", err);
      message.error("최근 질문 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // 질문 클릭 시 상세 조회 API 호출
  const handleHistoryClick = async (msg) => {
    try {
      const detail = await fetchChatHistoryDetail(msg.id);
      console.log("📥 질문 상세:", detail);
      setSelectedQA(detail);
      setModalOpen(true);
    } catch (err) {
      console.error("❌ 질문 상세 불러오기 실패:", err);
      message.error("질문 상세를 불러오지 못했습니다.");
    }
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
                            <LoadingOutlined style={{ color: "#78d900" }} spin />
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
            <h3>지난 질문 목록</h3>
            <div className="academic_chat_list">
              {loadingHistory ? (
                <div className="academic_history_empty">
                  불러오는 중...
                </div>
              ) : history.length === 0 ? (
                <div className="academic_history_empty">지난 질문이 없습니다.</div>
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
