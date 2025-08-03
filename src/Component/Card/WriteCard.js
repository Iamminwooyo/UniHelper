import "./Card.css"; 
import { HiDotsVertical } from "react-icons/hi";
import { Dropdown, Menu } from "antd";

const WriteCard = ({ id, profile, name, date, title, content, images, onClick, onEdit, onDelete }) => {
  const firstImage = images && images.length > 0 ? images[0] : null;

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };
  
  const handleMenuClick = (info) => {
    info.domEvent.stopPropagation();

    if (info.key === "edit") {
      onEdit?.(id);
    } else if (info.key === "delete") {
      onDelete?.(id);
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick} className="custom-dropdown-menu">
        <Menu.Item key="edit" className="custom-dropdown-item">수정</Menu.Item>
        <Menu.Item key="delete" className="custom-dropdown-item delete">삭제</Menu.Item>
    </Menu>
  );

  return (
    <section className="noticecard_layout">
      <h4 className="noticecard_title">{truncateText(title, 15)}</h4>

      {firstImage ? (
        <img onClick={onClick} src={firstImage} alt="공지 이미지" className="noticecard_image" />
      ) : (
        <div onClick={onClick} className="noticecard_content"> {truncateText(content, 100)}</div>
      )}

      <div className="noticecard_info">
        <div className="noticecard_profile">
          <img src={profile} alt="profile" className="noticecard_profile_img" />
          <div className="noticecard_text">
            <p className="noticecard_name">{name}</p>
            <p className="noticecard_date">{date}</p>
          </div>
        </div>

        <Dropdown overlay={menu} trigger={['click']}>
          <div className="noticecard_icon" style={{ cursor: "pointer" }} onClick={(e) => e.stopPropagation()}>
            <HiDotsVertical />
          </div>
        </Dropdown>
      </div>
    </section>
  );
};

export default WriteCard;
