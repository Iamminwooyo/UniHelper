import "./Notice.css";
import Masonry from "react-masonry-css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../Component/Search/Search";
import WriteCard from "../../Component/Card/WriteCard";
import NoticeModal from "../../Component/Modal/NoticeModal";
import TextModal from "../../Component/Modal/TextModal";
import { noticedata as initialData } from "../../Data/Noticedata";

const NoticeWrite = () => {
  const [keyword, setKeyword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editData, setEditData] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [noticedata, setNoticedata] = useState(initialData);

  const navigate = useNavigate();

  const handleCardClick = (id) => {
    navigate(`/notice/${id}`);
  };

  const handleEdit = (id) => {
    const notice = noticedata.find((n) => n.id === id);
    if (notice) {
      setEditData(notice);
      setModalMode("edit");
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id) => {
    const notice = noticedata.find((n) => n.id === id);
    if (notice) {
      setDeleteTarget(notice);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      setNoticedata((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      // 실제 서버 API 호출 추가 가능
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setEditData(null);
    setModalMode("create");
  };

  const handleModalSubmit = async (data) => {
    if (modalMode === "edit") {
      console.log("수정 데이터:", data);
      // 수정 API 및 상태 업데이트 구현 예정
    } else {
      console.log("작성 데이터:", data);
      // 작성 API 및 상태 업데이트 구현 예정
    }
    setIsModalOpen(false);
    setEditData(null);
    setModalMode("create");
  };

  return (
    <main className="notice_layout">
      <section className="notice_header">
        <h2 className="notice_header_title">작성 목록</h2>
        <SearchBar onSearchChange={setKeyword} />
      </section>

      <section className="notice_body">
        <Masonry
          breakpointCols={{ default: 3, 768: 2 }}
          className="notice_post"
          columnClassName="notice_post_column"
        >
          {noticedata
            .filter(
              (post) =>
                keyword === "" ||
                post.content.toLowerCase().includes(keyword.toLowerCase()) ||
                post.title.toLowerCase().includes(keyword.toLowerCase())
            )
            .map((post) => (
              <WriteCard
                key={post.id}
                id={post.id}
                title={post.title}
                profile={post.profile}
                name={post.name}
                date={post.date}
                check={post.check}
                images={post.imageUrls}
                content={post.content}
                bookmarked={post.bookmarked}
                onClick={() => handleCardClick(post.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
        </Masonry>
      </section>

      {isModalOpen && (
        <NoticeModal
          open={isModalOpen}
          onCancel={handleModalCancel}
          onSubmit={handleModalSubmit}
          mode={modalMode}
          initialData={editData}
        />
      )}

      {deleteModalOpen && (
        <TextModal
          open={deleteModalOpen}
          onCancel={handleDeleteCancel}
          mode="noticedelete"
          onOk={handleDeleteConfirm}
        />
      )}
    </main>
  );
};

export default NoticeWrite;
