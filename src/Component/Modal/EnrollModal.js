import { Modal, Button } from "antd";

const EnrollModal = ({ open, onCancel, mode, time, diffVsOthers, onConfirm }) => {
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

  let resultMessage = "";

  if (diffVsOthers !== null && diffVsOthers !== undefined) {
    const diff = Number(diffVsOthers);  // 문자열이어도 숫자로 변환 시도

    if (!isNaN(diff)) {
      if (diff > 0) {
        resultMessage = `평균보다 약 ${diff.toFixed(2)}초 느립니다!`;
      } else if (diff < 0) {
        resultMessage = `평균보다 약 ${Math.abs(diff).toFixed(2)}초 빠릅니다!`;
      } else {
        resultMessage = "평균입니다!";
      }
    } else {
      resultMessage = "기록 없음";
    }
  } else {
    resultMessage = "기록 없음";
  }

  return (
    <Modal
      open={open}
      onCancel={handleCancel} 
      footer={null}
      centered
      closable={true}
      wrapClassName="enrollmodal_wrap"
    >
      <section className="custommodal_layout">
        <h2 className="custommodal_title">
          {mode === "BASIC" 
          ? "기본 수강신청 완료" 
          : "장바구니 수강신청 완료"}
        </h2>

        <h3 className="custommodal_info">걸린 시간</h3>

        <p className="custommodal_time">{time}초</p>

        <p className="custommodal_result">{resultMessage}</p>

      </section>
    </Modal>
  );
};

export default EnrollModal;
