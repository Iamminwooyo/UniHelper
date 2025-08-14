import "./Notice.css";
import Masonry from "react-masonry-css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import SearchBar from "../../Component/Search/Search";
import SubscribeCard from "../../Component/Card/SubscribeCard";
import TextModal from "../../Component/Modal/TextModal";
import { IoBookmark } from "react-icons/io5";

const itemsPerPage = 6;

const NoticeSub = () => {
  const [subs, setSubs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingAuthorPosts, setLoadingAuthorPosts] = useState(false);
  const [unsubmitting, setUnsubmitting] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState(null);
  const [selectedAuthorName, setSelectedAuthorName] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscribed();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [keyword, selectedOrg, currentPage]);

  // 구독 목록 조회 API
  const fetchSubscribed = async () => {
    if (loadingSubs) return;
    setLoadingSubs(true);

    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await axios.get("/bookmarks/authors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("구독자 받은 데이터:", res.data);  // 받은 데이터 콘솔 출력
      setSubs(res.data);
    } catch (error) {
      console.error("구독 목록 불러오기 실패:", error);
    } finally {
      setLoadingSubs(false);
    }
  };

  // 구독 글 조회 API
  const fetchPosts = async () => {
    if (loadingPosts) return;
    setLoadingPosts(true);

    try {
      const token = sessionStorage.getItem("accessToken");
      const params = {
        page: currentPage - 1,
        size: itemsPerPage,
        keyword: keyword.trim() === "" ? null : keyword.trim(),
        departments: selectedOrg ? [selectedOrg] : null,
      };
      const res = await axios.get("/notices/subscribed", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setPosts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (error) {
      console.error("구독 공지사항 불러오기 실패:", error);
    }  finally {
      setLoadingPosts(false);
    }
  };

  // 특정 구독 글 조회 API
  const fetchPostsByAuthor = async (authorId, page = 0, size = itemsPerPage) => {
    if (loadingAuthorPosts) return null; // 이미 호출 중이면 무시
    setLoadingAuthorPosts(true);

    console.log("fetchPostsByAuthor 호출, authorId:", authorId);
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await axios.get(`/notices/author/${authorId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, size },
      });
      console.log("받은 데이터:", res.data); 
      return res.data;
    } catch (error) {
      console.error("특정 작성자 공지사항 불러오기 실패:", error);
      return null;
    } finally {
      setLoadingAuthorPosts(false);
    }
  };

  const openModal = (authorId, name) => {
    setSelectedAuthorId(authorId);
    setSelectedAuthorName(name);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 구독 취소 API
  const handleUnsubscribe = async () => {
    if (unsubmitting) return;
    setUnsubmitting(true);

    try {
      const token = sessionStorage.getItem("accessToken");

      await axios.delete(`/bookmarks/${selectedAuthorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success(`${selectedAuthorName} 구독을 취소했습니다.`);

      await fetchSubscribed(); // 구독 목록 갱신
      await fetchPosts(); // 하단 게시글 목록 갱신

      closeModal();
    } catch (error) {
      message.error("구독 취소 중 오류가 발생했습니다.");
    } finally {
      setUnsubmitting(false);
    }
  };
  
  const handleOrgClick = async (authorName, authorId) => {
    if (selectedOrg === authorName) {
      // 선택 해제 시 전체 구독 공지 불러오기
      setSelectedOrg(null);
      setSelectedAuthorId(null);
      setCurrentPage(1);
      await fetchPosts();  // 기존 구독 글 목록 조회
    } else {
      // 특정 작성자 글 불러오기
      setSelectedOrg(authorName);
      setSelectedAuthorId(authorId);
      setCurrentPage(1);
      const data = await fetchPostsByAuthor(authorId, 0, itemsPerPage);
      if (data) {
        setPosts(data.content || []);
        setTotalPages(data.totalPages || 0);
      }
    }
  };

  const handleCardClick = (id) => {
    navigate(`/notice/${id}`);
  };

  const onPageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  return (
    <main className="subscribe_layout">
      <section className="subscribe_header">
        <h2 className="subscribe_header_title">구독 관리</h2>
        <SearchBar onSearchChange={setKeyword} />
      </section>

      <section className="subscribe_body">
        <div className="subscribe_text">
          <p className="subscribe_title">구독 목록</p>
          {subs.length > 0 ? (
            subs.map((org) => (
              <div
                className={`subscribe_list ${selectedOrg === org.authorName ? "active" : ""}`}
                key={org.authorId}                        
                onClick={() => handleOrgClick(org.authorName, org.authorId)} 
              >
                <div className="subscribe_profile">
                  <img src="/image/profile.png" alt={org.name} className="subscribe_profile_img" />
                  <p className="subscribe_name">{org.authorName}</p>
                </div>
                <div className="subscribe_icon">
                  <IoBookmark
                    color="#78D900"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(org.authorId, org.authorName);
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="subscribe_empty">구독 목록이 없습니다.</p>
          )}
        </div>

        <div className="subscribe_posts_wrapper">
          {posts.length > 0 ? (
            <>
              <Masonry
                breakpointCols={{ default: 3, 1241: 2 }}
                className="subscribe_post"
                columnClassName="subscribe_post_column"
              >
                {posts.map((post) => (
                  <SubscribeCard
                    key={post.id}
                    id={post.id}
                    authorid={post.authorId}
                    title={post.title}
                    profile={post.profile}
                    name={post.authorName}
                    createdAt={post.createdAt}
                    updatedAt={post.updatedAt}
                    images={post.thumbnailUrl}
                    content={post.text}
                    bookmarked={post.bookmarked}
                    onClick={() => handleCardClick(post.id)}
                  />
                ))}
              </Masonry>

              {totalPages > 1 && (
                <div className="notice_page_wrap" style={{ textAlign: "center" }}>
                  <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="notice_page_button"
                  >
                    &lt;
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`notice_page_button ${currentPage === pageNum ? "active" : ""}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="notice_page_button"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="notice_empty">공지사항이 존재하지 않습니다.</div>
          )}
        </div>
      </section>

      {isModalOpen && (
        <TextModal
          open={isModalOpen}
          onCancel={closeModal}
          mode="unsubscribe"
          name={selectedAuthorName}
          onConfirm={handleUnsubscribe}
        />
      )}
    </main>
  );
};

export default NoticeSub;
