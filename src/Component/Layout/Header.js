import "./Layout.css";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { MenuState } from "../../Recoil/Atom";
import { FaBell } from "react-icons/fa";
import { TbLogout } from "react-icons/tb";
import { useEffect, useState } from "react";

const Header = () => {
  const setMenu = useSetRecoilState(MenuState);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const menuMap = {
    "/user": "user",
    "/academic": "academic",
    "/practice": "practice",
    "/tip": "tip",
    "/notice": "notice",
  };

  const handleMenuClick = (path) => {
    const menuKey = Object.entries(menuMap).find(([key]) => path.startsWith(key))?.[1] ?? null;
    setMenu(menuKey);
  };

  // 로그인 여부 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <header className="header_layout">
      <h2 style={{ margin: "10px 0 0 0" }}>
        <Link to="/" onClick={() => setMenu(null)} className="header_logo">UniHelper</Link>
      </h2>

      <nav className="header_side">
        {isLoggedIn ? (
          <>
            <Link to="/alarm" className="header_side_nav" title="알림">
              <FaBell size={20} />
            </Link>
            <button onClick={handleLogout} className="header_side_nav" title="로그아웃" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <TbLogout size={22} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="header_side_nav">로그인</Link>
            <Link to="/join" className="header_side_nav">회원가입</Link>
          </>
        )}
      </nav>

      <nav className="header_menu">
        <Link to="/user" onClick={() => handleMenuClick("/user")} className="header_menu_nav">마이페이지</Link>
        <Link to="/academic" onClick={() => handleMenuClick("/academic")} className="header_menu_nav">학사정보</Link>
        <Link to="/practice" onClick={() => handleMenuClick("/practice")} className="header_menu_nav">수강신청 연습</Link>
        <Link to="/tip" onClick={() => handleMenuClick("/tip")} className="header_menu_nav">Tip 게시판</Link>
        <Link to="/notice" onClick={() => handleMenuClick("/notice")} className="header_menu_nav">공지사항</Link>
      </nav>
    </header>
  );
};

export default Header;
