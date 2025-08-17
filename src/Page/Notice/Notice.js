import "./Notice.css";
import Masonry from "react-masonry-css";
import { useState, useEffect, useCallback, useRef  } from "react";
import { useRecoilValue } from "recoil"
import { useNavigate } from "react-router-dom";
import SearchBar from "../../Component/Search/Search";
import NoticeCard from "../../Component/Card/NoticeCard";
import NoticeModal from "../../Component/Modal/NoticeModal";
import TextModal from "../../Component/Modal/TextModal";
import { noticeOptions } from "../../Data/NoticeOption";
import { tagColorsPool } from "../../Data/TagColor";
import { userBriefState } from "../../Recoil/Atom";
import { fetchNotices, deleteNotice, fetchNoticeImagePreview } from "../../API/NoticeAPI";
import { Cascader, Tag, message } from "antd";
import { TbEdit } from "react-icons/tb";
import { IoClose } from "react-icons/io5";

// 태그 랜덤 색상 함수
const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * tagColorsPool.length);
  return tagColorsPool[randomIndex];
};

const Notice = () => {
  const [keyword, setKeyword] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagColors, setTagColors] = useState({});
  const [cascaderValue, setCascaderValue] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [totalPages, setTotalPages] = useState(0);

  const [Notices, setNotices] = useState([]); 

  const isFetchingRef = useRef(false);
  const [isFetchingNotices, setIsFetchingNotices] = useState(false);
  const [isDeletingNotices, setIsDeletingNotices] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNoticeData, setEditNoticeData] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteNoticeId, setDeleteNoticeId] = useState(null);

  const user = useRecoilValue(userBriefState);

  const imageCacheRef = useRef(new Map());

  const navigate = useNavigate();

  // 공지사항 조회 함수
  const loadNotices = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFetchingNotices(true);

    try {
      const data = await fetchNotices({
        page: currentPage,
        size: pageSize,
        keyword,
        departments: selectedTags,
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

      setNotices(withPreview);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("fetchNotices 오류:", error);
      message.error("공지사항을 불러오는데 실패했습니다.");
    } finally {
      setIsFetchingNotices(false);
      isFetchingRef.current = false;
    }
  }, [currentPage, pageSize, keyword, selectedTags]);

   // 공지사항 삭제 함수
  const handleDeleteConfirm = async () => {
    if (isDeletingNotices) return;
    setIsDeletingNotices(true);

    try {
      await deleteNotice(deleteNoticeId);
      message.success("공지사항이 삭제되었습니다.");

      setIsDeleteModalOpen(false);
      setDeleteNoticeId(null);

      if (Notices.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        loadNotices();
      } 
    } catch (error) {
      console.error("handleDeleteConfirm 오류:", error);
      message.error("공지사항 삭제에 실패했습니다.");
    } finally {
      setIsDeletingNotices(false);
    }
  };

  // 렌더링 함수
  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

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

  // 구독 상태 변환 함수
  const handleBookmarkToggle = () => {
    loadNotices();
  };

  // 검색어 함수
  const handleSearchChange = (newKeyword) => {
    const next = newKeyword.trim();
    if (next === keyword) return;
    setKeyword(next);
    setCurrentPage(1);
  };

  // 태그 추가 함수
  const onFilterChange = (value) => {
    if (!value?.length) return;         
    const tagStr = value[value.length - 1];
    if (!tagStr || selectedTags.includes(tagStr)) {
      setCascaderValue([]);             
      return;
    }
    setSelectedTags((prev) => [...prev, tagStr]);
    setTagColors((prev) => ({ ...prev, [tagStr]: getRandomColor() }));
    setCurrentPage(1);
    setCascaderValue([]);
  };

  // 태그 삭제 함수
  const handleTagClose = (removedTag) => {
    setSelectedTags((prev) => {
      const next = prev.filter((tag) => tag !== removedTag);
      if (next.length === prev.length) return prev; 
      setCurrentPage(1);
      return next;
    });
    setTagColors((prev) => {
      const next = { ...prev };
      delete next[removedTag];
      return next;
    });
  };

  // 공지사항 수정 클릭 함수
  const handleEditClick = (noticeId) => {
    const notice = Notices.find((n) => n.id === noticeId);
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

  // 작성 모달 닫기 함수
  const handleCreateModalCancel = () => {
    setIsCreateModalOpen(false);
  }  

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

  return (
    <main className="notice_layout">
      <section className="notice_header">
        <h2 className="notice_header_title">공지사항</h2>
        <SearchBar onSearchChange={handleSearchChange} />
      </section>

      <section className="notice_body">
        <div className="notice_fillter">
          <Cascader
            options={noticeOptions}
            onChange={onFilterChange}
            placeholder="필터"
            changeOnSelect={false}
            value={cascaderValue}
            className="notice_filter_select"
            dropdownClassName="notice_filter_dropdown"
          />
          <div className="notice_fillter_group">
            {selectedTags.map((tag) => (
              <Tag
                key={tag}
                closable
                onClose={() => handleTagClose(tag)}
                color={tagColors[tag]}
                closeIcon={
                  <IoClose
                    style={{
                      position: "absolute",
                      top: -1,
                      right: 0,
                      fontSize: 16,
                      color: "#000000",
                      opacity: 0.5,
                      cursor: "pointer",
                    }}
                  />
                }
              >
                {tag}
              </Tag>
            ))}
          </div>

          {(user.roleType !== "STUDENT") && (
            <TbEdit
              className="notice_write_icon"
              onClick={() => setIsCreateModalOpen(true)}
            />
          )}
        </div>

        {isFetchingNotices ? (
          <div className="notice_empty">불러오는 중...</div>
        ) : Notices.length === 0 ? (
          <div className="notice_empty">공지사항이 존재하지 않습니다.</div>
        ) : (
          <>
            <Masonry
              breakpointCols={{ default: 3, 768: 2 }}
              className="notice_post"
              columnClassName="notice_post_column"
            >
              {Notices.map((post) => (
                <NoticeCard
                  key={post.id}
                  id={post.id}
                  authorid={post.authorId}
                  title={post.title}
                  name={post.authorName}
                  createdAt={post.createdAt}
                  updatedAt={post.updatedAt}
                  images={post.previewUrl ?? null}
                  content={post.text}
                  bookmarked={post.bookmarked}
                  onBookmarkToggle={handleBookmarkToggle}
                  Type="notice"
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

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`notice_page_button ${currentPage === pageNum ? "active" : ""}`}
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

      {isCreateModalOpen && (
        <NoticeModal
          open={isCreateModalOpen}
          onCancel={handleCreateModalCancel}
          mode="create"
          onSuccess={loadNotices} 
        />
      )}

      {isEditModalOpen && editNoticeData && (
        <NoticeModal
          open={isEditModalOpen}
          onCancel={handleEditModalCancel}
          mode="edit"
          initialData={editNoticeData}
          onSuccess={loadNotices} 
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

export default Notice;
