import "./Modal.css";
import { useState, useEffect } from "react";
import { Modal, Input, Button, message } from "antd";

const PasswordModal = ({ open, onCancel }) => {
  // 내부 상태 초기화 함수
  const getInitialState = () => ({
    email: "",
    authCode: "",
    name: "",
    emailVerificationStatus: "idle",
    emailVerificationMessage: "",
    codeVerificationStatus: "idle",
    codeVerificationMessage: "",
    timer: 0,
    showPasswordFields: false,
    newPassword: "",
    confirmPassword: "",
    passwordMatch: null,
    passwordError: "",
  });

  const [state, setState] = useState(getInitialState());

  // useEffect 타이머 관련
  useEffect(() => {
    if (state.emailVerificationStatus !== "sent" || state.timer <= 0) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.timer <= 1) {
          clearInterval(interval);
          return {
            ...prev,
            timer: 0,
            emailVerificationStatus: "resend",
            emailVerificationMessage: "인증번호 전송됨",
          };
        }
        return {
          ...prev,
          timer: prev.timer - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.emailVerificationStatus, state.timer]);

  // 상태 초기화 함수 (모달 닫을 때 호출)
  const resetState = () => {
    setState(getInitialState());
  };

  // 모달 닫기 핸들러
  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  // 각 핸들러에서 state 업데이트
  const handleEmailChange = (e) => {
    setState((prev) => ({
      ...prev,
      email: e.target.value,
      emailVerificationStatus: "idle",
      emailVerificationMessage: "",
      codeVerificationStatus: "idle",
      codeVerificationMessage: "",
    }));
  };

  const handleSendEmail = () => {
    if (!state.email) {
      message.error("이메일을 입력해주세요.");
      return;
    }
    setState((prev) => ({
      ...prev,
      emailVerificationStatus: "sending",
      emailVerificationMessage: "인증번호 전송중...",
      codeVerificationStatus: "idle",
      codeVerificationMessage: "",
      timer: 0,
    }));
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        emailVerificationStatus: "sent",
        emailVerificationMessage: "인증번호 전송됨",
        timer: 10,
      }));
    }, 1000);
  };

  const handleAuthCodeChange = (e) => {
    setState((prev) => ({
      ...prev,
      authCode: e.target.value,
      codeVerificationStatus: prev.codeVerificationStatus === "verified" ? "idle" : prev.codeVerificationStatus,
      codeVerificationMessage: prev.codeVerificationStatus === "verified" ? "" : prev.codeVerificationMessage,
    }));
  };

  const handleVerifyCode = () => {
    if (!state.authCode) {
      message.error("인증코드를 입력해주세요.");
      return;
    }
    if (state.authCode === "123456") {
      setState((prev) => ({
        ...prev,
        codeVerificationStatus: "verified",
        codeVerificationMessage: "이메일 인증 완료",
        emailVerificationStatus: "verified",
        emailVerificationMessage: "인증 완료",
      }));
    } else {
      setState((prev) => ({
        ...prev,
        codeVerificationStatus: "error",
        codeVerificationMessage: "인증번호가 틀립니다.",
      }));
    }
  };

  const handleNameChange = (e) => {
    setState((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setState((prev) => {
      const passwordMatch = prev.confirmPassword !== "" ? value === prev.confirmPassword : null;
      return {
        ...prev,
        newPassword: value,
        passwordMatch,
      };
    });
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setState((prev) => ({
      ...prev,
      confirmPassword: value,
      passwordMatch: prev.newPassword === value && value !== "",
    }));
  };

  // 1차: 확인 버튼 눌렀을 때 유효성 검사
  const handleConfirm = () => {
    if (!state.email) {
      message.error("이메일을 입력해주세요.");
      return false;
    }
    if (state.codeVerificationStatus !== "verified") {
      message.error("이메일 인증을 완료해주세요.");
      return false;
    }
    if (!state.name) {
      message.error("이름을 입력해주세요.");
      return false;
    }
    setState((prev) => ({ ...prev, showPasswordFields: true }));
    return true;
  };

  // 2차: 변경 버튼 눌렀을 때 유효성 검사 및 제출
  const handleChange = () => {
    if (!state.newPassword) {
      message.error("새 비밀번호를 입력해주세요.");
      return false;
    }
    if (!state.confirmPassword) {
      message.error("비밀번호 확인을 입력해주세요.");
      return false;
    }
    if (state.newPassword !== state.confirmPassword) {
      message.error("비밀번호가 일치하지 않습니다.");
      return false;
    }

    message.success("비밀번호가 변경되었습니다!");

    console.log("최종 제출:", {
      email: state.email,
      authCode: state.authCode,
      name: state.name,
      newPassword: state.newPassword,
    });

    handleCancel(); // 초기화 포함 닫기
    return true;
  };

  // 제출 버튼 핸들러
  const handleSubmit = () => {
    if (!state.showPasswordFields) {
      handleConfirm();
    } else {
      handleChange();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      closable={false}
      wrapClassName="passwordmodal_wrap"
    >
      <section className="passwordmodal_layout">
        <h2 className="passwordmodal_title">비밀번호 변경</h2>

        <div className="passwordmodal_input_group">
          <p className="passwordmodal_input_label">이메일</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <Input
              type="email"
              placeholder="학교 이메일"
              value={state.email}
              onChange={handleEmailChange}
              disabled={state.showPasswordFields}
            />
            {state.emailVerificationStatus !== "verified" && (
              <Button
                type="button"
                className="passwordmodal_input_button"
                onClick={handleSendEmail}
                disabled={state.showPasswordFields || ["sending", "sent"].includes(state.emailVerificationStatus)}
              >
                {{
                  idle: "인증번호 전송",
                  sending: "전송중",
                  sent: "전송됨",
                  resend: "재전송",
                }[state.emailVerificationStatus] || "인증번호 전송"}
              </Button>
            )}
          </div>
          <p className="passwordmodal_input_message">
            {state.emailVerificationMessage}
            {state.timer > 0 && state.emailVerificationStatus === "sent" && (
              <span> ({formatTime(state.timer)})</span>
            )}
          </p>
        </div>

        {["sent", "resend"].includes(state.emailVerificationStatus) && (
          <div className="passwordmodal_input_group">
            <p className="passwordmodal_input_label">인증번호</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <Input
                type="text"
                placeholder="인증번호"
                value={state.authCode}
                onChange={handleAuthCodeChange}
                disabled={state.showPasswordFields}
              />
              <Button
                type="button"
                className="passwordmodal_input_button"
                onClick={handleVerifyCode}
                disabled={state.showPasswordFields}
              >
                인증
              </Button>
            </div>
            <p
              className={`passwordmodal_input_message ${
                state.codeVerificationStatus === "error"
                  ? "error"
                  : state.codeVerificationStatus === "verified"
                  ? "success"
                  : ""
              }`}
            >
              {(state.codeVerificationStatus === "error" || state.codeVerificationStatus === "verified"
                ? state.codeVerificationMessage
                : "\u00A0")}
            </p>
          </div>
        )}

        <div className="passwordmodal_input_group">
          <p className="passwordmodal_input_label">이름</p>
          <Input
            type="text"
            placeholder="이름"
            value={state.name}
            onChange={handleNameChange}
            disabled={state.showPasswordFields}
          />
          <p className="passwordmodal_input_message hidden">&nbsp;</p>
        </div>

        {state.showPasswordFields && (
          <>
            <div className="passwordmodal_input_group">
              <p className="passwordmodal_input_label">새 비밀번호</p>
              <Input.Password
                value={state.newPassword}
                onChange={handlePasswordChange}
                placeholder="새 비밀번호"
              />
              <p className="passwordmodal_input_message hidden">&nbsp;</p>
            </div>

            <div className="passwordmodal_input_group">
              <p className="passwordmodal_input_label">비밀번호 확인</p>
              <Input.Password
                value={state.confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="비밀번호 확인"
              />
              <p
                className={`passwordmodal_input_message ${
                  state.passwordMatch === null
                    ? "hidden"
                    : state.passwordMatch
                    ? ""
                    : "error"
                }`}
              >
                {state.passwordMatch === false && "비밀번호가 일치하지 않습니다."}
                {state.passwordMatch === true && "비밀번호가 일치합니다."}
              </p>
            </div>
            {state.passwordError && (
              <p className="passwordmodal_input_message error">{state.passwordError}</p>
            )}
          </>
        )}
      </section>

      <section style={{ marginTop: "20px", marginBottom: "10px",textAlign: "right" }}>
        <Button
          type="primary"
          className="passwordmodal_button_ok"
          onClick={handleSubmit}
          style={{ marginRight: "20px" }}
        >
          {state.showPasswordFields ? "변경" : "확인"}
        </Button>
        <Button className="passwordmodal_button_cancle" onClick={handleCancel}>
          취소
        </Button>
      </section>
    </Modal>
  );
};

export default PasswordModal;
