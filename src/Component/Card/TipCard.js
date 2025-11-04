import "./Card.css";
import { useState, useEffect, useMemo, useRef } from "react";
import TextModal from "../Modal/TextModal";
import { bookmarkTip, reactToTip, fetchTipImagePreview } from "../../API/TipAPI";
import { Tag, Dropdown, Menu, message } from "antd";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { AiOutlineLike, AiOutlineDislike, AiFillLike, AiFillDislike } from "react-icons/ai";
import { BiComment } from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";

// 태그 색상
const tagColorsPool = [
  "magenta","red","volcano","orange","gold",
  "lime","green","cyan","blue","geekblue","purple",
];

// 랜덤 색상 함수
const getRandomColor = () =>
  tagColorsPool[Math.floor(Math.random() * tagColorsPool.length)];

const TipCard = ({
  id,
  profile,
  name,
  department,
  updatedAt,
  createdAt,
  title,
  content,
  images,
  bookmarked,
  onBookmarkToggle,
  liked,
  disliked,
  likes,
  dislikes,
  comments,
  tags = [],
  isOwner,
  onEdit,
  onDelete,
  type,
  onClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("tipsubscribe");
  const [imgUrl, setImgUrl] = useState(null);

  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [reactionLoading, setReactionLoading] = useState(false);

  const savedUser = sessionStorage.getItem("userBrief");
  const user = savedUser ? JSON.parse(savedUser) : {};

  // 태그 색상 매핑 함수
  const tagColorMap = useMemo(() => {
    const map = {};
    tags.forEach((tag) => {
      if (!map[tag]) map[tag] = getRandomColor();
    });
    return map;
  }, [tags]);

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
          const blob = await fetchTipImagePreview(images);
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

  // 저장 클릭 함수 
  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    setModalMode(bookmarked ? "tipunsubscribe" : "tipsubscribe");
    setIsModalOpen(true);
  };

  // Tip 저장 함수
  const handleBookmarkConfirm = async () => {
    if (bookmarkLoading) return; 
    setBookmarkLoading(true);

    try {
      await bookmarkTip(id);
      message.success(
        bookmarked
          ? `"${title}" Tip 저장을 취소했습니다.`
          : `"${title}" Tip을 저장했습니다.`
      );
      onBookmarkToggle?.(id);
      closeModal();
    } catch {
      message.error("북마크 처리 중 오류가 발생했습니다.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Tip 반응 함수
  const handleReaction = async (type) => {
    if (reactionLoading) return; 
    setReactionLoading(true);

    try {
      await reactToTip(id, type);

      if (type === "LIKE") {
        message.success(
          liked ? "좋아요 취소" : "좋아요"
        );
      } else if (type === "DISLIKE") {
        message.success(
          disliked ? "싫어요 취소" : "싫어요"
        );
      }

      // 좋아요/싫어요 변경 후 부모에 알림 (UI 갱신용)
      onBookmarkToggle?.(id);
    } catch {
      message.error("반응 처리 중 오류가 발생했습니다.");
    } finally {
      setReactionLoading(false);
    }
  };

  // 저장 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  }  

  // 최대 글자 수 설정
  const MAX_CONTENT_LENGTH = 300; 

  // 본문 자르기 함수
  const getShortContent = (text) => {
    if (!text) return "";
    return text.length > MAX_CONTENT_LENGTH
      ? text.slice(0, MAX_CONTENT_LENGTH) + "..."
      : text;
  };

  // 시간 변환 함수
  const formatDate = (dateString) => dateString?.slice(0, 10) || "";

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

  const isTip = type === "tip";
  const isWrite = type === "write";
  const isBookmark = type === "bookmark";

  return (
    <section className="tipcard_layout">
      <div className="tipcard_header">
        <span className="tipcard_title" onClick={onClick}>
          {title}
        </span>
        <div className="tipcard_icon">
          {type !== "write" &&
            (bookmarked ? (
              <IoBookmark
                color="#78D900"
                style={{cursor:'pointer'}}
                onClick={handleBookmarkClick}
              />
            ) : (
              <IoBookmarkOutline
                color="#78D900"
                style={{cursor:'pointer'}}
                onClick={handleBookmarkClick}
              />
            ))}

          {(isOwner || isWrite) && (
            <Dropdown overlay={menu} trigger={["click"]}>
              <div
                style={{cursor:'pointer'}}
                onClick={(e) => e.stopPropagation()}
              >
                <HiDotsVertical className="tipcard_icon"/>
              </div>
            </Dropdown>
          )}

          {!isOwner && !isBookmark && ["MANAGER", "ADMIN"].includes(user.roleType) && (
            <MdDeleteOutline
              style={{cursor:'pointer'}}
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(id);
              }}
            />
          )}
        </div>
      </div>

      <hr className="tipcard_divider" onClick={onClick} />

      <div className="tipcard_info" onClick={onClick}>
        <div className="tipcard_profile">
          <img
            src={profile || "/image/profile.png"}
            alt="profile"
            className="tipcard_profile_img"
          />
          <div className="tipcard_text">
            <p className="tipcard_name">{department}</p>
            <p className="tipcard_date">{updatedAt ? `${formatDate(updatedAt)} (수정됨)` : formatDate(createdAt)}</p>
          </div>
        </div>
        <div className="tipcard_tag">
          {tags.map((tag) => (
            <Tag key={tag} color={tagColorMap[tag]} className="tipcard_tag_item">
              {tag}
            </Tag>
          ))}
        </div>
      </div>

      <div className="tipcard_box" onClick={onClick}>
        <div className="tipcard_content">{getShortContent(content)}</div>
        {imgUrl && <img src={imgUrl} alt={title} className="tipcard_img" />}
      </div>

      <div className="tipcard_reaction">
        <div
          className="tipcard_reaction_item"
          onClick={(e) => {
            e.stopPropagation();
            handleReaction("LIKE");
          }}
        >
          {liked ? <AiFillLike color="#78D900" style={{cursor:'pointer'}}/> : <AiOutlineLike style={{cursor:'pointer'}}/>}
          <span>{likes}</span>
        </div>
        <div
          className="tipcard_reaction_item"
          onClick={(e) => {
            e.stopPropagation();
            handleReaction("DISLIKE");
          }}
        >
          {disliked ? <AiFillDislike color="#FF0000" style={{cursor:'pointer'}}/> : <AiOutlineDislike style={{cursor:'pointer'}}/>}
          <span>{dislikes}</span>
        </div>
        <div className="tipcard_reaction_item">
          <BiComment />
          <span>{comments}</span>
        </div>
      </div>

      {isModalOpen && (
        <TextModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          mode={modalMode}
          title={title}
          onConfirm={handleBookmarkConfirm}
        />
      )}
    </section>
  );
};

export default TipCard;