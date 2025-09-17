import { useState } from "react";
import { Modal, Input, Button } from "antd";
import "./Modal.css";

const FaqModal = ({ open, onCancel, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      return; // 간단히 빈 값 체크
    }
    onSubmit?.({ title, content }); // 부모로 데이터 전달
    setTitle("");
    setContent("");
    onCancel(); // 닫기
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
        <h2 className="custommodal_title">챗봇 문의</h2>

        <div className="custommodal_input_group">
          <p className="custommodal_input_label">제목</p>
          <Input
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="custommodal_input_group" style={{ marginTop: 16 }}>
          <p className="custommodal_input_label">내용</p>
          <Input.TextArea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            autoSize={{ minRows: 1, maxRows: 30 }}
          />
        </div>
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

export default FaqModal;
