import "./Modal.css";
import { Modal,  Button, message } from "antd";

const modalConfig = {
  subscribe: {
    title: "구독 확인",
    content: (name) => `${name}를 구독하시겠습니까?`,
    onOk: (name, onCancel) => {
      message.success(`${name}를 구독했습니다.`);
      onCancel();
    },
  },
  unsubscribe: {
    title: "구독 취소",
    content: (name) => `${name} 구독을 취소하시겠습니까?`,
    onOk: (name, onCancel) => {
      message.success(`${name} 구독을 취소했습니다.`);
      onCancel();
    },
  },
  notify: {
    title: "알림 설정",
    content: (name) => `${name}의 게시글 알림을 켜시겠습니까?`,
    onOk: (name, onCancel) => {
      message.success(`${name}의 게시글 알림을 설정했습니다.`);
      onCancel();
    },
  },
  unnotify: {
    title: "알림 해제",
    content: (name) => `${name}의 게시글 알림을 끄시겠습니까?`,
    onOk: (name, onCancel) => {
      message.success(`${name}의 게시글 알림을 껐습니다.`);
      onCancel();
    },
  },
  noticedelete: {
    title: "공지사항 삭제",
    content: () => `해당 공지사항을 삭제하시겠습니까?`,
    onOk: (name, onCancel) => {
      onCancel(); // 삭제 실제 로직은 부모 컴포넌트에서 처리
    },
  },
};

const TextModal = ({ open, onCancel, mode, name }) => {
  const config = modalConfig[mode] || {};

  const handleSubmit = () => {
    if (config.onOk) {
      config.onOk(name, onCancel);
    } else {
      onCancel();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      closable={false}
      wrapClassName="textmodal_wrap"
    >
      <section className="textmodal_layout">
        <h2 className="textmodal_title">{config.title || ""}</h2>
        <div className="textmodal_text">{config.content ? config.content(name) : ""}</div>
      </section>

      <section style={{ marginTop: 10, marginBottom: 10, textAlign: "right" }}>
        <Button
          type="primary"
          className="textmodal_button_ok"
          onClick={handleSubmit}
          style={{ marginRight: 20 }}
        >
          확인
        </Button>
        <Button className="textmodal_button_cancle" onClick={onCancel}>
          취소
        </Button>
      </section>
    </Modal>
  );
};


export default TextModal;
