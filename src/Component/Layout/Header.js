import "./Layout.css";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { MenuState } from "../../Recoil/Atom";
import { AlarmCountState } from "../../Recoil/Atom";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { fetchUnreadAlarmCount } from "../../API/UserAPI"; 
import { Badge } from "antd";
import { FaBell } from "react-icons/fa";
import { TbLogout } from "react-icons/tb";

const Header = () => {
  const setMenu = useSetRecoilState(MenuState);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useRecoilState(AlarmCountState);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const menuMap = {
    "/user": "user",
    "/academic": "academic/chat",
    "/enroll/practice": "/enroll/practice",
    "/tip": "tip",
    "/notice": "notice",
  };

  const handleMenuClick = (path) => {
    const menuKey = Object.entries(menuMap).find(([key]) => path.startsWith(key))?.[1] ?? null;
    setMenu(menuKey);
  };

  // 로그인 여부 확인s
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    if (token) {
      fetchUnreadAlarmCount()
        .then((count) => setUnreadCount(count))
        .catch((err) => console.error("알림 개수 조회 실패:", err));
    }
  }, []);

  // 로그아웃 처리
  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    setUnreadCount(0);
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
           <button
              onClick={() => navigate("/user/alarm")}
              style={{ display:'flex', alignItems:'center', background: "none", border: "none", cursor: "pointer" }}
              title="알림"
            >
              <Badge count={unreadCount} color="#78D900" offset={[1, -2]}>
                <FaBell className="header_side_bell" />
              </Badge>
            </button>
            <button onClick={handleLogout} className="header_side_logout" title="로그아웃" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <TbLogout/>
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
        <Link to="/academic/chat" onClick={() => handleMenuClick("/academic/chat")} className="header_menu_nav">학사정보</Link>
         {!isMobile && (
            <Link to="/enroll/practice" onClick={() => handleMenuClick("/enroll/practice")} className="header_menu_nav">
              수강신청 연습
            </Link>
          )}
        <Link to="/tip" onClick={() => handleMenuClick("/tip")} className="header_menu_nav">Tip 게시판</Link>
        <Link to="/notice" onClick={() => handleMenuClick("/notice")} className="header_menu_nav">공지사항</Link>
      </nav>
    </header>
  );
};

export default Header;
