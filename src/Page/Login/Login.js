import "./Login.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import axios from "axios";
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

  // 로그인 API
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email) {
      message.error("이메일을 입력해주세요.");
      return;
    }
    if (!password) {
      message.error("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await axios.post("/auth/login", {
        email,
        password,
      });

      if (res.data.success || res.status === 200) {
        sessionStorage.setItem("accessToken", res.data.accessToken);
        sessionStorage.setItem("refreshToken", res.data.refreshToken);

        message.success("로그인 성공!");
        
        navigate("/");  // 로그인 후 이동할 페이지 경로 수정 가능
      } else {
        message.error(res.data.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      message.error("로그인 중 오류가 발생했습니다: " + (error.response?.data || error.message));
    }
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
