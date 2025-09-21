import "./Notice.css";
import Masonry from "react-masonry-css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil"
import SearchBar from "../../Component/Search/Search";
import NoticeCard from "../../Component/Card/NoticeCard";
import NoticeModal from "../../Component/Modal/NoticeModal";
import TextModal from "../../Component/Modal/TextModal";
import { userBriefState } from "../../Recoil/Atom";
import { fetchMyNotices, deleteNotice, fetchNoticeImagePreview } from "../../API/NoticeAPI";
import { message } from "antd";

const NoticeWrite = () => {
  const [keyword, setKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [totalPages, setTotalPages] = useState(0);

  const blockSize = 5; 
  const currentBlock = Math.floor((currentPage - 1) / blockSize);
  const startPage = currentBlock * blockSize + 1;
  const endPage = Math.min(startPage + blockSize - 1, totalPages);

  const [myNotices, setMyNotices] = useState([]);

  const isFetchingRef = useRef(false);
  const [isFetchingMyNotices, setIsFetchingMyNotices] = useState(false);
  const [isDeletingMyNotices, setIsDeletingMyNotices] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNoticeData, setEditNoticeData] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteNoticeId, setDeleteNoticeId] = useState(null);

  const user = useRecoilValue(userBriefState);

  const imageCacheRef = useRef(new Map());

  const navigate = useNavigate();

  // 작성한 공지사항 조회 함수
  const loadMyNotices = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFetchingMyNotices(true);

    try {
      const data = await fetchMyNotices({
        page: currentPage,
        size: pageSize,
        keyword,
      });

      const list = data.content || [];

      const withPreview = await Promise.all(
        list.map(async (item) => {
          const filename = item?.images?.[0]?.url;
          if (!filename) return { ...item, previewUrl: null };

          if (imageCacheRef.current.has(filename)) {
            return { ...item, previewUrl: imageCacheRef.current.get(filename) };
          }

          try {
            const blob = await fetchNoticeImagePreview(filename);
            const url = URL.createObjectURL(blob);
            imageCacheRef.current.set(filename, url);
            return { ...item, previewUrl: url };
          } catch {
            return { ...item, previewUrl: null };
          }
        })
      );

      setMyNotices(withPreview);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("fetchMyNotices 오류:", error);
      message.error("작성 공지사항을 불러오는데 실패했습니다.");
    } finally {
      setIsFetchingMyNotices(false);
      isFetchingRef.current = false;
    }
  }, [currentPage, pageSize, keyword]);

  // 작성한 공지사항 삭제 함수
  const handleDeleteConfirm = async () => {
    if (isDeletingMyNotices) return;
    setIsDeletingMyNotices(true);

    try {
      await deleteNotice(deleteNoticeId);
      message.success("공지사항이 삭제되었습니다.");

      setIsDeleteModalOpen(false);
      setDeleteNoticeId(null);

      if (myNotices.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        loadMyNotices();
      }
    } catch (error) {
      console.error("handleDeleteConfirm 오류:", error);
      message.error("공지사항 삭제에 실패했습니다.");
    } finally {
      setIsDeletingMyNotices(false);
    }
  };

  // 렌더링 함수
  useEffect(() => {
    loadMyNotices();
  }, [loadMyNotices]);

  // 이미지 메모리 정리 함수
  useEffect(() => {
    return () => {
      for (const url of imageCacheRef.current.values()) {
        try { URL.revokeObjectURL(url); } catch {}
      }
      imageCacheRef.current.clear();
    };
  }, []);

  // 공지사항 클릭 함수
  const handleCardClick = (id) => {
    navigate(`/notice/${id}`);
  };

  // 공지사항 수정 클릭 함수
  const handleEditClick = (noticeId) => {
    const notice = myNotices.find((n) => n.id === noticeId);
    if (notice) {
      setEditNoticeData(notice);
      setIsEditModalOpen(true);
    }
  };

  // 공지사항 삭제 클릭 함수
  const handleDeleteClick = (noticeId) => {
    setDeleteNoticeId(noticeId);
    setIsDeleteModalOpen(true);
  };

  // 수정 모달 닫기 함수
  const handleEditModalCancel = () => {
    setIsEditModalOpen(false);
    setEditNoticeData(null);
  };

  // 삭제 모달 닫기 함수
  const handleDeleteModalCancel = () => {
    setIsDeleteModalOpen(false);
    setDeleteNoticeId(null); 
  };

  // 검색어 함수
  const handleSearchChange = (newKeyword) => {
    const next = newKeyword.trim();
    if (next === keyword) return;
    setKeyword(next);
    setCurrentPage(1);
  };

  return (
    <main className="notice_layout">
      <section className="notice_header">
        <h2 className="notice_header_title">작성 목록</h2>
        <SearchBar onSearchChange={handleSearchChange} />
      </section>

      <section className="notice_body">
        {isFetchingMyNotices ? (
          <div className="notice_empty">불러오는 중...</div>
        ) : myNotices.length === 0 ? (
          <div className="notice_empty">작성한 공지사항이 없습니다.</div>
        ) : (
          <>
            <Masonry
              breakpointCols={{ default: 3, 768: 2 }}
              className="notice_post"
              columnClassName="notice_post_column"
            >
              {myNotices.map((post) => (
                <NoticeCard
                  key={post.id}
                  id={post.id}
                  profile={post.authorProfileImageUrl}
                  authorid={post.authorId}
                  title={post.title}
                  name={post.authorName}
                  createdAt={post.createdAt}
                  updatedAt={post.updatedAt}
                  images={post.previewUrl ?? null}
                  content={post.text}
                  bookmarked={post.bookmarked}
                  Type="write"
                  isOwner={user.userId === post.authorId}
                  role={user.roleType} 
                  onClick={() => handleCardClick(post.id)}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </Masonry>

            {totalPages > 1 && (
              <div className="notice_page_wrap" style={{ textAlign: "center" }}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="notice_page_button"
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
                  className="notice_page_button"
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {isEditModalOpen && editNoticeData && (
        <NoticeModal
          open={isEditModalOpen}
          onCancel={handleEditModalCancel}
          mode="edit"
          initialData={editNoticeData}
          onSuccess={loadMyNotices} 
        />
      )}

      {isDeleteModalOpen && (
        <TextModal
          open={isDeleteModalOpen}
          onCancel={handleDeleteModalCancel}
          onConfirm={handleDeleteConfirm}
          mode="noticedelete"
        />
      )}
    </main>
  );
};

export default NoticeWrite;
