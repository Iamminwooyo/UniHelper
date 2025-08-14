import "./Modal.css";
import { Modal,  Button, message } from "antd";

const modalConfig = {
  noticesubscribe: {
    title: "공지사항 구독",
    content: (name) => `${name}를 구독하시겠습니까?`,
    onOk: (name, onCancel) => {
      onCancel();
    },
  },
  noticeunsubscribe: {
    title: "구독 취소",
    content: (name) => `${name} 구독을 취소하시겠습니까?`,
    onOk: (name, onCancel) => {
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
      onCancel();
    },
  },
  tipsubscribe: {
    title: "Tip 저장",
    content: (title) => `"${title}" Tip을 저장하시겠습니까?`,
    onOk: (title, onCancel) => {
      onCancel();
    },
  },
  tipunsubscribe: {
    title: "저장 취소",
    content: (title) => `"${title}" Tip 저장을 취소하시겠습니까?`,
    onOk: (title, onCancel) => {
      onCancel();
    },
  },
  tipdelete: {
    title: "Tip 삭제",
    content: () => `해당 Tip을 삭제하시겠습니까?`,
    onOk: (name, onCancel) => {
      onCancel();
    },
  },
  commentdelete: {
    title: "댓글 삭제",
    content: () => `해당 댓글을 삭제하시겠습니까?`,
    onOk: (name, onCancel) => {
      onCancel();
    },
  },
};

const TextModal = ({ open, onCancel, mode, name, title, onConfirm }) => {
  const config = modalConfig[mode] || {};

  const getContentParam = () => {
    if (mode.startsWith("tip")) return title;
    return name;
  };

  const handleSubmit = () => {
    if (onConfirm) {
      onConfirm();  
    }

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
      wrapClassName="custommodal_wrap"
    >
      <section className="custommodal_layout">
        <h2 className="custommodal_title">{config.title || ""}</h2>
        <div className="custommodal_text">{config.content ? config.content(getContentParam()) : ""}</div>
      </section>

      <section style={{ marginTop: 10, marginBottom: 10, textAlign: "right" }}>
        <Button
          type="primary"
          className="custommodal_button_ok"
          onClick={handleSubmit}
          style={{ marginRight: 20 }}
        >
          확인
        </Button>
        <Button className="custommodal_button_cancle" onClick={onCancel}>
          취소
        </Button>
      </section>
    </Modal>
  );
};


export default TextModal;
