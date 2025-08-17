import "./Notice.css";
import Masonry from "react-masonry-css";
import { useState, useEffect } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Cascader, Tag, message } from "antd";
import qs from 'qs';
import SearchBar from "../../Component/Search/Search";
import NoticeCard from "../../Component/Card/NoticeCard";
import NoticeModal from "../../Component/Modal/NoticeModal";
import TextModal from "../../Component/Modal/TextModal";
import { noticeOptions } from "../../Data/NoticeOption";
import { tagColorsPool } from "../../Data/TagColor";
import { userBriefState } from "../../Recoil/Atom";
import { TbEdit } from "react-icons/tb";
import { IoClose } from "react-icons/io5";

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * tagColorsPool.length);
  return tagColorsPool[randomIndex];
};

const Notice = () => {
  const [keyword, setKeyword] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagColors, setTagColors] = useState({});
  const [cascaderValue, setCascaderValue] = useState([]);

  const [notices, setNotices] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNoticeData, setEditNoticeData] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteNoticeId, setDeleteNoticeId] = useState(null);

  const [totalPages, setTotalPages] = useState(0);

  const user = useRecoilValue(userBriefState);

  const navigate = useNavigate();

  // 공지사항 조회 API
  const fetchNotices = async () => {
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

      const params = {
        page: currentPage - 1,
        size: itemsPerPage,
        keyword: keyword.trim() === "" ? null : keyword.trim(),
        departments: selectedTags.length === 0 ? null : selectedTags,
      };

      console.log("요청 params:", params);

      Object.keys(params).forEach(
        (key) => params[key] === null && delete params[key]
      );

      const response = await axios.get("/notices", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
      });

      console.log("API로 받은 데이터:", response.data);

      setNotices(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (e) {
      console.error("fetchNotices 오류:", e);
      setError("공지사항을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [keyword, selectedTags, currentPage]);

  // 구독 상태 변환 함수
  const handleBookmarkToggle = () => {
    fetchNotices();
  };

  // 검색어 바뀔 때 페이지 1로 초기화
  const handleSearchChange = (newKeyword) => {
    setKeyword(newKeyword);
    setCurrentPage(1);
  };

  // 태그 추가 시 페이지 1로 초기화
  const onFilterChange = (value) => {
    const tagStr = value[value.length - 1];
    if (!selectedTags.includes(tagStr)) {
      setSelectedTags((prev) => [...prev, tagStr]);
      setTagColors((prev) => ({
        ...prev,
        [tagStr]: getRandomColor(),
      }));
      setCurrentPage(1);
    }
    setCascaderValue([]);
  };

  // 태그 삭제 시 페이지 1로 초기화
  const handleTagClose = (removedTag) => {
    setSelectedTags((prev) => {
      const newTags = prev.filter((tag) => tag !== removedTag);
      setCurrentPage(1);
      return newTags;
    });
    setTagColors((prev) => {
      const newColors = { ...prev };
      delete newColors[removedTag];
      return newColors;
    });
  };

  const handleCardClick = (id) => {
    navigate(`/notice/${id}`);
  };

  // 모달 닫기 함수들
  const handleCreateModalCancel = () => setIsCreateModalOpen(false);
  const handleEditModalCancel = () => {
    setIsEditModalOpen(false);
    setEditNoticeData(null);
  };
  const handleDeleteModalCancel = () => {
    setIsDeleteModalOpen(false);
    setDeleteNoticeId(null);
  };

  // 공지사항 삭제 API
  const handleDeleteConfirm = async () => {

  if (deleting) return; 
  setDeleting(true);

  try {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      message.error("로그인이 필요합니다.");
      return;
    }

    await axios.delete(`/notices/${deleteNoticeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    message.success("공지사항이 삭제되었습니다.");

    setIsDeleteModalOpen(false);
    setDeleteNoticeId(null);
    setCurrentPage(1);
    fetchNotices();

  } catch (error) {
    console.error("삭제 오류:", error);
    message.error("공지사항 삭제에 실패했습니다.");
  } finally {
    setDeleting(false);
  }
};

  // 카드 내 수정 버튼 클릭 시 호출할 함수 (NoticeCard에서 props로 전달)
  const handleEditClick = (noticeId) => {
    const notice = notices.find((n) => n.id === noticeId);
    if (notice) {
      setEditNoticeData(notice);
      setIsEditModalOpen(true);
    }
  };

  // 카드 내 삭제 버튼 클릭 시 호출할 함수 (NoticeCard에서 props로 전달)
  const handleDeleteClick = (noticeId) => {
    setDeleteNoticeId(noticeId);
    setIsDeleteModalOpen(true);
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

          {(user.roleType === "MANAGER") && (
            <TbEdit
              className="notice_write_icon"
              onClick={() => setIsCreateModalOpen(true)}
            />
          )}
        </div>

        {notices.length === 0 ? (
          <div className="notice_empty">공지사항이 존재하지 않습니다.</div>
        ) : (
          <>
            <Masonry
              breakpointCols={{ default: 3, 768: 2 }}
              className="notice_post"
              columnClassName="notice_post_column"
            >
              {notices.map((post) => (
                <NoticeCard
                  key={post.id}
                  id={post.id}
                  authorid={post.authorId}
                  title={post.title}
                  name={post.authorName}
                  createdAt={post.createdAt}
                  updatedAt={post.updatedAt}
                  images={post.thumbnailUrl}
                  content={post.text}
                  bookmarked={post.bookmarked}
                  onBookmarkToggle={handleBookmarkToggle}
                  currentUserRole={user.roleType} 
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

      {/* 작성용 NoticeModal */}
      {isCreateModalOpen && (
        <NoticeModal
          open={isCreateModalOpen}
          onCancel={handleCreateModalCancel}
          mode="create"
          onSuccess={() => {
            fetchNotices();
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {/* 수정용 NoticeModal */}
      {isEditModalOpen && editNoticeData && (
        <NoticeModal
          open={isEditModalOpen}
          onCancel={handleEditModalCancel}
          mode="edit"
          initialData={editNoticeData}
          onSuccess={() => {
            fetchNotices();
            setIsEditModalOpen(false);
            setEditNoticeData(null);
          }}
        />
      )}

      {/* 삭제용 TextModal */}
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
