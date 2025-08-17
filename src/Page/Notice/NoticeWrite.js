import "./Notice.css";
import Masonry from "react-masonry-css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import SearchBar from "../../Component/Search/Search";
import WriteCard from "../../Component/Card/WriteCard";
import NoticeModal from "../../Component/Modal/NoticeModal";
import TextModal from "../../Component/Modal/TextModal";

const NoticeWrite = () => {
  const [keyword, setKeyword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 6;

  const navigate = useNavigate();

  // 공지사항 작성 목록 조회 API
  const fetchMyNotices = async () => {
    if (loading) return
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }
      const response = await axios.get("/notices/me", {
        params: {
          page: currentPage - 1,    
          size: itemsPerPage,
          keyword: keyword.trim() || undefined,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotices(response.data.content || response.data);
      setTotalPages(response.data.totalPages || 0);
      setError(null);
    } catch (err) {
      setError("공지 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyNotices();
  }, [keyword, currentPage]);

  const handleCardClick = (id) => {
    navigate(`/notice/${id}`);
  };

  const handleEdit = (id) => {
    const notice = notices.find((n) => n.id === id);
    if (notice) {
      setEditData(notice);
      setIsModalOpen(true);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  const handleDelete = (id) => {
    const notice = notices.find((n) => n.id === id);
    if (notice) {
      setDeleteTarget(notice);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // 내가 작성한 공지사항 삭제 API 
  const handleDeleteConfirm = async () => {
    if (deleting) return; // 이미 삭제 중이면 종료
    setDeleting(true);
    if (!deleteTarget) return;

    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }
      await axios.delete(`/notices/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("공지사항이 삭제되었습니다.");
      
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      setCurrentPage(1);
      fetchMyNotices();
    } catch (error) {
      setError("공지 삭제에 실패했습니다.");
    }  finally {
      setDeleting(false);
    }
  };

  const handleSearchChange = (newKeyword) => {
    setKeyword(newKeyword);
    setCurrentPage(1);
  };

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <main className="notice_layout">
      <section className="notice_header">
        <h2 className="notice_header_title">작성 목록</h2>
        <SearchBar onSearchChange={handleSearchChange} />
      </section>

      <section className="notice_body">
        {notices.length === 0 ? (
          <div className="notice_empty">작성한 공지사항이 없습니다.</div>
        ) : (
          <>
            <Masonry
              breakpointCols={{ default: 3, 768: 2 }}
              className="notice_post"
              columnClassName="notice_post_column"
            >
              {notices.map((post) => (
                <WriteCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  name={post.authorName}
                  createdAt={post.createdAt}
                  updatedAt={post.updatedAt}
                  images={post.thumbnailUrl}
                  content={post.text}
                  bookmarked={post.bookmarked}
                  onClick={() => handleCardClick(post.id)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </Masonry>

            {totalPages > 1 && (
              <div className="notice_page_wrap" style={{ textAlign: "center", marginTop: 20 }}>
                <button
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="notice_page_button"
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`notice_page_button ${currentPage === pageNum ? "active" : ""}`}
                  >
                    {pageNum}
                  </button>
                ))}

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
        )}
      </section>

      {/* 수정 모달 */}
      {isModalOpen && (
        <NoticeModal
          open={isModalOpen}
          onCancel={handleModalCancel}
          mode="edit"
          initialData={editData}
          onSuccess={() => {
            fetchMyNotices(); 
            setIsModalOpen(false); 
            setEditData(null);
          }}
        />
      )}

      {/* 삭제 확인 모달 */}
      {deleteModalOpen && (
        <TextModal
          open={deleteModalOpen}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          mode="noticedelete"
        />
      )}
    </main>
  );
};

export default NoticeWrite;
