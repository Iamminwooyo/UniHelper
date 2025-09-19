import "./Login.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useSetRecoilState } from "recoil";
import { userBriefState } from "../../Recoil/Atom";
import PasswordModal from "../../Component/Modal/PasswordModal";
import { login, fetchUserBrief, fetchImagePreview } from "../../API/AccountAPI";
import { Input, Button, message } from "antd";
import { IoHome } from "react-icons/io5";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoginProcessing, setIsLoginProcessing] = useState(false);

  const setUserBrief = useSetRecoilState(userBriefState);

  const navigate = useNavigate();

  const isMobile = useMediaQuery({ maxWidth: 768 })

  // 로그인 함수
  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoginProcessing) return;

    if (!email) {
      return message.error("이메일을 입력해주세요.");
    }
    if (!password) {
      return message.error("비밀번호를 입력해주세요.");
    }

    setIsLoginProcessing(true);

    try {
      const response = await login(email, password);

      sessionStorage.setItem("accessToken", response.accessToken);
      sessionStorage.setItem("refreshToken", response.refreshToken);

      const briefRes = await fetchUserBrief(response.accessToken);

      // let profileImageObj = { url: "" };
      // if (briefRes.profileImage?.url) {
      //   try {
      //     const blob = await fetchImagePreview(briefRes.profileImage.url);
      //     const url = URL.createObjectURL(blob);
      //     profileImageObj = { url };
      //   } catch (err) {
      //     console.error("❌ 프로필 이미지 불러오기 실패:", err);
      //     profileImageObj = { url: "/image/profile.png" };
      //   }
      // }

      // setUserBrief({
      //   userId: briefRes.userId,
      //   username: briefRes.username,
      //   student_number: briefRes.studentNumber,
      //   department: briefRes.department,
      //   roleType: briefRes.roleType,
      //   profileImage: profileImageObj,
      // });

      const rawUrl = briefRes.profileImage?.url;
      const cleanUrl = rawUrl
        ? rawUrl
            .replace("Localhost", "localhost")
            .replace("Files", "files")
            .replace("proFiles", "profiles")
        : "/image/profile.png";

      console.log("🔎 원본 URL:", rawUrl);
      console.log("✅ 교정된 URL:", cleanUrl);

      setUserBrief({
        userId: briefRes.userId,
        username: briefRes.username,
        student_number: briefRes.student_number,
        department: briefRes.department,
        roleType: briefRes.roleType,
        profileImage: {
          url: cleanUrl,
        },
      });

      sessionStorage.setItem("roleType", briefRes.roleType);

      message.success("로그인 성공!");
      navigate("/");
    } catch (error) {
      console.error(error);
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message;

      if (status === 400) {
        message.error(serverMsg || "잘못된 요청입니다.");
      } else if (status === 401) {
        message.error("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (status === 403) {
        message.error("접근 권한이 없습니다.");
      } else if (status === 500) {
        message.error("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        message.error(
          "로그인 중 알 수 없는 오류가 발생했습니다: " + (serverMsg || error.message)
        );
      }
    } finally {
      setIsLoginProcessing(false);
    }
  };

  // 회원가입 클릭 함수
  const handleJoinClick = () => navigate("/join");

  // 비밀번호 변경 모달 닫기 함수
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="login_layout">
       {!isMobile && (
        <section className="login_image_frame">
          <img className="login_image" src="/image/Login.png" alt="로그인 이미지" />
          <div className="login_image_overlay">
            <h1 className="login_logo_text" onClick={() => navigate("/")} >UniHelper</h1>
          </div>
        </section>
      )}
      <section className="login_text">
        {isMobile && ( 
          <div className="login_icon_wrapper" onClick={() => navigate("/")}>
            <IoHome className="login_icon"/>
          </div>
        )}
        <h1 className="login_title">LOGIN</h1>
        <form className="login_form" onSubmit={handleLogin}>
          <div className='login_input_group'>
            <p className='login_input_label'>이메일</p>
            <Input
              type="email"
              placeholder="이메일"
              className="login_input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className='login_input_group'>
            <p className='login_input_label'>비밀번호</p>
            <Input.Password
              placeholder="비밀번호"
              className="login_input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="primary" htmlType="submit" className="login_button" disabled={isLoginProcessing}>
            로그인
          </Button>
        </form>
        <div className="login_sub">
          <div className="login_link" onClick={handleJoinClick}>회원가입</div>
          <div className="login_link" onClick={() => setIsModalOpen(true)}>비밀번호 변경</div>
        </div>
      </section>

      <PasswordModal open={isModalOpen} onCancel={handleCloseModal} />
    </div>
  );
};

export default Login;