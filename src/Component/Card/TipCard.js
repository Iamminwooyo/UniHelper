import "./Card.css";
import { useState, useEffect, useMemo } from "react";
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
  date,
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

  const role = sessionStorage.getItem("roleType") || "";

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
      } catch {
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
      message.success(
        type === "LIKE"
          ? "좋아요가 업데이트되었습니다."
          : "싫어요가 업데이트되었습니다."
      );
      onBookmarkToggle?.();
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

  console.log("👉 TipCard Debug", {
    id,
    isOwner,
    type,
    isTip,
    isWrite,
    role,
  });

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

          {!isOwner && !isWrite && ["MANAGER", "ADMIN"].includes(role) && (
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
            <p className="tipcard_date">{date}</p>
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
        <div className="tipcard_content">{content}</div>
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