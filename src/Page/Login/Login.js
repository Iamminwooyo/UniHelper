import "./Login.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import PasswordModal from "../../Component/Modal/PasswordModal";
import { Input, Button, message } from "antd";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const isMobile = useMediaQuery({ maxWidth: 768 })

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email) {
      message.error("이메일을 입력해주세요.");
      return;
    }
    if (!password) {
      message.error("비밀번호를 입력해주세요.");
      return;
    }

    console.log("로그인 시도:", { email, password });
    // 여기에 실제 로그인 API 호출 로직 추가
  };

  const handleJoinClick = () => navigate("/join");
  const handlePasswordResetClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="login_layout">
       {!isMobile && (
        <section className="login_image_frame">
          <img className="login_image" src="/image/Login.png" alt="로그인 이미지" />
          <div className="login_image_overlay">
            <h1 className="login_logo_text">UniHelper</h1>
          </div>
        </section>
      )}
      <section className="login_text">
        <h1 className="login_title">LOGIN</h1>
        <form className="login_form" onSubmit={handleLogin}>
          <div className='login_input_group'>
            <p className='login_input_label'>이메일</p>
            <Input
              type="email"
              placeholder="이메일"
              className="login_input"
              value={email}
              onChange={handleEmailChange}
            />
          </div>

          <div className='login_input_group'>
            <p className='login_input_label'>비밀번호</p>
            <Input.Password
              placeholder="비밀번호"
              className="login_input"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>

          <Button type="primary" htmlType="submit" className="login_button">
            로그인
          </Button>
        </form>
        <div className="login_sub">
          <div className="login_link" onClick={handleJoinClick}>회원가입</div>
          <div className="login_link" onClick={handlePasswordResetClick}>비밀번호 변경</div>
        </div>
      </section>

      <PasswordModal open={isModalOpen} onCancel={handleCloseModal} />
    </div>
  );
};

export default Login;
