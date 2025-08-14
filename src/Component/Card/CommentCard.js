import "./Card.css";
import { useRecoilValue } from "recoil";
import { userBriefState } from "../../Recoil/Atom";

import { MdDeleteOutline } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import { Dropdown, Menu } from "antd";

const CommentCard = ({
  id,
  profile,
  department,
  content,
  date,
  isOwner,
  onEdit,
  onDelete,
}) => {
  const userBrief = useRecoilValue(userBriefState);

  const handleMenuClick = (info) => {
    info.domEvent.stopPropagation(); // 클릭 이벤트 버블링 방지
    if (info.key === "edit") {
      onEdit?.(id);
    } else if (info.key === "delete") {
      onDelete?.(id);
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick} className="custom-dropdown-menu">
      <Menu.Item key="edit" className="custom-dropdown-item">
        수정
      </Menu.Item>
      <Menu.Item key="delete" className="custom-dropdown-item delete">
        삭제
      </Menu.Item>
    </Menu>
  );

  return (
    <section className="commentcard_layout">
      <div className="commentcard_info">
        <div className="commentcard_profile">
          <img src={profile} alt="profile" className="commentcard_profile_img" />
          <div className="commentcard_text">
            <p className="commentcard_name">{department}</p>
            <p className="commentcard_date">{date}</p>
          </div>
        </div>

        {/* 본인 댓글이면 드롭다운 메뉴 */}
        {isOwner && (
          <Dropdown overlay={menu} trigger={["click"]}>
            <div
              className="commentcard_icon"
              onClick={(e) => e.stopPropagation()} // 부모 클릭 이벤트 방지
              style={{ cursor: "pointer" }}
            >
              <HiDotsVertical />
            </div>
          </Dropdown>
        )}

        {/* 매니저이면 삭제 아이콘만 */}
        {!isOwner && userBrief.roleType === "MANAGER" && (
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
