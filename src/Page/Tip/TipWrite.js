import "./Tip.css";
import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../Component/Search/Search";
import TipModal from "../../Component/Modal/TipModal";
import TextModal from "../../Component/Modal/TextModal";
import TipCard from "../../Component/Card/TipCard";
import axios from "axios";

const TipWrite = () => {
  const [keyword, setKeyword] = useState("");
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);        // 페이지 상태 추가
  const [totalPages, setTotalPages] = useState(0); // 총 페이지 수

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTipData, setEditTipData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTipId, setDeleteTipId] = useState(null);

  const navigate = useNavigate();

  // 작성 목록 조회 API
  const fetchMyTips = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get("/community/mine", {
        headers,
        params: {
          page,
          size: 6,
          keyword: keyword || "",
          sort: "latest",
        },
      });

      setTips(response.data.content || []);
      setTotalPages(response.data.totalPages || 0); // 총 페이지 수 업데이트
    } catch (error) {
      console.error("작성 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    fetchMyTips();
  }, [fetchMyTips]);

  // 날짜 변환
  const formatDate = (createdAt, updatedAt) => {
    const format = (dateStr) => new Date(dateStr).toISOString().split("T")[0];
    if (updatedAt) {
      return `${format(updatedAt)} (수정됨)`;
    }
    return format(createdAt);
  };

  const openEditModal = (tip) => {
    setEditTipData(tip);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditTipData(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (id) => {
    setDeleteTipId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteTipId(null);
    setIsDeleteModalOpen(false);
  };

  // Tip 삭제 API
  const handleDeleteConfirm = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        message.error("로그인이 필요합니다.");
        closeDeleteModal();
        return;
      }

      await axios.delete(`/community/${deleteTipId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("Tip이 삭제되었습니다.");
      closeDeleteModal();
      fetchMyTips(); // 삭제 후 목록 갱신

    } catch (error) {
      console.error("삭제 오류:", error);
      message.error("Tip 삭제에 실패했습니다.");
      closeDeleteModal();
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/tip/${id}`);
  };

  return (
    <main className="tip_layout">
      <section className="tip_header">
        <h2 className="tip_header_title">작성 목록</h2>
        <SearchBar onSearchChange={(kw) => { setKeyword(kw); setPage(0); }} />
      </section>

      <section className="tip_body">
        {loading ? (
          <div className="tip_loading">불러오는 중...</div>
        ) : tips.length === 0 ? (
          <div className="tip_empty">작성한 Tip이 존재하지 않습니다.</div>
        ) : (
          <>
            <div
             style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "30px",
                width: "100%",
              }}
            >
              {tips.map((tip) => (
                <TipCard
                  key={tip.id}
                  id={tip.id}
                  name={tip.authorName}
                  date={formatDate(tip.createdAt, tip.updatedAt)}
                  title={tip.title}
                  content={tip.text}
                  images={tip.imageUrls}
                  bookmarked={tip.bookmarked}
                  liked={tip.liked}        
                  disliked={tip.disliked}   
                  likes={tip.likeCount}
                  dislikes={tip.dislikeCount}
                  comments={tip.commentCount}
                  tags={tip.tags}
                  type="write"
                  onEdit={() => openEditModal(tip)}
                  onDelete={() => openDeleteModal(tip.id)}
                  onClick={() => handleCardClick(tip.id)}
                />
              ))}
            </div>

           {totalPages > 1 && (
              <div className="tip_page_wrap">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                  className="tip_page_button"
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum - 1)}
                    className={`tip_page_button ${page === pageNum - 1 ? "active" : ""}`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={page === totalPages - 1}
                  className="tip_page_button"
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <TipModal
        open={isEditModalOpen}
        onCancel={closeEditModal}
        mode="edit"
        initialData={editTipData}
        onSuccess={() => {
          closeEditModal();
          fetchMyTips();
        }}
      />

      <TextModal
        open={isDeleteModalOpen}
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        mode="tipdelete"
      />
    </main>
  );
};

export default TipWrite;
