import "./Card.css";
import { Dropdown, Menu } from "antd";
import { MdDeleteOutline } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";

const CommentCard = ({
  id,
  profile,
  department,
  content,
  date,
  role,
  isOwner,
  onEdit,
  onDelete,
}) => {


  // 드롭다운 메뉴 함수
  const handleMenuClick = (info) => {
    info.domEvent.stopPropagation();
    if (info.key === "edit") onEdit?.(id);
    if (info.key === "delete") onDelete?.(id);
  };

  // 드롭다운 메뉴
  const menu = (
    <Menu onClick={handleMenuClick} className="custom-dropdown-menu">
      <Menu.Item key="edit" className="custom-dropdown-item">수정</Menu.Item>
      <Menu.Item key="delete" className="custom-dropdown-item delete">삭제</Menu.Item>
    </Menu>
  );

  return (
    <section className="commentcard_layout">
      <div className="commentcard_info">
        <div className="commentcard_profile">
          <img src={profile || "/image/profile.png"} alt="profile" className="commentcard_profile_img" />
          <div className="commentcard_text">
            <p className="commentcard_name">{department}</p>
            <p className="commentcard_date">{date}</p>
          </div>
        </div>

        {isOwner && (
          <Dropdown overlay={menu} trigger={["click"]}>
            <div
              className="commentcard_icon"
              onClick={(e) => e.stopPropagation()} 
              style={{ cursor: "pointer" }}
            >
              <HiDotsVertical />
            </div>
          </Dropdown>
        )}

        {!isOwner && (role === "MANAGER" || role === "ADMIN") && (
          <MdDeleteOutline
            className="commentcard_icon"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(id);
            }}
          />
        )}
      </div>

      <hr className="commentcard_divider" />

      <p className="commentcard_content">{content}</p>
    </section>
  );
};

export default CommentCard;
