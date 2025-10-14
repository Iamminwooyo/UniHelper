import "./Tip.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../Component/Search/Search";
import TipModal from "../../Component/Modal/TipModal";
import TextModal from "../../Component/Modal/TextModal";
import TipCard from "../../Component/Card/TipCard";
import { fetchMyTips, deleteTip, fetchTipImagePreview } from "../../API/TipAPI";
import { message } from "antd";

const TipWrite = () => {
  const [keyword, setKeyword] = useState("");
  const [tips, setTips] = useState([]);

  const [isFetching, setIsFetching] = useState(false);
  const [isDeletingTips, setIsDeletingTips] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [totalPages, setTotalPages] = useState(0);

  const blockSize = 5;
  const currentBlock = Math.floor((currentPage - 1) / blockSize);
  const startPage = currentBlock * blockSize + 1;
  const endPage = Math.min(startPage + blockSize - 1, totalPages);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTipData, setEditTipData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTipId, setDeleteTipId] = useState(null);

  const savedUser = sessionStorage.getItem("userBrief");
  const user = savedUser ? JSON.parse(savedUser) : {};

  const navigate = useNavigate();

  // ✅ Blob 캐시 & 정리 Ref
  const imageCacheRef = useRef(new Map());
  const boundUrlsRef = useRef([]);

  const cleanupBoundUrls = useCallback(() => {
    try {
      for (const url of boundUrlsRef.current) {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      }
    } finally {
      boundUrlsRef.current = [];
    }
  }, []);

  // ✅ Tip 작성 목록 조회 함수
  const loadMyTips = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);

    try {
      const data = await fetchMyTips({
        page: currentPage,
        size: pageSize,
        keyword,
      });

      const list = data.content || [];

      const withPreview = await Promise.all(
        list.map(async (item) => {
          const newItem = { ...item };

          // ✅ 1️⃣ 본문 이미지 Blob 처리
          const filename = item?.images?.[0]?.url;
          if (filename) {
            if (imageCacheRef.current.has(filename)) {
              newItem.previewUrl = imageCacheRef.current.get(filename);
            } else {
              try {
                const blob = await fetchTipImagePreview(filename);
                const blobUrl = URL.createObjectURL(blob);
                imageCacheRef.current.set(filename, blobUrl);
                boundUrlsRef.current.push(blobUrl);
                newItem.previewUrl = blobUrl;
              } catch (err) {
                console.warn("⚠️ 본문 이미지 미리보기 실패:", err);
                newItem.previewUrl = null;
              }
            }
          } else {
            newItem.previewUrl = null;
          }

          // ✅ 2️⃣ 작성자 프로필 이미지 Blob 처리
          const profilePath = item?.authorProfileImageUrl;
          if (profilePath) {
            if (imageCacheRef.current.has(profilePath)) {
              newItem.authorProfileImageUrl = imageCacheRef.current.get(profilePath);
            } else {
              try {
                const blob = await fetchTipImagePreview(profilePath);
                const blobUrl = URL.createObjectURL(blob);
                imageCacheRef.current.set(profilePath, blobUrl);
                boundUrlsRef.current.push(blobUrl);
                newItem.authorProfileImageUrl = blobUrl;
              } catch (err) {
                console.warn("⚠️ 프로필 이미지 미리보기 실패:", err);
                newItem.authorProfileImageUrl = "/image/profile.png";
              }
            }
          }

          return newItem;
        })
      );

      setTips(withPreview);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("❌ 작성 목록 조회 실패:", error);
      message.error("작성 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsFetching(false);
    }
  }, [currentPage, keyword]);

  // Tip 삭제 함수
   const handleDeleteConfirm = async () => {
    if (isDeletingTips) return;
    setIsDeletingTips(true);

    try {
      await deleteTip(deleteTipId);
      message.success("Tip이 삭제되었습니다.");

      setIsDeleteModalOpen(false);
      setDeleteTipId(null);

      if (tips.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        loadMyTips();
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      message.error("Tip 삭제에 실패했습니다.");
    } finally {
      setIsDeletingTips(false);
    }
  };

  // 렌더링 함수
  useEffect(() => {
    loadMyTips();
  }, [loadMyTips]);

  // 검색어 함수
  const handleSearchChange = (newKeyword) => {
    const next = newKeyword.trim();
    if (next === keyword) return;
    setKeyword(next);
    setCurrentPage(1);
  };

  // Tip 클릭 함수
  const handleCardClick = (id) => {
    navigate(`/tip/${id}`);
  };

  // 날짜 변환
  const formatDate = (createdAt, updatedAt) => {
    const format = (d) => new Date(d).toISOString().split("T")[0];
    return updatedAt ? `${format(updatedAt)} (수정됨)` : format(createdAt);
  };

 // Tip 수정 클릭 함수
  const handleEditClick = (tipId) => {
    const tip = tips.find((t) => t.id === tipId);
    if (tip) {
      setEditTipData(tip);
      setIsEditModalOpen(true);
    }
  };

  // Tip 삭제 클릭 함수
  const handleDeleteClick = (tipId) => {
    setDeleteTipId(tipId);
    setIsDeleteModalOpen(true);
  };

  // 수정 모달 닫기 함수
  const handleEditModalCancel = () => {
    setIsEditModalOpen(false);
    setEditTipData(null);
  };

  // 삭제 모달 닫기 함수
  const handleDeleteModalCancel = () => {
    setIsDeleteModalOpen(false);
    setDeleteTipId(null);
  };

  return (
    <main className="tip_layout">
      <section className="tip_header">
        <h2 className="tip_header_title">작성 목록</h2>
        <SearchBar onSearchChange={handleSearchChange} />
      </section>

      <section className="tip_body">
        {isFetching ? (
          <div className="tip_empty">불러오는 중...</div>
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
                  profile={tip.authorProfileImageUrl}
                  name={tip.authorName}
                  department={tip.authorDepartment}
                  date={formatDate(tip.createdAt, tip.updatedAt)}
                  title={tip.title}
                  content={tip.text}
                  images={tip.previewUrl ?? null}
                  bookmarked={tip.bookmarked}
                  liked={tip.myReaction === "LIKE"}
                  disliked={tip.myReaction === "DISLIKE"}
                  likes={tip.likeCount}
                  dislikes={tip.dislikeCount}
                  comments={tip.commentCount}
                  tags={tip.tags}
                  type="write"
                  isOwner={tip.authorId === user.userId}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onClick={() => handleCardClick(tip.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="tip_page_wrap">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="tip_page_button"
                >
                  &lt;
                </button>

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`tip_page_button ${currentPage === pageNum ? "active" : ""}`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="tip_page_button"
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {isEditModalOpen && editTipData && (
        <TipModal
          open={isEditModalOpen}
          onCancel={handleEditModalCancel}
          mode="edit"
          initialData={editTipData}
          onSuccess={loadMyTips}
        />
      )}

      {isDeleteModalOpen && (
        <TextModal
          open={isDeleteModalOpen}
          onCancel={handleDeleteModalCancel}
          onConfirm={handleDeleteConfirm}
          mode="tipdelete"
        />
      )}
    </main>
  );
};

export default TipWrite;
