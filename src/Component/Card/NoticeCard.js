import "./Card.css"; 
import { useState } from "react";
import axios from "axios";
import TextModal from "../Modal/TextModal";
import { Dropdown, Menu, message } from "antd";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";

const NoticeCard = ({
  id,
  authorid,
  profile,
  name,
  updatedAt,
  createdAt,
  title,
  content,
  images,
  bookmarked,
  onBookmarkToggle,
  currentUserRole,
  onEdit,     
  onDelete,   
  onClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("noticesubscribe"); 
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const openModal = (e, mode) => {
    e.stopPropagation();
    setModalMode(mode);      
    setIsModalOpen(true);    
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const firstImage = images && images.length > 0 ? images[0] : null;

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // 구독 API
  const handleConfirm = async () => {
    if (bookmarkLoading) return; 
    setBookmarkLoading(true);

    try {
      const token = sessionStorage.getItem("accessToken");

      if (!bookmarked) {
        await axios.post(`/bookmarks/${authorid}`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success(`${name}를 구독했습니다.`);
      } else {
        await axios.delete(`/bookmarks/${authorid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success(`${name} 구독을 취소했습니다.`);
      }

      if (onBookmarkToggle) {
        onBookmarkToggle();
      }
      closeModal();
    } catch (error) {
      message.error("북마크 처리 중 오류가 발생했습니다.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  // 날짜 변환 함수
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.slice(0, 10);
  };

  // 드롭다운 메뉴 클릭 핸들러
  const handleMenuClick = (info) => {
    info.domEvent.stopPropagation(); // 클릭 이벤트 버블링 막기
    if (info.key === "edit") {
      onEdit?.(id);  // 부모의 수정 함수 호출
    } else if (info.key === "delete") {
      onDelete?.(id); // 부모의 삭제 함수 호출
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
          <img
            onClick={onClick}
            src={firstImage}
            alt="공지 이미지"
            className="noticecard_image"
          />
        ) : (
          <div onClick={onClick} className="noticecard_content">
            {" "}
            {truncateText(content, 100)}
          </div>
        )}

        <div className="noticecard_info">
          <div className="noticecard_profile">
            <img src="./image/profile.png" alt="profile" className="noticecard_profile_img" />
            <div className="noticecard_text">
              <p className="noticecard_name">{name}</p>
              <p className="noticecard_date">
                {updatedAt
                  ? `${formatDate(updatedAt)} (수정됨)`
                  : formatDate(createdAt)}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <div
              className="noticecard_icon"
              onClick={(e) => openModal(e, bookmarked ? "noticeunsubscribe" : "noticesubscribe")}
              style={{ cursor: "pointer" }}
            >
              {bookmarked ? <IoBookmark color="#78D900" /> : <IoBookmarkOutline />}
            </div>

            {currentUserRole === "MANAGER" && (
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

      {isModalOpen && (
        <TextModal open={isModalOpen} onCancel={closeModal} mode={modalMode} name={name} onConfirm={handleConfirm} />
      )}
    </>
  );
};

export default NoticeCard;
