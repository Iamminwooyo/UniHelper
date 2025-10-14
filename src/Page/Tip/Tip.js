import "./Tip.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../Component/Search/Search";
import TipCard from "../../Component/Card/TipCard";
import TipModal from "../../Component/Modal/TipModal";
import TextModal from "../../Component/Modal/TextModal";
import { fetchTips, deleteTip, fetchTipImagePreview } from "../../API/TipAPI";
import { Dropdown, Menu, Button, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { TbEdit } from "react-icons/tb";

const Tip = () => {
  const [keyword, setKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState("최신순");

  const [tips, setTips] = useState([]);

  const isFetchingRef = useRef(false);
  const [isFetchingTips, setIsFetchingTips] = useState(false);
  const [isDeletingTips, setIsDeletingTips] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [totalPages, setTotalPages] = useState(0);

  const blockSize = 5; 
  const currentBlock = Math.floor((currentPage - 1) / blockSize);
  const startPage = currentBlock * blockSize + 1;
  const endPage = Math.min(startPage + blockSize - 1, totalPages);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTipData, setEditTipData] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTipId, setDeleteTipId] = useState(null);

  const savedUser = sessionStorage.getItem("userBrief");
  const user = savedUser ? JSON.parse(savedUser) : {};

  const imageCacheRef = useRef(new Map());

  const navigate = useNavigate();

 // Tip 조회 함수
  const loadTips = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFetchingTips(true);

    try {
      const data = await fetchTips({
        page: currentPage,
        size: pageSize,
        sortOrder,
        keyword,
      });

      console.log("📦 Tip 데이터:", data);

      const list = data.content || [];

      const withPreview = list.map((item) => ({
        ...item,
        previewUrl: item?.images?.[0]?.url || null,
      }));

      console.log("✅ 최종 withPreview 팁:", withPreview);

      setTips(withPreview);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("fetchTips 오류:", error);
      message.error("Tip을 불러오는데 실패했습니다.");
    } finally {
      setIsFetchingTips(false);
      isFetchingRef.current = false;
    }
  }, [currentPage, pageSize, sortOrder, keyword]);

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
        loadTips();
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      message.error("Tip 삭제에 실패했습니다.");
      setIsDeleteModalOpen(false);
      setDeleteTipId(null);
    } finally {
      setIsDeletingTips(false); 
    }
  };

  // 렌더링 함수
  useEffect(() => {
    loadTips();
  }, [loadTips]);

  // 이미지 메모리 정리 함수
  useEffect(() => {
    return () => {
      for (const url of imageCacheRef.current.values()) {
        try { URL.revokeObjectURL(url); } catch {}
      }
      imageCacheRef.current.clear();
    };
  }, []);

  // 날짜 변환 함수
  const formatDate = (createdAt, updatedAt) => {
    const format = (dateStr) => new Date(dateStr).toISOString().split("T")[0];
    return updatedAt ? `${format(updatedAt)} (수정됨)` : format(createdAt);
  };

  //검색어 함수
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

  // Tip 수정 클릭 함수
  const handleEditClick = (tip) => {
    setEditTipData(tip);
    setIsEditModalOpen(true);
  };

  // Tip 삭제 클릭 함수
  const handleDeleteClick = (tipId) => {
    setDeleteTipId(tipId);
    setIsDeleteModalOpen(true);
  };

  // 작성 모달 닫기 함수
  const handleCreateModalCancel = () => {
    setIsCreateModalOpen(false);
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

  // 메뉴
  const menu = (
    <Menu
      onClick={(e) => setSortOrder(e.key)}
      items={[
        { key: "최신순", label: "최신순" },
        { key: "인기순", label: "인기순" },
      ]}
    />
  );

  return (
    <main className="tip_layout">
      <section className="tip_header">
        <h2 className="tip_header_title">Tip 게시판</h2>
        <SearchBar onSearchChange={handleSearchChange} />
      </section>

      <section className="tip_body">
        <div className="tip_dropdown">
          <Dropdown
            overlay={menu}
            trigger={['click']}
            overlayClassName="tip_filter_dropdown"
          >
            <Button className="tip_filter_button">
              {sortOrder} <DownOutlined />
            </Button>
          </Dropdown>

          <TbEdit className="tip_icon" onClick={() => setIsCreateModalOpen(true)} />
        </div>

        {isFetchingTips ? (
          <div className="tip_empty">불러오는 중...</div>
        ) : tips.length === 0 ? (
          <div className="tip_empty">Tip이 존재하지 않습니다.</div>
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
                  title={tip.title}
                  date={formatDate(tip.createdAt, tip.updatedAt)}
                  content={tip.text}
                  images={tip.previewUrl ?? null}
                  bookmarked={tip.bookmarked}
                  onBookmarkToggle={loadTips}
                  liked={tip.myReaction === "LIKE"}
                  disliked={tip.myReaction === "DISLIKE"}
                  likes={tip.likeCount}
                  dislikes={tip.dislikeCount}
                  comments={tip.commentCount}
                  tags={tip.tags}
                  isOwner={tip.authorId === user.userId}
                  type="tip"
                  onEdit={() => handleEditClick(tip)}
                  onDelete={() => handleDeleteClick(tip.id)}
                  onClick={() => handleCardClick(tip.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="tip_page_wrap" style={{ textAlign: "center", marginTop: "30px" }}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

      {isCreateModalOpen && (
        <TipModal
          open={isCreateModalOpen}
          onCancel={handleCreateModalCancel}
          mode="create"
          onSuccess={loadTips}
        />
      )}

      {isEditModalOpen && editTipData && (
        <TipModal
          open={isEditModalOpen}
          onCancel={handleEditModalCancel}
          mode="edit"
          initialData={editTipData}
          onSuccess={loadTips}
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

export default Tip;
