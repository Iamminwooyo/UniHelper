import "./Layout.css";
import { Link, useLocation } from "react-router-dom";
import { useSetRecoilState, useRecoilValue } from "recoil"
import { useMediaQuery } from "react-responsive";
import { MenuState } from "../../Recoil/Atom";
import { userBriefState } from "../../Recoil/Atom";

const Side = () => {
  const location = useLocation();
  const path = location.pathname;

  const setMenu = useSetRecoilState(MenuState);

  const user = useRecoilValue(userBriefState);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const menusByPath = [
    {
      match: (p) => p.startsWith("/user"),
      items: [
        { name: "내 정보", link: "/user" },
        { name: "알림 목록", link: "/user/alarm" },
      ],
    },
    {
      match: (p) => p.startsWith("/academic"),
      items: (user.roleType === "ADMIN") 
      ? [
          { name: "학사정보 챗봇", link: "/academic/chat" },
          { name: "학사정보 관리", link: "/academic/management" },
          { name: "FAQ", link: "/academic/faq" },
        ]
      : [
          { name: "학사정보 챗봇", link: "/academic/chat" },
          { name: "FAQ", link: "/academic/faq" },
        ],
    },
    {
      match: (p) => p.startsWith("/enroll"),
      items: [
        { name: "수강신청 연습", link: "/enroll/practice" },
        { name: "수강신청 가이드", link: "/enroll/guide" },
      ],
    },
    {
      match: (p) => p.startsWith("/tip"),
      items: [
        { name: "Tip 목록", link: "/tip/" },
        { name: "저장 목록", link: "/tip/subscribe" },
        { name: "작성 목록", link: "/tip/write" },
      ],
    },
    {
      match: (p) => p.startsWith("/notice"),
      items: (user.roleType === "MANAGER") 
      ? [
          { name: "공지사항", link: "/notice" },
          { name: "작성 목록", link: "/notice/write" },
          { name: "구독 관리", link: "/notice/subscribe" },
        ]
      : [
          { name: "공지사항", link: "/notice" },
          { name: "구독 관리", link: "/notice/subscribe" },
        ],
    },
  ];

  const currentMenu = menusByPath.find((menu) => menu.match(path))?.items || [];

  const isActiveMenu = (currentPath, itemLink) => {
    const normalize = (url) => url.replace(/\/+$/, "");
    const getBasePath = (url) => normalize(url).split("/").slice(0, 3).join("/");
    return getBasePath(currentPath) === normalize(itemLink);
  };

  const handleClick = (link) => {
    setMenu(link);
  };

  return (
    <side className="side_layout">
      {!isMobile && (
        <section className="side_profile">
          <img
            src={user.profileImage?.url ? user.profileImage.url : "/image/profile.png"}
            alt="profile"
            className="side_profile_img" 
          />
          <span className="side_info_text">{user.username}</span>
          {user.roleType === "STUDENT" && (
            <div className="side_info">
              <p className="side_info_text">{user.department}</p>
              <p className="side_info_text">{user.student_number}</p>
            </div>
          )}
        </section>
      )}
      {!isMobile && ( <div className="side_separator" />)}

      {!isMobile ? (
        <section className="side_menu">
          {currentMenu.map((item, index) => (
            <Link
              to={item.link}
              key={index}
              className={`side_menu_text ${isActiveMenu(path, item.link) ? "active" : ""}`}
              onClick={() => handleClick(item.link)}
            >
              {item.name}
            </Link>
          ))}
        </section>
      ):(
        <section className="side_menu">
          {currentMenu.map((item, index) => (
            <Link
              to={item.link}
              key={index}
              className={`side_menu_text ${isActiveMenu(path, item.link) ? "active" : ""}`}
              onClick={() => handleClick(item.link)}
            >
              {item.name}
            </Link>
          ))}
        </section>
      )}
    </side>
  );
};

export default Side;
