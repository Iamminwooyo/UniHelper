import "./Notice.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import TextModal from "../../Component/Modal/TextModal";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const NoticeDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(post?.bookmarked ? "unsubscribe" : "subscribe");

  const navigate = useNavigate();

  // 공지사항 상세정보 조회 API
   const fetchNotice = async () => {
      if (loading) return;

      setLoading(true);
      setError(null);
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`/notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPost(response.data);
      setModalMode(response.data.bookmarked ? "unsubscribe" : "subscribe");
    } catch (err) {
      setError("공지사항을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [id]);

  // 구독 API
  const handleConfirm = async () => {
    if (bookmarkLoading) return; // 이미 호출 중이면 무시
    setBookmarkLoading(true);

    try {
      const token = sessionStorage.getItem("accessToken");

      if (!post.bookmarked) {
        await axios.post(`/bookmarks/${post.authorId}`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success(`${post.department}를 구독했습니다.`);
      } else {
        await axios.delete(`/bookmarks/${post.authorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success(`${post.department} 구독을 취소했습니다.`);
      }

      await fetchNotice();

      closeModal();
    } catch (error) {
      message.error("북마크 처리 중 오류가 발생했습니다.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="notice_layout">
        <section className="notice_header">
          <h2 className="notice_header_title">공지사항</h2>
        </section>
        <section className="notice_body">
          <div className="notice_post"></div>
        </section>
      </main>
    )
  }

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

  // 모달 열기 함수
  const openModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 날짜 변환 함수
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.slice(0, 10);
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
                <img src="/image/profile.png" alt="profile" className="notice_profile_img"/>
                <div className="notice_text">
                    <p className="notice_name">{post.department}</p>
                    <p className="notice_date">
                      {post.updatedAt
                        ? `${formatDate(post.updatedAt)} (수정됨)`
                        : formatDate(post.createdAt)}
                    </p>
                </div>
              </div>
              <div
                className="notice_icon"
                style={{ cursor: "pointer" }}
                onClick={() => openModal(post.bookmarked ? "unsubscribe" : "subscribe")}
              >
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
        {post.text && (
            <div className="notice_detail_content">
            {post.text}
            </div>
        )}
        </div>

          {/* 북마크 관련 모달 렌더링 */}
        {isModalOpen && (
          <TextModal open={isModalOpen} onCancel={closeModal} mode={modalMode} name={post.department} onConfirm={handleConfirm}/>
        )}
      </section>
    </main>
  );
};

export default NoticeDetail;
