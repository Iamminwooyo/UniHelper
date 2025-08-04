import "./Card.css"; 
import { useState } from "react";
import TextModal from "../Modal/TextModal";
import { Dropdown, Menu } from "antd";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";

const NoticeCard = ({ id, profile, name, date,  title, content, images, bookmarked, onBookmarkToggle, currentUserRole, onEdit,
  onDelete, onClick, }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("subscribe"); // "subscribe" or "unsubscribe"

  const openModal = (e, mode) => {
    e.stopPropagation();
    setModalMode(mode);      // 모드 설정
    setIsModalOpen(true);    // 모달 열기
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const firstImage = images && images.length > 0 ? images[0] : null;

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };
  

   // 드롭다운 메뉴 클릭 핸들러
  const handleMenuClick = (info) => {
    info.domEvent.stopPropagation(); // 클릭 이벤트 버블링 막기
    if (info.key === "edit") {
      onEdit?.(id);
    } else if (info.key === "delete") {
      onDelete?.(id);
    }
  };

  // 메뉴 정의
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
     <>
      <section className="noticecard_layout">

        <h4 className="noticecard_title">{truncateText(title, 20)}</h4>

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
         <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <div
              className="noticecard_icon"
              onClick={(e) => openModal(e, bookmarked ? "unsubscribe" : "subscribe")}
              style={{ cursor: "pointer" }}
            >
              {bookmarked ? (
                <IoBookmark color="#78D900" />
              ) : (
                <IoBookmarkOutline />
              )}
            </div>

            {currentUserRole === 3 && (
              <Dropdown overlay={menu} trigger={["click"]}>
                <div
                  className="noticecard_icon"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <HiDotsVertical />
                </div>
              </Dropdown>
            )}
          </div>
        </div>
      </section>

      <TextModal open={isModalOpen} onCancel={closeModal} mode={modalMode} name={name} />
     </>
  );
};

export default NoticeCard;
