import "./Tip.css";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../Component/Search/Search";
import TipCard from "../../Component/Card/TipCard";
import { useRecoilValue } from "recoil";
import { userBriefState } from "../../Recoil/Atom";
import { fetchBookmarkedTips, fetchTipImagePreview  } from "../../API/TipAPI";
import { message } from "antd";

const TipSub = () => {
  const [keyword, setKeyword] = useState("");
  const [tips, setTips] = useState([]);
  
  const [isFetchingTips, setIsFetchingTips] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [totalPages, setTotalPages] = useState(0);

  const user = useRecoilValue(userBriefState);

  const navigate = useNavigate();

  // 저장한 Tip 조회 함수
  const loadBookmarkedTips = useCallback(async () => {
    if (isFetchingTips) return;
    setIsFetchingTips(true);

    try {
      const data = await fetchBookmarkedTips({
        page: currentPage,
        size: pageSize,
        keyword,
      });

      const list = data.content || [];

      const withPreview = await Promise.all(
        list.map(async (item) => {
          const filename = item?.images?.[0]?.url;
          if (!filename) return { ...item, previewUrl: null };

          try {
            const blob = await fetchTipImagePreview(filename);
            const url = URL.createObjectURL(blob);
            return { ...item, previewUrl: url };
          } catch {
            return { ...item, previewUrl: null };
          }
        })
      );

      setTips(withPreview);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("북마크 조회 오류:", error);
      message.error("저장한 Tip을 불러오는데 실패했습니다.");
    } finally {
      setIsFetchingTips(false);
    }
  }, [currentPage, pageSize, keyword]);

  // 렌더링 시 데이터 불러오기
  useEffect(() => {
    loadBookmarkedTips();
  }, [loadBookmarkedTips]);

  // 날짜 변환 함수
  const formatDate = (createdAt, updatedAt) => {
    const format = (dateStr) => new Date(dateStr).toISOString().split("T")[0];
    return updatedAt ? `${format(updatedAt)} (수정됨)` : format(createdAt);
  };

  // Tip 클릭 함수
  const handleCardClick = (id) => {
    navigate(`/tip/${id}`);
  };

  // 검색어 함수
  const handleSearchChange = (newKeyword) => {
    const next = newKeyword.trim();
    if (next === keyword) return;  
    setKeyword(next);
    setCurrentPage(1);
  };

  return (
    <main className="tip_layout">
      <section className="tip_header">
        <h2 className="tip_header_title">저장 목록</h2>
        <SearchBar onSearchChange={handleSearchChange} />
      </section>

      <section className="tip_body">
        {isFetchingTips ? (
          <div className="tip_empty">불러오는 중...</div>
        ) : tips.length === 0 ? (
          <div className="tip_empty">저장한 Tip이 존재하지 않습니다.</div>
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
                  onBookmarkToggle={loadBookmarkedTips}
                  liked={tip.myReaction === "LIKE"}
                  disliked={tip.myReaction === "DISLIKE"}
                  likes={tip.likeCount}
                  dislikes={tip.dislikeCount}
                  comments={tip.commentCount}
                  tags={tip.tags}
                  isOwner={tip.authorId === user.userId}
                  type="bookmark"
                  onClick={() => handleCardClick(tip.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div
                className="tip_page_wrap"
                style={{ textAlign: "center", marginTop: "30px" }}
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="tip_page_button"
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`tip_page_button ${
                        currentPage === pageNum ? "active" : ""
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}

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
    </main>
  );
};

export default TipSub;
