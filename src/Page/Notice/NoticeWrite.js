import "./Notice.css";
import Masonry from "react-masonry-css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../Component/Search/Search";
import WriteCard from "../../Component/Card/WriteCard";
import { noticedata } from "../../Data/Noticedata";

const NoticeWrite = () => {
  const [keyword, setKeyword] = useState("");

  const navigate = useNavigate();

  const handleCardClick = (id) => {
    navigate(`/notice/${id}`);
  };

  return (
    <main className="notice_layout">
      <section className="notice_header">
        <h2 className="notice_header_title">작성 목록</h2>
        <SearchBar onSearchChange={setKeyword} />
      </section>
      <section className="notice_body">
        <Masonry
          breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
          className="notice_post"
          columnClassName="notice_post_column"
        >
          {noticedata
             .filter(post => 
                keyword === "" || 
                post.content.toLowerCase().includes(keyword.toLowerCase()) || 
                post.title.toLowerCase().includes(keyword.toLowerCase())
              )
            .map(post => (
              <WriteCard
                key={post.id}
                title={post.title} 
                profile={post.profile}
                name={post.name}
                date={post.date}
                check={post.check}
                images={post.imageUrls}
                content={post.content}
                bookmarked={post.bookmarked}
                onClick={() => handleCardClick(post.id)}
              />
          ))}
        </Masonry>
      </section>
    </main>
  );
};

export default NoticeWrite;
