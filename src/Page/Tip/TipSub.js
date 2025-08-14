import "./Tip.css";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../Component/Search/Search";
import TipCard from "../../Component/Card/TipCard";
import axios from "axios";

const TipSub = () => {
  const [keyword, setKeyword] = useState("");
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);          // 페이지 상태
  const [totalPages, setTotalPages] = useState(0); // 총 페이지 수

  const navigate = useNavigate();

  // 저장한 Tip 조회 API
  const fetchBookmarkedTips = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get("/community/bookmarked", {
        headers,
        params: {
          page,
          size: 6,
          keyword: keyword || "",
          sort: "latest",
        },
      });

      console.log("북마크 목록:", response.data);
      setTips(response.data.content || []);
      setTotalPages(response.data.totalPages || 0); // 총 페이지 수 설정
    } catch (error) {
      console.error("북마크 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  // keyword 또는 page 변경 시 API 호출
  useEffect(() => {
    fetchBookmarkedTips();
  }, [fetchBookmarkedTips]);

  // 날짜 변환
  const formatDate = (createdAt, updatedAt) => {
    const format = (dateStr) => new Date(dateStr).toISOString().split("T")[0];
    if (updatedAt) {
      return `${format(updatedAt)} (수정됨)`;
    }
    return format(createdAt);
  };

  const handleCardClick = (id) => {
    navigate(`/tip/${id}`);
  };

  return (
    <main className="tip_layout">
      <section className="tip_header">
        <h2 className="tip_header_title">저장 목록</h2>
        <SearchBar onSearchChange={(kw) => { setKeyword(kw); setPage(0); }} />
      </section>

      <section className="tip_body">
        {loading ? (
          <div className="tip_loading">불러오는 중...</div>
        ) : tips.length === 0 ? (
          <div className="tip_empty">저장한 Tip이 존재하지 않습니다.</div>
        ) : (
          <>
            <div
              style={{
                width:'100%',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                justifyContent:'center',
                gap:'20px'
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
                  type="bookmark"
                  onClick={() => handleCardClick(tip.id)}
                />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="tip_page_wrap" style={{ textAlign: "center", marginTop: 20 }}>
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
    </main>
  );
};

export default TipSub;
