import { Modal, Button } from "antd";

const EnrollModal = ({ open, onCancel, mode, time, onConfirm }) => {
  const clearSession = () => {
    sessionStorage.removeItem("practiceMode");
    sessionStorage.removeItem("missionCourses");
    sessionStorage.removeItem("missionResult");
  };

  const handleSubmit = () => {
    clearSession();
    if (onConfirm) onConfirm();
    else onCancel();
  };

  const handleCancel = () => {
    clearSession();
    onCancel();
  };

    const resultMessage =
    time > 30 ? `평균보다 약 ${time - 30}초 느립니다!` : "평균입니다!";

  return (
    <Modal
      open={open}
      onCancel={handleCancel} 
      footer={null}
      centered
      closable={false}
      wrapClassName="custommodal_wrap"
    >
      <section className="custommodal_layout">
        <h2 className="custommodal_title">
          {mode === "practicebasic" 
          ? "기본 수강신청 완료" 
          : "장바구니 수강신청 완료"}
        </h2>

        <h3 className="custommodal_info">걸린 시간</h3>

        <p className="custommodal_time">{time}초</p>

        <p className="custommodal_result">{resultMessage}</p>

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
      </section>
    </Modal>
  );
};

export default EnrollModal;
