import "./Card.css";
import { useState } from "react";
import axios from "axios";
import TextModal from "../Modal/TextModal";
import { useRecoilValue } from "recoil";
import { userBriefState } from "../../Recoil/Atom";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { AiOutlineLike,AiOutlineDislike, AiFillLike, AiFillDislike } from "react-icons/ai";
import { BiComment } from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import { Tag, Dropdown, Menu, message } from "antd";
import { useMemo } from "react";

// 무작위 색상 pool
const tagColorsPool = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
];

const getRandomColor = () => {
  return tagColorsPool[Math.floor(Math.random() * tagColorsPool.length)];
};

const TipCard = ({
  id,
  profile,
  name,
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
  onClick
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("tipsubscribe");

  const userBrief = useRecoilValue(userBriefState);

  // 태그별 고정 랜덤 색상 맵 (컴포넌트 단위에서 유지됨)
  const tagColorMap = useMemo(() => {
    const map = {};
    tags.forEach((tag) => {
      if (!map[tag]) {
        map[tag] = getRandomColor();
      }
    });
    return map;
  }, [tags.join(",")]);

  const handleMenuClick = (info) => {
    info.domEvent.stopPropagation(); // 클릭 이벤트 버블링 방지
    if (info.key === "edit") {
      onEdit?.(id);
    } else if (info.key === "delete") {
      onDelete?.(id);
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    setModalMode(bookmarked ? "tipunsubscribe" : "tipsubscribe");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Tip 저장 / 취소 API
  const handleConfirm = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        message.error("로그인이 필요합니다.");
        return;
      }

      await axios.post(`/community/${id}/bookmark`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success(
        bookmarked ? `"${title}" Tip 저장을 취소했습니다.` : `"${title}" Tip을 저장했습니다.`
      );

      setIsModalOpen(false);

      // 필요 시 부모 콜백 호출
      if (typeof onBookmarkToggle === "function") {
        onBookmarkToggle(id);
      }
    } catch (error) {
      message.error("북마크 처리 중 오류가 발생했습니다.");
    }
  };
  
  // 반응 API
  const handleReaction = async (type) => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      message.error("로그인이 필요합니다.");
      return;
    }

    try {
      await axios.post(`/community/${id}/reactions`, 
        { type }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success(type === "LIKE" ? "좋아요가 업데이트되었습니다." : "싫어요가 업데이트되었습니다.");

      // 부모에서 데이터를 다시 fetch 하고 싶으면 별도의 콜백 사용
      if (typeof onBookmarkToggle === "function") {
        onBookmarkToggle(); // 예: fetchTips
      }
      
    } catch (error) {
      message.error("반응 처리 중 오류가 발생했습니다.");
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
    <section className="tipcard_layout">
      <div className="tipcard_header">
        <span className="tipcard_title" onClick={onClick}>{title}</span>
        <div className="tipcard_icon">
            {type !== "write" && (
              bookmarked ? (
                <IoBookmark
                  color="#78D900"
                  style={{ cursor: "pointer" }}
                  onClick={handleBookmarkClick}
                />
              ) : (
                <IoBookmarkOutline
                  color="#78D900"
                  style={{ cursor: "pointer" }}
                  onClick={handleBookmarkClick}
                />
              )
            )}

             {(isOwner || type === "write") && (
                <Dropdown overlay={menu} trigger={["click"]}>
                  <div
                    style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HiDotsVertical />
                  </div>
                </Dropdown>
              )}

              {/* 2. Owner 아니고 tip 타입이면서 Manager면 삭제 아이콘만 */}
              {!isOwner && type === "tip" && userBrief.roleType === "MANAGER" && (
                <MdDeleteOutline
                  className="tipcard_icon"
                  style={{ cursor: "pointer" }}
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
          <img src={profile} alt="profile" className="tipcard_profile_img" />
          <div className="tipcard_text">
            <p className="tipcard_name">{name}</p>
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
          {images && images.length > 0 && (
            <img src={images[0]} alt={title} className="tipcard_img"/>
          )}
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
            <BiComment/>
            <span>{comments}</span>
        </div>
      </div>

      {isModalOpen && (
        <TextModal
          open={isModalOpen}
          onCancel={closeModal}
          mode={modalMode}
          title={title}
          onConfirm={handleConfirm}
        />
      )}
    </section>
  );
};

export default TipCard;
