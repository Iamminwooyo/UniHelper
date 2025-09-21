import "./Modal.css";
import { useState, useEffect } from "react";
import { requestPasswordResetEmail, verifyPasswordResetCode, resetPassword } from "../../API/AccountAPI";
import { Modal, Input, Button, message } from "antd";

const PasswordModal = ({ open, onCancel }) => {
  // 내부 상태 초기화 함수
  const getInitialState = () => ({
    email: "",
    authCode: "",
    emailVerificationStatus: "idle",
    emailVerificationMessage: "",
    codeVerificationStatus: "idle",
    codeVerificationMessage: "",
    timer: 0,
    newPassword: "",
    confirmPassword: "",
    passwordMatch: null,
    isPasswordValid: false, 
    userError: ""
  });

  const [state, setState] = useState(getInitialState());

  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isCodeVerifying, setIsCodeVerifying] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  const schoolEmailRegex = /^[0-9]+@yiu\.ac\.kr$/;

  // 이메일 인증번호 전송 함수
  const handleSendEmail = async () => {
    if (isEmailSending) return;

    if (!state.email) {
      message.error("이메일을 입력해주세요.");
      return;
    }

    if (!schoolEmailRegex.test(state.email)) {
      message.error("학교 이메일 형식이 아닙니다.");
      setState(prev => ({
        ...prev,
        emailVerificationStatus: "error",
      }));
      return;
    }

    setIsEmailSending(true);

    setState(prev => ({
      ...prev,
      emailVerificationStatus: "sending",
      emailVerificationMessage: "인증번호 전송중...",
      codeVerificationStatus: "idle",
      codeVerificationMessage: "",
      timer: 0,
      userError: ""
    }));

    try {
      const response = await requestPasswordResetEmail(state.email);

      const messageText = response;
      const isSuccess = messageText.includes("인증코드가 전송");

      if (isSuccess) {
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            emailVerificationStatus: "sent",
            emailVerificationMessage: "인증번호 전송됨",
            timer: 180,
          }));
        }, 1000);
      } else {
        throw new Error(messageText || "이메일 전송 실패");
      }
    } catch (error) {

      if (error.response?.status === 403) {
        setState(prev => ({
          ...prev,
          emailVerificationStatus: "idle",
          emailVerificationMessage: "",
          userError: "회원가입 되지 않은 이메일입니다.",
        }));
      } else {
        message.error("이메일 전송 실패: " + (error.response?.data || error.message));
        setState(prev => ({
          ...prev,
          emailVerificationStatus: "idle",
          emailVerificationMessage: "",
          userError: "",
        }));
      }
    } finally {
      setIsEmailSending(false);
    }
  };

  // 이메일 인증번호 확인 함수
  const handleVerifyCode = async () => {
    if (isCodeVerifying) return;

    if (!state.authCode) {
      message.error("인증코드를 입력해주세요.");
      return;
    }

    setIsCodeVerifying(true);

    try {
      const response = await verifyPasswordResetCode(state.email, state.authCode);

      const responseData = response.data;

      if (
        (typeof responseData === "string" && responseData.includes("인증 성공")) ||
        (responseData.success === true)
      ) {
        setState(prev => ({
          ...prev,
          codeVerificationStatus: "verified",
          codeVerificationMessage: "이메일 인증 완료",
          emailVerificationStatus: "verified",
          emailVerificationMessage: "인증 완료",
        }));
        message.success("이메일 인증이 완료되었습니다.");
      } else {
        setState(prev => ({
          ...prev,
          codeVerificationStatus: "error",
          codeVerificationMessage: responseData.message || "인증번호가 틀립니다.",
        }));
        message.error(responseData.message || "인증번호가 틀립니다.");
      }
    } catch (error) {
      console.error(error);
      setState(prev => ({
        ...prev,
        codeVerificationStatus: "error",
        codeVerificationMessage: "인증 중 오류가 발생했습니다.",
      }));
      message.error("인증 중 오류가 발생했습니다.");
    } finally {
      setIsCodeVerifying(false);
    }
  };

  // 비밀번호 변경 API
  const handlePasswordUpdate = async () => {
    if (isPasswordUpdating) return;

    if (!state.email) {
      message.error("이메일을 입력해주세요.");
      return;
    }

    if (state.codeVerificationStatus !== "verified") {
      message.error("이메일 인증을 완료해주세요.");
      return;
    }

    if (!state.newPassword) {
      message.error("새 비밀번호를 입력해주세요.");
      return;
    }

    if (!state.confirmPassword) {
      message.error("새 비밀번호 확인을 입력해주세요.");
      return;
    }

    if (!state.passwordMatch) {
      message.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsPasswordUpdating(true);

    try {
      await resetPassword(state.email, state.newPassword);

      message.success("비밀번호가 성공적으로 변경되었습니다.");
      handleCancel();
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        "비밀번호 변경에 실패했습니다.";
      message.error(msg);
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  // 타이머 함수
  useEffect(() => {
    if (state.emailVerificationStatus !== "sent" || state.timer <= 0) return;

    const interval = setInterval(() => {
      setState(prev => {
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

  
  // 시간 변환 함수
  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  // 상태 초기화 함수
  const resetState = () => {
    setState(getInitialState());
  };

  // 비밀번호 변경 모달 닫기 함수
  const handleCancel = () => {
    resetState();
    onCancel();
  };

  // 이메일 함수
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setState(prev => ({
      ...prev,
      email: value,
      emailVerificationStatus: "idle",
      emailVerificationMessage: "",
      codeVerificationStatus: "idle",
      codeVerificationMessage: "",
      userError: ""
    }));

    if (value && !schoolEmailRegex.test(value)) {
      setState(prev => ({
        ...prev,
        email: value,
        emailVerificationStatus: "error",
        userError: "학교 이메일 형식이 아닙니다.", 
      }));
    }
  };

  // 인증번호 함수
  const handleAuthCodeChange = (e) => {
    setState(prev => ({
      ...prev,
      authCode: e.target.value,
      codeVerificationStatus: prev.codeVerificationStatus === "verified" ? "idle" : prev.codeVerificationStatus,
      codeVerificationMessage: prev.codeVerificationStatus === "verified" ? "" : prev.codeVerificationMessage,
    }));
  };

  // 새 비밀번호 함수
  const handlePasswordChange = (e) => {
    const value = e.target.value;

    const regexUpper = /[A-Z]/;
    const regexLower = /[a-z]/;
    const regexSpecial = /[!@#$%^&*(),.?":{}|<>]/;
    const isValid =
      value.length >= 8 &&
      regexUpper.test(value) &&
      regexLower.test(value) &&
      regexSpecial.test(value);

    setState((prev) => {
      const passwordMatch = prev.confirmPassword !== "" ? value === prev.confirmPassword : null;
      return {
        ...prev,
        newPassword: value,
        passwordMatch,
        isPasswordValid: isValid,
      };
    });
  };

  // 새 비밀번호 확인 함수
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setState(prev => ({
      ...prev,
      confirmPassword: value,
      passwordMatch: prev.newPassword === value && value !== "",
    }));
  };

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
        <h2 className="custommodal_title">비밀번호 변경</h2>

        <div className="custommodal_input_group">
          <p className="custommodal_input_label">이메일</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <Input
              type="email"
              placeholder="이메일"
              value={state.email}
              onChange={handleEmailChange}
            />
            {state.emailVerificationStatus !== "verified" && (
              <Button
                type="button"
                className="custommodal_input_button"
                onClick={handleSendEmail}
                disabled={["sending", "sent"].includes(state.emailVerificationStatus)}
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
          <p className={`custommodal_input_message ${state.userError ? "error" : ""}`}>
            {state.emailVerificationMessage}
            {state.emailVerificationMessage && state.userError ? " - " : ""}
            {state.userError}
            {state.timer > 0 && state.emailVerificationStatus === "sent" && (
              <span> ({formatTime(state.timer)})</span>
            )}
          </p>
        </div>

        {["sent", "resend"].includes(state.emailVerificationStatus) && (
          <div className="custommodal_input_group">
            <p className="custommodal_input_label">인증번호</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <Input
                type="text"
                placeholder="인증번호"
                value={state.authCode}
                onChange={handleAuthCodeChange}
              />
              <Button
                type="button"
                className="custommodal_input_button"
                onClick={handleVerifyCode}
                disabled={isCodeVerifying}
              >
                인증
              </Button>
            </div>
            <p
              className={`custommodal_input_message ${
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
        
            <div className="custommodal_input_group">
              <p className="custommodal_input_label">새 비밀번호</p>
              <Input.Password
                value={state.newPassword}
                onChange={handlePasswordChange}
                placeholder="새 비밀번호"
              />
              <p
                className={`custommodal_input_message ${
                  state.newPassword && !state.isPasswordValid ? "error" : ""
                }`}
                style={{ minHeight: "18px" }}
              >
                {state.newPassword && !state.isPasswordValid
                  ? "대/소문자, 특수기호 포함 8자 이상"
                  : "\u00A0"}
              </p>

            </div>

            <div className="custommodal_input_group">
              <p className="custommodal_input_label">새 비밀번호 확인</p>
              <Input.Password
                value={state.confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="비밀번호 확인"
              />
              <p
                className={`custommodal_input_message ${
                  state.passwordMatch === null
                    ? "hidden"
                    : state.passwordMatch
                    ? ""
                    : "error"
                }`}
              >
                {state.passwordMatch === false && "비밀번호 불일치"}
                {state.passwordMatch === true && "비밀번호 일치"}
              </p>
            </div>
      </section>

      <section className="custommodal_footer">
        <Button
          type="primary"
          className="custommodal_button_ok"
          onClick={handlePasswordUpdate}
          disabled={isPasswordUpdating}
        >
          변경
        </Button>
        <Button className="custommodal_button_cancle" onClick={handleCancel}>
          취소
        </Button>
      </section>
    </Modal>
  );
};

export default PasswordModal;