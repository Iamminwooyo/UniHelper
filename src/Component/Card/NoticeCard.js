import "./Card.css"; 
import { useState, useEffect } from "react";
import TextModal from "../Modal/TextModal";
import { fetchNoticeImagePreview, subscribeAuthor, unsubscribeAuthor} from "../../API/NoticeAPI";
import { Dropdown, Menu, message } from "antd";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";

const NoticeCard = ({
  id,
  authorid,
  name,
  updatedAt,
  createdAt,
  title,
  content,
  images,
  bookmarked,
  onBookmarkToggle,
  Type,
  isOwner,
  role,
  onClick,
  onEdit,     
  onDelete,   
}) => {
  const [imgUrl, setImgUrl] = useState(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("noticesubscribe"); 

  // 이미지 함수
  useEffect(() => {
    let cancelled = false;
    let objectUrl;

    if (!images) {
      setImgUrl(null);
      return;
    }

    const isReadyUrl =
      typeof images === "string" && /^(blob:|https?:|\/)/.test(images);

    if (isReadyUrl) {
      setImgUrl(images);
      return;
    }

    const run = async () => {
      try {
        const blob = await fetchNoticeImagePreview(images);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setImgUrl(objectUrl);
      } catch (error) {
        if (!cancelled) setImgUrl(null);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [images]);

  // 구독 함수
  const handleConfirm = async () => {
    if (bookmarkLoading) return;
    setBookmarkLoading(true);

    try {
      if (!bookmarked) {
        await subscribeAuthor(authorid);
        message.success(`${name}를 구독했습니다.`);
      } else {
        await unsubscribeAuthor(authorid);
        message.success(`${name} 구독을 취소했습니다.`);
      }
      onBookmarkToggle?.();
      closeModal();
    } catch (error) {
      console.error("handleConfirm 오류:", error);
      message.error("구독 처리 중 오류가 발생했습니다.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  // 글 자르기 함수
  const truncateText = (text, maxLength) => text?.length > maxLength ? text.slice(0, maxLength) + "..." : text || "";

  // 시간 변환 함수
  const formatDate = (dateString) => dateString?.slice(0, 10) || "";

  // 구독 모달 닫기 함수
  const closeModal = () => {
    setIsModalOpen(false);
  }  

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
      <Menu.Item key="delete" className="custom-dropdown-item">삭제</Menu.Item>
    </Menu>
  );

  const isBookmark = Type === "bookmark";
  const isNotice = Type === "notice";
  const isWrite = Type === "write";

  return (
      <>
        <section className={isBookmark ? "subscribecard_layout" : "noticecard_layout"}>
          <h4
            className={isBookmark ? "subscribecard_title" : "noticecard_title"}
            onClick={onClick}
          >
            {truncateText(title, isBookmark ? 10 : 20)}
          </h4>

          {imgUrl ? (
            <img
              src={imgUrl}
              alt="공지 이미지"
              className={isBookmark ? "subscribecard_image" : "noticecard_image"}
              onClick={onClick}
            />
          ) : (
            <div
              className={isBookmark ? "subscribecard_content" : "noticecard_content"}
              onClick={onClick}
            >
              {truncateText(content, 100)}
            </div>
          )}

          <div className={isBookmark ? "subscribecard_info" : "noticecard_info"}>
            <div className={isBookmark ? "subscribecard_profile" : "noticecard_profile"}>
              <img
                src="/image/profile.png"
                alt="profile"
                className={isBookmark ? "subscribecard_profile_img" : "noticecard_profile_img"}
              />
              <div className={isBookmark ? "subscribecard_text" : "noticecard_text"}>
                <p className={isBookmark ? "subscribecard_name" : "noticecard_name"}>{name}</p>
                <p className={isBookmark ? "subscribecard_date" : "noticecard_date"}>
                  {updatedAt ? `${formatDate(updatedAt)} (수정됨)` : formatDate(createdAt)}
                </p>
              </div>
            </div>

            {(isNotice || isWrite) && (
              <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                {isNotice && (
                  <div
                    className="noticecard_icon"
                    onClick={() => {
                      setModalMode(bookmarked ? "noticeunsubscribe" : "noticesubscribe");
                      setIsModalOpen(true);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {bookmarked ? <IoBookmark color="#78D900" /> : <IoBookmarkOutline />}
                  </div>
                )}

                {(isWrite || (isNotice && (isOwner || role === "MANAGER"))) && (
                  <Dropdown overlay={menu} trigger={["click"]}>
                    <div className="noticecard_icon" style={{ cursor: "pointer" }}>
                      <HiDotsVertical />
                    </div>
                  </Dropdown>
                )}
              </div>
            )}
          </div>
        </section>

        {isModalOpen && (
          <TextModal
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            mode={modalMode}
            name={name}
            onConfirm={handleConfirm}
          />
        )}
      </>
    );
};

export default NoticeCard;
