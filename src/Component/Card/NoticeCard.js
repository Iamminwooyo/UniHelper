import "./Card.css"; 
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";

const NoticeCard = ({ profile, name, date, check, content, image, bookmarked, onBookmarkToggle }) => {
  return (
    <section className="noticecard_layout">
      {check === 0 ? (
        <img src={image} alt="공지 이미지" className="noticecard_image" />
      ) : (
        <div className="noticecard_content">{content}</div>
      )}

      <div className="noticecard_info">
        <div className="noticecard_profile">
            <img src={profile} alt="profile" className="noticecard_profile_img" />
            <div className="noticecard_text">
                <p className="noticecard_name">{name}</p>
                <p className="noticecard_date">{date}</p>
            </div>
        </div>
        <div className="noticecard_icon" onClick={onBookmarkToggle} style={{ cursor: "pointer" }}>
          {bookmarked ? <IoBookmark size={28} /> : <IoBookmarkOutline size={28} />}
        </div>
      </div>
    </section>
  );
};

export default NoticeCard;
