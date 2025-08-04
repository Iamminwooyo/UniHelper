import "./Notice.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { noticedata } from "../../Data/Noticedata";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const NoticeDetail = () => {
  const { id } = useParams();
  const post = noticedata.find((item) => item.id === Number(id));
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigate = useNavigate();

   if (!post) {
    return (
      <main className="notice_layout">
        <section className="notice_header">
          <h2 className="notice_header_title">공지사항</h2>
        </section>
        <section className="notice_body">
          <div className="notice_post">존재하지 않는 공지입니다.</div>
        </section>
      </main>
    );
  }

  const images = post.imageUrls || [];

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <main className="notice_layout">
      <section className="notice_header">
        <h2 className="notice_header_title">공지사항</h2>
      </section>
      <section className="notice_detail_body">
        <div className="notice_back_icon">
            <FaArrowLeft
                onClick={() => navigate(-1)}
                style={{cursor:'pointer'}}
            />
        </div>
        <div className="notice_info">
            <p className="notice_title">{post.title}</p>
            <hr className="notice_divider" />
            <div className="notice_info_block"> 
              <div className="notice_profile">
                <img src={post.profile} alt="profile" className="notice_profile_img"/>
                <div className="notice_text">
                    <p className="notice_name">{post.name}</p>
                    <p className="notice_date">{post.date}</p>
                </div>
              </div>
              <div className="notice_icon">
                  {post.bookmarked ? <IoBookmark  color="#78D900"/> : <IoBookmarkOutline />}
              </div>
            </div>
        </div>
        {post.files && post.files.length > 0 && (
            <div className="notice_file">
                <p className="notice_file_title"> 첨부파일</p>
                <ul className="notice_file_list">
                {post.files.map((file, idx) => (
                    <div key={idx} className="notice_file_item_wrapper">
                        <a
                            href={file.url}
                            download
                            className="notice_file_item"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {file.name}
                        </a>
                    </div>
                ))}
                </ul>
            </div>
        )}
        <div className="notice_detail">
        {images.length > 0 && (
            <div className="notice_detail_img_group">
                {images.length > 1 && (
                <FaArrowLeft
                    onClick={prevImage}
                    style={{ cursor: "pointer" }}
                />
                )}
                <img
                src={images[currentIndex]}
                alt={`공지 이미지 ${currentIndex + 1}`}
                className="notice_detail_img"
                />
                {images.length > 1 && (
                <FaArrowRight
                    onClick={nextImage}
                    style={{ cursor: "pointer" }}
                />
                )}
            </div>
        )}
        {post.content && (
            <div className="notice_detail_content">
            {post.content}
            </div>
        )}
        </div>
      </section>
    </main>
  );
};

export default NoticeDetail;
