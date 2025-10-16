import { useState, useRef, useEffect } from "react";
import "./Academic.css";
import ChatModal from "../../Component/Modal/ChatModal";
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

  // 지난 질문 조회 함수
  const loadHistory = async () => {
    if (loadingHistory) return;
    setLoadingHistory(true);
    try {
      const res = await fetchChatHistory(20);
      setHistory(res || []);
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
      setSelectedQA(detail);
      setModalOpen(true);
    } catch (err) {
      message.error("질문 상세를 불러오지 못했습니다.");
    } finally {
      isFetchingDetailRef.current = false;
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
              <p>
                이 챗봇은 매 학기 종합정보서비스 종합강의시간표를 기준으로 답변을
                제공합니다.
              </p>
              <p>각 질문은 개별로 전에 했던 대화 내용이 이어지지 않습니다.</p>
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

            <div className="academic_chat_input">
              <input
                type="text"
                value={input}
                placeholder="질문을 입력하세요..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.isComposing) return;
                  if (e.key === "Enter") handleSend();
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
    </main>
  );
};

export default AcademicChat;