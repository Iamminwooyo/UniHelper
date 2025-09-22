import "./Notice.css";
import Masonry from "react-masonry-css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import SearchBar from "../../Component/Search/Search";
import NoticeCard from "../../Component/Card/NoticeCard";
import TextModal from "../../Component/Modal/TextModal";
import { fetchSubscribedAuthors, fetchSubscribedNotices, fetchAuthorNotices, fetchNoticeImagePreview, unsubscribeAuthor } from "../../API/NoticeAPI";
import { message, Drawer, Button } from "antd";
import { IoBookmark } from "react-icons/io5";
import { MenuOutlined } from "@ant-design/icons";


const NoticeSub = () => {
  const [keyword, setKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [totalPages, setTotalPages] = useState(0);

  const blockSize = 5; 
  const currentBlock = Math.floor((currentPage - 1) / blockSize);
  const startPage = currentBlock * blockSize + 1;
  const endPage = Math.min(startPage + blockSize - 1, totalPages);

  const [SubListes, setSubListes] = useState([]);   
  const [SubNotices, setSubNotices] = useState([]);

  const fetchingListesRef = useRef(false);
  const [isFetchingListes, setisFetchingListes] = useState(false);
  const fetchingNoticesRef = useRef(false);
  const [isFetchingNotices, setisFetchingNotices] = useState(false);
  const fetchingAuthorRef = useRef(false);
  const [isFetchingAuthor, setisFetchingAuthor] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState(null);
  const [selectedAuthorName, setSelectedAuthorName] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const savedUser = sessionStorage.getItem("userBrief");
  const user = savedUser ? JSON.parse(savedUser) : {};

  const imageCacheRef = useRef(new Map());

  const navigate = useNavigate();

  const isMobile = useMediaQuery({ maxWidth: 768 });

  // 이미지 함수
  const withPreviewUrls = useCallback(async (list) => {
    return Promise.all(
      (list || []).map(async (item) => {
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
  }, []);

  // 구독 목록 함수
  const loadSubscribedListes = useCallback(async () => {
    if (fetchingListesRef.current) return;
    fetchingListesRef.current = true;
    setisFetchingListes(true);
    try {
      const data = await fetchSubscribedAuthors();
      setSubListes(data || []);
    } catch (e) {
      console.error("구독 목록 불러오기 실패:", e);
      message.error("구독 목록을 불러오지 못했습니다.");
    } finally {
      setisFetchingListes(false);
      fetchingListesRef.current = false;
    }
  }, []);

  // 구독한 공지사항 조회 함수
  const loadSubscribedNotices = useCallback(async () => {
    if (fetchingNoticesRef.current) return;
    fetchingNoticesRef.current = true;
    setisFetchingNotices(true);
    try {
      const res = await fetchSubscribedNotices({
        page: currentPage,
        size: pageSize,
        keyword,
      });
      const list = res?.content || [];
      const decorated = await withPreviewUrls(list);
      setSubNotices(decorated);
      setTotalPages(res?.totalPages || 0);
    } catch (e) {
      console.error("구독 공지사항 불러오기 실패:", e);
      message.error("구독 공지사항을 불러오지 못했습니다.");
    } finally {
      setisFetchingNotices(false);
      fetchingNoticesRef.current = false;
    }
  }, [currentPage, keyword, withPreviewUrls]);

  // 구독한 특정 공지사항 조회 함수
  const loadAuthorNotices = useCallback(async () => {
    if (!selectedAuthorId) return;
    if (fetchingAuthorRef.current) return;
    fetchingAuthorRef.current = true;
    setisFetchingAuthor(true);
    try {
      const res = await fetchAuthorNotices({
        authorId: selectedAuthorId,
        page: currentPage,
        size: pageSize,
        keyword,
      });
      const list = res?.content || [];
      const decorated = await withPreviewUrls(list);
      setSubNotices(decorated);
      setTotalPages(res?.totalPages || 0);
    } catch (e) {
      console.error("특정 작성자 공지사항 불러오기 실패:", e);
      message.error("작성자 공지사항을 불러오지 못했습니다.");
    } finally {
      setisFetchingAuthor(false);
      fetchingAuthorRef.current = false;
    }
  }, [selectedAuthorId, currentPage, keyword, withPreviewUrls]);

  // 구독 취소 함수
  const handleUnsubscribe = async () => {
    if (bookmarkLoading || !selectedAuthorId) return;
    setBookmarkLoading(true);
    try {
      await unsubscribeAuthor(selectedAuthorId);
      message.success(`${selectedAuthorName} 구독을 취소했습니다.`);

      await loadSubscribedListes();

      setSelectedOrg(null);
      setSelectedAuthorId(null);
      setSelectedAuthorName("");
      setCurrentPage(1);
      await loadSubscribedNotices();

      closeModal();
    } catch (e) {
      message.error("구독 취소 중 오류가 발생했습니다.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  // 렌더링 함수
  useEffect(() => {
    loadSubscribedListes();
  }, [loadSubscribedListes]);

  // 키워드/작성자/페이지 변경 시 공지 목록 로딩
  useEffect(() => {
    if (selectedAuthorId) {
      loadAuthorNotices();
    } else {
      loadSubscribedNotices();
    }
  }, [selectedAuthorId, currentPage, keyword, loadAuthorNotices, loadSubscribedNotices]);

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
  const navigateToDetail = (id) => navigate(`/notice/${id}`);

  // 검색어 함수
  const handleSearchChange = (newKeyword) => {
    const next = newKeyword.trim();
    if (next === keyword) return;
    setKeyword(next);
    setCurrentPage(1);
  };

  // 특정 작성자 클릭 함수
  const handleOrgClick = (authorName, authorId) => {
    if (selectedAuthorId === authorId) {
      setSelectedOrg(null);
      setSelectedAuthorId(null);
      setSelectedAuthorName("");
      setCurrentPage(1);
    } else {
      setSelectedOrg(authorName);
      setSelectedAuthorId(authorId);
      setSelectedAuthorName(authorName);
      setCurrentPage(1);
    }
  };

  // 구독 모달 열기 함수
  const openModal = (authorId, name) => {
    setSelectedAuthorId(authorId);
    setSelectedAuthorName(name);
    setIsModalOpen(true);
  };

  // 구독 모달 닫기 함수
  const closeModal = () => {
    setIsModalOpen(false);
  }  

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

   return (
    <main className="subscribe_layout">
      <section className="subscribe_header">
        <h2 className="subscribe_header_title">구독 관리</h2>
        <SearchBar onSearchChange={handleSearchChange} />
      </section>

      <section className="subscribe_body">
  {/* PC 전용 */}
  {!isMobile ? (
    <>
      {/* 구독 목록 */}
      <div className="subscribe_text">
        <p className="subscribe_title">구독 목록</p>
        {isFetchingListes ? (
          <p className="subscribe_empty">불러오는 중...</p>
        ) : SubListes.length > 0 ? (
          SubListes.map((org) => (
            <div
              className={`subscribe_list ${selectedOrg === org.authorName ? "active" : ""}`}
              key={org.authorId}
              onClick={() => handleOrgClick(org.authorName, org.authorId)}
            >
              <div className="subscribe_profile">
                <img src={org.authorProfileImageUrl || "/image/profile.png"} alt={org.authorName} className="subscribe_profile_img" />
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

      {/* 공지사항 목록 (PC Masonry) */}
      <div className="subscribe_posts_wrapper">
        {isFetchingNotices || isFetchingAuthor ? (
          <div className="notice_empty">불러오는 중...</div>
        ) : SubNotices.length > 0 ? (
          <>
            <Masonry
              breakpointCols={{ default: 3, 1241: 2 }}
              className="subscribe_post"
              columnClassName="subscribe_post_column"
            >
              {SubNotices.map((post) => (
                <NoticeCard
                  key={post.id}
                  id={post.id}
                  authorid={post.authorId}
                  title={post.title}
                  profile={post.authorProfileImageUrl}
                  name={post.authorName}
                  createdAt={post.createdAt}
                  updatedAt={post.updatedAt}
                  images={post.previewUrl ?? null}
                  content={post.text}
                  bookmarked={post.bookmarked}
                  Type="bookmark"
                  isOwner={user.userId === post.authorId}
                  role={user.roleType}
                  onClick={() => navigateToDetail(post.id)}
                />
              ))}
            </Masonry>
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="notice_page_wrap" style={{ textAlign: "center" }}>
                <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="notice_page_button">
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
                <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="notice_page_button">
                  &gt;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="notice_empty">공지사항이 존재하지 않습니다.</div>
        )}
      </div>
    </>
  ) : (
    <>
      {/* 모바일 전용 버튼 */}
      <div className="subscribe_panel_wrap">
        <div className="subscribe_panel_button" onClick={openDrawer}>구독 목록</div>
        {/* <MenuOutlined className="subscribe_panel_button" onClick={openDrawer} /> */}
      </div>

      {isDrawerOpen && (
        <div className="subscribe_mask" onClick={closeDrawer}></div>
      )}
      <div className={`subscribe_panel ${isDrawerOpen ? "open" : ""}`}>
        <div className="subscribe_panel_header">
          <p className="subscribe_title">구독 목록</p>
        </div>
        {isFetchingListes ? (
          <p className="subscribe_empty">불러오는 중...</p>
        ) : SubListes.length > 0 ? (
          SubListes.map((org) => (
            <div
              className={`subscribe_list ${selectedOrg === org.authorName ? "active" : ""}`}
              key={org.authorId}
              onClick={() => {
                handleOrgClick(org.authorName, org.authorId);
              }}
            >
              <div className="subscribe_profile">
                <img src="/image/profile.png" alt={org.authorName} className="subscribe_profile_img" />
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

      {/* 모바일 공지사항 목록 (Notice 처럼 Masonry) */}
      {isFetchingNotices || isFetchingAuthor ? (
        <div className="notice_empty">불러오는 중...</div>
      ) : SubNotices.length > 0 ? (
        <>
          <Masonry
            breakpointCols={{ default: 3, 768: 2 }}
            className="notice_post"
            columnClassName="notice_post_column"
          >
            {SubNotices.map((post) => (
              <NoticeCard
                key={post.id}
                id={post.id}
                authorid={post.authorId}
                title={post.title}
                profile={post.profile}
                name={post.authorName}
                createdAt={post.createdAt}
                updatedAt={post.updatedAt}
                images={post.previewUrl ?? null}
                content={post.text}
                bookmarked={post.bookmarked}
                Type="bookmark"
                isOwner={user.userId === post.authorId}
                role={user.roleType}
                onClick={() => navigateToDetail(post.id)}
              />
            ))}
          </Masonry>
          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="notice_page_wrap" style={{ textAlign: "center" }}>
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="notice_page_button">
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
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="notice_page_button">
                &gt;
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="notice_empty">공지사항이 존재하지 않습니다.</div>
      )}
    </>
  )}
</section>


      {isModalOpen && (
        <TextModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          mode="noticeunsubscribe"
          name={selectedAuthorName}
          onConfirm={handleUnsubscribe}
          loading={bookmarkLoading}
        />
      )}
    </main>
  );
};

export default NoticeSub;