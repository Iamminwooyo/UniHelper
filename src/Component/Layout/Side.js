import "./Layout.css";
import { Link, useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil"
import { MenuState } from "../../Recoil/Atom";
import { usersdata } from "../../Data/Userdata";

const Side = () => {
  const location = useLocation();
  const path = location.pathname;

  const setMenu = useSetRecoilState(MenuState)

  const menusByPath = [
    {
      match: (p) => p.startsWith("/user"),
      items: [
        { name: "내 정보", link: "/user/info" },
        { name: "비밀번호 변경", link: "/user/password" },
      ],
    },
    {
      match: (p) => p.startsWith("/practice"),
      items: [
        { name: "수강신청 시작", link: "/practice/start" },
        { name: "지난 기록", link: "/practice/history" },
      ],
    },
    {
      match: (p) => p.startsWith("/tip"),
      items: [
        { name: "Tip 목록", link: "/tip/" },
        { name: "저장 목록", link: "/tip/like" },
        { name: "작성 목록", link: "/tip/write" },
      ],
    },
    {
      match: (p) => p.startsWith("/notice"),
      items: [
        { name: "공지사항", link: "/notice" },
        { name: "구독 관리", link: "/notice/subscribe" },
      ],
    },
  ];

  const currentMenu = menusByPath.find((menu) => menu.match(path))?.items || [];

  const user = usersdata[0];

  
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
      <section className="side_profile">
        <img
          src={user.profileimg ? user.profileimg : "/image/profile.png"}
          alt="profile"
          className="side_profile_img" 
        />
        <span className="side_info_text">{user.name}</span>
        <div className="side_info">
          <p className="side_info_text">{user.department}</p>
          <p className="side_info_text">{user.studentId}</p>
        </div>
      </section>

      <div className="side_separator" />

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
    </side>
  );
};

export default Side;
