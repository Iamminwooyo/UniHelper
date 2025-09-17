import { Modal } from "antd";

const ChatModal = ({ open, onCancel, qna }) => {

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      closable={true}
      wrapClassName="chatmodal_wrap"
    >
      <section className="custommodal_layout">
        <h2 className="custommodal_title">지난 질문</h2>

        <p className="custommodal_history">
          "{qna.question}" 에 관한 지난 채팅 내용입니다.
        </p>

        <div className="custommodal_chat">
          <div className="custommodal_chat_row user">
            <div className="custommodal_chat_message user">{qna.question}</div>
          </div>
          <div className="custommodal_chat_row bot">
            <img
              src="/image/chatbot.png"
              alt="bot"
              className="custommodal_chat_avatar"
            />
            <div className="custommodal_chat_message bot">{qna.answer}</div>
          </div>
        </div>
      </section>
    </Modal>
  );
};

export default ChatModal;