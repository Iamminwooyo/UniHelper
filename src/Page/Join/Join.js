import "./Join.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";  
import { useMediaQuery } from 'react-responsive';
import { requestSignupEmail, verifySignupEmail, signup } from "../../API/AccountAPI";
import { Select, Input, Button, message } from "antd";
import { RiArrowGoBackFill } from "react-icons/ri";
import { BiSolidRightArrow, BiSolidLeftArrow } from "react-icons/bi";
import { GoDotFill, GoDot } from "react-icons/go";

const { Option } = Select;

const departments = [
  "유도학과","유도경기지도학과",
  "무도학과","태권도학과","경호학과",
  "스포츠레저학과","체육학과",
  "골프학부","특수체육교육과",
  "무용과","미디어디자인학과",
  "회화학과","연극학과",
  "국악과","영화영상학과",
  "문화유산학과","문화콘텐츠학과",
  "실용음악과","경영학과","관광경영학과",
  "경찰행정학과","중국학과","사회복지학과",
  "보건환경안전학과","바이오생명공학과",
  "물리치료학과","식품조리학부","AI융합학부",
  "무전공",
];

const Join = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");

  const [emailVerificationStatus, setEmailVerificationStatus] = useState("idle"); 
  const [emailVerificationMessage, setEmailVerificationMessage] = useState("");

  const [codeVerificationStatus, setCodeVerificationStatus] = useState("idle");
  const [codeVerificationMessage, setCodeVerificationMessage] = useState("");

  const [timer, setTimer] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(null);

  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isCodeVerifying, setIsCodeVerifying] = useState(false);
  const [isJoinProcessing, setIsJoinProcessing] = useState(false);

  const selectRef = useRef(null);

  const navigate = useNavigate();

  const schoolEmailRegex = /^[0-9]+@yiu\.ac\.kr$/;

  const isMobile = useMediaQuery({ maxWidth: 768 })

  // 이메일 인증번호 전송 함수
  const handleSendEmail = async () => {
    if (isEmailSending) return;

    if (!email) {
      message.error("이메일을 입력해주세요.");
      return;
    }

    if (!schoolEmailRegex.test(email)) {
      message.error("학교 이메일 형식이 아닙니다.");
      return;
    }

    setIsEmailSending(true);

    setEmailVerificationStatus("sending");
    setEmailVerificationMessage("인증번호 전송중...");
    setCodeVerificationStatus("idle");
    setCodeVerificationMessage("");
    setTimer(0);

    try {
      const response = await requestSignupEmail(email);

      const messageText = response;
      const isSuccess = messageText.includes("인증코드가 전송");

      if (isSuccess) {
        setTimeout(() => {
          setEmailVerificationStatus("sent");
          setEmailVerificationMessage("인증번호 전송됨");
          setTimer(180);
        }, 1000);
      } else {
        throw new Error(messageText || "이메일 전송 실패");
      }
    } catch (error) {
      console.error(error);
      const status = error.response?.status;

      let errorMessage = "이메일 전송 실패";
      if (status === 500) {
        message.error("이미 가입된 이메일입니다.");
        errorMessage = "이미 가입된 이메일입니다.";
      } else {
        errorMessage = error.response?.data?.message || error.message || "이메일 전송 실패";
      }

      setEmailVerificationStatus("error");
      setEmailVerificationMessage(errorMessage);
    } finally {
      setIsEmailSending(false);
    }
  };

  // 이메일 인증코드 확인 함수
  const handleVerifyCode = async () => {
    if (isCodeVerifying) return;

    if (!authCode) {
      message.error("인증코드를 입력해주세요.");
      return;
    }

    setIsCodeVerifying(true);

    try {
      const response = await verifySignupEmail(email, authCode);

       if (response.includes("인증 성공")) {
        setCodeVerificationStatus("verified");
        setCodeVerificationMessage("이메일 인증 완료");
        setEmailVerificationStatus("verified");
        setEmailVerificationMessage("인증 완료");
        
        const idPart = email.split("@")[0];
        setStudentId(idPart);
      } else {
        setCodeVerificationStatus("error");
        setCodeVerificationMessage("인증번호가 틀립니다.");
      }
    } catch (error) {
      console.error(error);
      const status = error.response?.status;

      if (status === 500) {
        setCodeVerificationStatus("error");
        setCodeVerificationMessage("인증번호가 틀립니다.");
      } else {
        setCodeVerificationStatus("error");
        setCodeVerificationMessage("인증 중 오류가 발생했습니다.");
        message.error("인증 중 오류가 발생했습니다.");
      }
    } finally {
      setIsCodeVerifying(false);
    }
  };

  // 회원가입 함수
  const handleJoin = async (e) => {
  e.preventDefault();
  if (isJoinProcessing) return;

  if (emailVerificationStatus !== "verified") {
    message.error("이메일 인증을 완료해주세요.");
    setStep(1);
    return;
  }
  if (!password) {
    message.error("비밀번호를 입력해주세요.");
    setStep(1);
    return;
  }
  if (!confirmPassword) {
    message.error("비밀번호 확인을 입력해주세요.");
    setStep(1);
    return;
  }
  if (password !== confirmPassword) {
    message.error("비밀번호가 일치하지 않습니다.");
    setStep(1);
    return;
  }
  if (!name) {
    message.error("이름을 입력해주세요.");
    setStep(2);
    return;
  }
  if (!studentId) {
    message.error("학번을 입력해주세요.");
    setStep(2);
    return;
  }
  if (!department) {
    message.error("학과를 선택해주세요.");
    setStep(2);
    return;
  }

  setIsJoinProcessing(true);

  try {
    const response = await signup({
      username: name,
      password,
      email,
      department,
      student_number: studentId,
    });

    console.log("📦 서버 응답 데이터:", response);

    // ✅ 수정된 부분
    if (response.status === 200) {
      message.success("회원가입 완료!");
      navigate("/login");
    } else {
      message.error(response.message || "회원가입에 실패했습니다.");
    }
  } catch (error) {
    console.error(error);
    message.error(
      "회원가입 중 오류가 발생했습니다: " +
        (error.response?.data?.message || error.message)
    );
  } finally {
    setIsJoinProcessing(false);
  }
};
  
  // 타이머 함수
  useEffect(() => {
    if (emailVerificationStatus !== "sent" || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setEmailVerificationStatus("resend");
          setEmailVerificationMessage("인증번호 전송됨");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [emailVerificationStatus, timer]);

  // 시간 변환 함수
  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  // 이메일 함수
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    setEmailVerificationStatus("idle");
    setEmailVerificationMessage("");
    setCodeVerificationStatus("idle");
    setCodeVerificationMessage("");

    if (value && !schoolEmailRegex.test(value)) {
      setEmailVerificationStatus("error");
      setEmailVerificationMessage("학교 이메일 형식이 아닙니다.");
    }
  };

  // 인증번호 함수
  const handleAuthCodeChange = (e) => {
    setAuthCode(e.target.value);
    if (codeVerificationStatus === "verified" || codeVerificationStatus === "error") {
      setCodeVerificationStatus("idle");
      setCodeVerificationMessage("");
    }
  };

  // 비밀번호 정규식 함수
  const validatePassword = (pw) => {
    const lengthCheck = pw.length >= 8;
    const upperCheck = /[A-Z]/.test(pw);
    const lowerCheck = /[a-z]/.test(pw);
    const specialCheck = /[^A-Za-z0-9]/.test(pw);
    return lengthCheck && upperCheck && lowerCheck && specialCheck;
  };

  // 비밀번호 함수
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setIsPasswordValid(validatePassword(newPassword));

    if (confirmPassword !== "") {
      setPasswordMatch(newPassword === confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  };

  // 비밀번호 확인 함수
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(password === e.target.value && e.target.value !== "");
  };

  // 이름 함수
  const handleNameChange = (e) => setName(e.target.value);

  // 학번 함수
  const handleStudentIdChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, "");
    setStudentId(onlyNumbers);
  };
  
  // 학과 함수
  const handleDepartmentChange = (value) => {
    setDepartment(value);
    if (selectRef.current) {
      selectRef.current.blur();
    }
  };

  return (
    <div className="join_layout">
      {!isMobile && (
        <section className="join_image_frame">
          <img className="join_image" src="/image/Login.png" alt="로그인 이미지" />
          <div className="join_image_overlay">
            <h1 className="join_logo_text"   onClick={() => navigate("/")} >UniHelper</h1>
          </div>
        </section>
      )}
      <section className="join_text">
        <div className="join_text_group">
        {step === 1 && (
        <RiArrowGoBackFill
            className="join_back_icon"
            onClick={() => navigate(-1)}
        />
        )}
        <h1 className="join_title">JOIN</h1>
        <form className="join_form" onSubmit={handleJoin}>
          {step === 1 ? (
            <>
              <div className="join_input_group join_input_with_input">
                <p className="join_input_label">이메일</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={handleEmailChange}
                  />
                  {emailVerificationStatus !== "verified" && (
                    <Button
                        type="button"
                        className="join_input_button"
                        onClick={handleSendEmail}
                        disabled={
                        emailVerificationStatus === "sending" ||
                        emailVerificationStatus === "sent"
                        }
                        style={{
                        cursor:
                            emailVerificationStatus === "sending" ||
                            emailVerificationStatus === "sent"
                            ? "not-allowed"
                            : "pointer",
                        }}
                    >
                        {{
                        idle: "인증번호 전송",
                        sending: "전송중",
                        sent: "전송됨",
                        resend: "재전송",
                        }[emailVerificationStatus] || "인증번호 전송"}
                    </Button>
                    )}
                </div>
                <p className={`join_input_message ${
                  emailVerificationStatus === "error" ? "error" :
                  emailVerificationStatus === "verified" ? "success" :
                  ""
                }`}>
                  {emailVerificationMessage}
                  {timer > 0 && emailVerificationStatus === "sent" && (
                    <span> (재전송까지 {formatTime(timer)})</span>
                  )}
                </p>
              </div>

             {["sent", "resend"].includes(emailVerificationStatus) && (
                <div className="join_input_group join_input_with_input">
                    <p className="join_input_label">인증번호</p>
                    <div style={{ display: "flex", gap: "10px" }}>
                    <Input
                        type="text"
                        placeholder="인증번호"
                        value={authCode}
                        onChange={handleAuthCodeChange}
                    />
                    <Button
                        type="button"
                        className="join_input_button"
                        onClick={handleVerifyCode}
                        disabled={
                          isCodeVerifying || !["sent", "resend"].includes(emailVerificationStatus)
                        }
                        style={{ cursor: ["sent", "resend"].includes(emailVerificationStatus) ? "pointer" : "not-allowed" }}
                    >
                        인증
                    </Button>
                    </div>
                    <p className={`join_input_message ${codeVerificationStatus === "error" ? "error" : codeVerificationStatus === "verified" ? "success" : ""}`}>
                    {(codeVerificationStatus === "error" || codeVerificationStatus === "verified") ? codeVerificationMessage : "\u00A0"}
                    </p>
                </div>
                )}

              <div className="join_input_group join_input_with_input">
                <p className="join_input_label">비밀번호</p>
                <Input.Password
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <p className={`join_input_message ${!isPasswordValid ? "error" : ""}`} style={{ minHeight: "18px" }}>
                  {!isPasswordValid
                    ? "대/소문자, 특수기호 포함 8자 이상"
                    : "\u00A0"}
                </p>
              </div>

              <div className="join_input_group join_input_with_input">
                <p className="join_input_label">비밀번호 확인</p>
                <Input.Password
                  type="password"
                  placeholder="비밀번호 확인"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
                <p
                  className={`join_input_message ${
                    passwordMatch === null ? "hidden" : passwordMatch ? "" : "error"
                  }`}
                >
                  {passwordMatch === false && "비밀번호 불일치"}
                  {passwordMatch === true && "비밀번호 일치"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="join_input_group join_input_with_input">
                <p className="join_input_label">이름</p>
                <Input type="text" placeholder="이름" value={name} onChange={handleNameChange} />
                <p className="join_input_message hidden">&nbsp;</p>
              </div>

              <div className="join_input_group join_input_with_input">
                <p className="join_input_label">학번</p>
                <Input
                  type="text"
                  placeholder="학번"
                  value={studentId}
                  readOnly
                />
                <p className="join_input_message hidden">&nbsp;</p>
              </div>

              <div className="join_input_group join_input_with_input">
                <p className="join_input_label">학과</p>
                <Select
                  ref={selectRef}
                  value={department || undefined}
                  onChange={handleDepartmentChange}
                  placeholder="학과 선택"
                  showSearch
                  optionFilterProp="children"
                  size="middle"
                >
                  {departments.map((dept, idx) => (
                    <Option key={idx} value={dept}>
                      {dept}
                    </Option>
                  ))}
                </Select>
                <p className="join_input_message hidden">&nbsp;</p>
              </div>

              <Button type="default" htmlType="submit" className="join_button" disabled={isJoinProcessing}>
                회원가입
              </Button>
            </>
          )}

          <div className="join_step">
            <BiSolidLeftArrow
              className={step > 1 ? "join_icon_on" : "join_icon_off"}
              style={{ fontSize: "20px" }}
              onClick={() => step > 1 && setStep(step - 1)}
            />
            {step === 1 ? (
              <>
                <GoDotFill className="join_icon_on" />
                <GoDot className="join_icon_off" />
              </>
            ) : (
              <>
                <GoDot className="join_icon_off" />
                <GoDotFill className="join_icon_on" />
              </>
            )}
            <BiSolidRightArrow
              className={step < 2 ? "join_icon_on" : "join_icon_off"}
              style={{ fontSize: "20px" }}
              onClick={() => step < 2 && setStep(step + 1)}
            />
          </div>
        </form>
        </div>
        
      </section>
    </div>
  );
};

export default Join;