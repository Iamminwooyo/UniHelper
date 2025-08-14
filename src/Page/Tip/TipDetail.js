import "./Tip.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Tag, Input, Dropdown, Menu, message } from "antd";
import { useRecoilValue } from "recoil";
import { userBriefState } from "../../Recoil/Atom";
import TextModal from "../../Component/Modal/TextModal";
import TipModal from "../../Component/Modal/TipModal";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { AiOutlineLike, AiOutlineDislike, AiFillLike, AiFillDislike } from "react-icons/ai";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import CommentCard from "../../Component/Card/CommentCard";
import axios from "axios";

const tagColorsPool = [
  "magenta","red","volcano","orange","gold",
  "lime","green","cyan","blue","geekblue","purple",
];
const getRandomColor = () => tagColorsPool[Math.floor(Math.random() * tagColorsPool.length)];

const TipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userBrief = useRecoilValue(userBriefState);
  const { TextArea } = Input;

  // 상태
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentData, setCommentData] = useState([]);
  const [comment, setComment] = useState("");

  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalPages, setCommentTotalPages] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTipData, setEditTipData] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);

  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [bookmarkModalMode, setBookmarkModalMode] = useState("tipsubscribe");

  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);

  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [isDeletingTip, setIsDeletingTip] = useState(false);
  const [isFetchingComment, setIsFetchingComment] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  useEffect(() => {
    fetchTipDetail();
  }, [id]);

  useEffect(() => {
    fetchComments();
  }, [id, commentPage])

   // Tip 상세 조회 API
  const fetchTipDetail = async () => {
    if (isFetchingDetail) return;
    setIsFetchingDetail(true);

    try {
      const token = sessionStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`/community/${id}`, { headers });
      console.log("📌 Tip 상세 조회 응답:", response.data); 
      setTip(response.data);
    } catch (error) {
      console.error("Tip 상세 조회 실패:", error);
    } finally {
      setIsFetchingDetail(false);
      setLoading(false);
    }
  };

  // Tip 삭제 API
  const handleDeleteConfirm = async () => {
    if (isDeletingTip) return;
    setIsDeletingTip(true);

    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        message.error("로그인이 필요합니다.");
        closeDeleteModal();
        return;
      }

      await axios.delete(`/community/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success("Tip이 삭제되었습니다.");
      closeDeleteModal();
      navigate("/tip");

    } catch (error) {
      console.error("삭제 오류:", error);
      message.error("Tip 삭제에 실패했습니다.");
      closeDeleteModal();
    } finally {
      setIsDeletingTip(false);
    }
  };

  // 수정/삭제 모달 핸들러
  const handleMenuClick = info => {
    if (info.key === "edit") {
      setEditTipData(tip);
      setIsEditModalOpen(true);
    } else if (info.key === "delete") {
      setIsDeleteModalOpen(true);
    }
  };
  const closeEditModal = () => { setIsEditModalOpen(false); setEditTipData(null); };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);
  const openDeleteCommentModal = id => { setDeleteCommentId(id); setIsDeleteCommentModalOpen(true); };
  const closeDeleteCommentModal = () => { setDeleteCommentId(null); setIsDeleteCommentModalOpen(false); };
  const handleDeleteCommentConfirm = () => {
    if (!deleteCommentId) return;
    handleDeleteComment(deleteCommentId);
    closeDeleteCommentModal();
  };

  // 댓글 목록 조회 API
  const fetchComments = async () => {
    if (isFetchingComment) return;
    setIsFetchingComment(true);
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        message.error("로그인이 필요합니다.");
        return;
      }
      const response = await axios.get(`/community/${id}/comments`, {
        params: {
          page: commentPage, 
          size: 5              
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("📌 Tip 상세 댓글 응답:", response.data); 
      const { content, totalPages } = response.data;
      setCommentData(content);
      setCommentTotalPages(totalPages);

    } catch (error) {
      console.error("댓글 목록 조회 실패:", error);
      message.error("댓글 목록을 불러오지 못했습니다.");
    } finally {
      setIsFetchingComment(false);
    }
  };

  // 댓글 등록 / 수정 API
  const handleCommentSubmitOrEdit = async () => {
    if (!comment.trim()) return;

    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      message.error("로그인이 필요합니다.");
      return;
    }

    if (isEditingComment) {
      // 댓글 수정
      try {
        await axios.patch(
          `/community/comments/${editingCommentId}`,
          { content: comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("댓글이 수정되었습니다.");
        fetchComments();
        setIsEditingComment(false);
        setEditingCommentId(null);
        setComment("");
      } catch (err) {
        console.error(err);
        message.error("댓글 수정에 실패했습니다.");
      }
    } else {
      // 댓글 등록
      try {
        await axios.post(
          `/community/${id}/comments`,
          { content: comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("댓글이 등록되었습니다.");
        fetchComments();
        setComment("");
      } catch (err) {
        console.error(err);
        message.error("댓글 등록에 실패했습니다.");
      }
    }
  };

  // 댓글 수정 버튼 클릭
  const handleEditComment = (commentId, content) => {
    setIsEditingComment(true);
    setEditingCommentId(commentId);
    setComment(content);
  };

  const handleCommentEdit = (comment) => {
    setComment(comment.content);      
    setIsEditingComment(true);      
    setEditingCommentId(comment.id);  
  };

  // 댓글 삭제 API
  const handleDeleteComment = async (commentId) => {
    if (isDeletingComment) return;
    setIsDeletingComment(true);

    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        message.error("로그인이 필요합니다.");
        return;
      }

      await axios.delete(`/community/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCommentData(prev => prev.filter(c => c.id !== commentId));
      message.success("댓글이 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      message.error("댓글 삭제에 실패했습니다.");
    } finally {
      setIsDeletingComment(false);
    }
  };

  // 북마크
  const handleBookmarkClick = e => {
    e.stopPropagation();
    setBookmarkModalMode(tip.bookmarked ? "tipunsubscribe" : "tipsubscribe");
    setIsBookmarkModalOpen(true);
  };
  const closeBookmarkModal = () => setIsBookmarkModalOpen(false);

  // Tip 저장 / 취소 API
  const handleBookmarkConfirm = async () => {
    if (isBookmarking) return;
    setIsBookmarking(true);

    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) { message.error("로그인이 필요합니다."); return; }

      await axios.post(`/community/${id}/bookmark`, null, { headers: { Authorization: `Bearer ${token}` } });

      message.success(
        tip.bookmarked
          ? `"${tip.title}" Tip 저장을 취소했습니다.`
          : `"${tip.title}" Tip을 저장했습니다.`
      );

      setTip(prev => ({ ...prev, bookmarked: !prev.bookmarked }));

      await fetchTipDetail();
      setIsBookmarkModalOpen(false);
    } catch (error) {
      message.error("북마크 처리 중 오류가 발생했습니다.");
    } finally {
      setIsBookmarking(false);
    }
  };

  // 반응 API
  const handleReaction = async (type) => {
    if (isReacting) return;
    setIsReacting(true);

    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      message.error("로그인이 필요합니다.");
      setIsReacting(false);
      return;
    }

    try {
      await axios.post(`/community/${id}/reactions`,
        { type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchTipDetail();
      await fetchComments();
      message.success(type === "LIKE" ? "좋아요가 업데이트되었습니다." : "싫어요가 업데이트되었습니다.");
    } catch (error) {
      message.error("반응 처리 중 오류가 발생했습니다.");
    } finally {
      setIsReacting(false);
    }
  };

  const tagColorMap = useMemo(() => {
    const map = {};
    (tip?.tags || []).forEach(tag => {
      if (!map[tag]) map[tag] = getRandomColor();
    });
    return map;
  }, [tip?.tags?.join(",")]);

  const images = tip?.imageUrls || [];
  const prevImage = () => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));

  const menu = (
    <Menu onClick={handleMenuClick} className="custom-dropdown-menu">
      <Menu.Item key="edit" className="custom-dropdown-item">수정</Menu.Item>
      <Menu.Item key="delete" className="custom-dropdown-item delete">삭제</Menu.Item>
    </Menu>
  );

  const formatDate = dateString => dateString?.slice(0,10) || "";

  // 첫 마운트 시 실행
  useEffect(() => {
    fetchTipDetail();
    fetchComments();
  }, [id]);

  if (loading) return <main className="tip_layout">Loading...</main>;
  if (!tip) return <main className="tip_layout">Tip을 불러올 수 없습니다.</main>;

  return (
    <main className="tip_layout">
      <section className="tip_header">
        <h2 className="tip_header_title">Tip 게시판</h2>
      </section>
      <section className="tip_detail_body">
        <div className="tip_back_icon">
          <FaArrowLeft onClick={() => navigate(-1)} style={{ cursor: "pointer" }} />
        </div>
        <div style={{ display: "flex", width: "90%", gap: "20px" }}>
          <div className="tip_content_container">
            <div className="tip_info">
              <div className="tip_info_header">
                <p className="tip_title">{tip.title}</p>
                 {(tip.authorId === userBrief.userId) && (
                    <Dropdown overlay={menu} trigger={["click"]}>
                      <div
                        onClick={e => e.stopPropagation()}
                        className="tip_info_icon"
                        style={{ cursor: "pointer" }}
                      >
                        <HiDotsVertical />
                      </div>
                    </Dropdown>
                  )}

                  {/* 2. Owner 아니고 tip 타입이면서 Manager면 삭제 아이콘만 */}
                  {tip.authorId !== userBrief.userId && userBrief.roleType === "MANAGER" && (
                    <MdDeleteOutline
                      className="tip_info_icon"
                      style={{ cursor: "pointer" }}
                      onClick={() => setIsDeleteModalOpen(true)}
                    />
                  )}
              </div>
              <hr className="tip_divider" />
              <div className="tip_profile_block">
                <div className="tip_profile">
                  <img src="/image/profile.png" alt="profile" className="tip_profile_img" />
                  <div className="tip_text">
                    <p className="tip_name">{tip.authorName}</p>
                    <p className="tip_date">
                      {tip.updatedAt ? `${formatDate(tip.updatedAt)} (수정됨)` : formatDate(tip.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="tip_tag">
                  {(tip.tags || []).map(tag => (
                    <Tag key={tag} color={tagColorMap[tag]} className="tip_tag_item">{tag}</Tag>
                  ))}
                </div>
              </div>
            </div>

            <div className="tip_detail">
              {images.length > 0 && (
                <div className="tip_img_group">
                  {images.length > 1 && <FaArrowLeft onClick={prevImage} style={{ cursor: "pointer" }} />}
                  <img src={images[currentIndex]} alt={`공지 이미지 ${currentIndex + 1}`} className="tip_img" />
                  {images.length > 1 && <FaArrowRight onClick={nextImage} style={{ cursor: "pointer" }} />}
                </div>
              )}
              {tip.text && <div className="tip_content">{tip.text}</div>}
            </div>

            <div className="tip_reaction">
              <div className="tip_reaction_item" onClick={() => handleReaction("LIKE")}>
                {tip.myReaction === "LIKE" ? <AiFillLike color="#78D900" style={{cursor:"pointer"}}/> : <AiOutlineLike style={{cursor:"pointer"}}/>}
                <span>{tip.likeCount}</span>
              </div>
              <div className="tip_reaction_item" onClick={() => handleReaction("DISLIKE")}>
                {tip.myReaction === "DISLIKE" ? <AiFillDislike color="#FF0000" style={{cursor:"pointer"}}/> : <AiOutlineDislike style={{cursor:"pointer"}}/>}
                <span>{tip.dislikeCount}</span>
              </div>
              <div className="tip_reaction_item" style={{cursor:"pointer"}} onClick={handleBookmarkClick}>
                {tip.bookmarked ? <IoBookmark color="#78D900"/> : <IoBookmarkOutline/>}
              </div>
            </div>
          </div>

          <div className="tip_comment_container">
            <div className="tip_comment_input_group">
              <TextArea
                className="tip_comment_input"
                rows={3}
                placeholder="댓글"
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={100}
              />
              <div style={{ width:"100%", display: "flex", justifyContent: isEditingComment ? 'space-between' : 'flex-end'}}>
                  {isEditingComment && (
                    <div
                      className="tip_comment_button cancel"
                      onClick={() => {
                        setIsEditingComment(false);
                        setEditingCommentId(null);
                        setComment("");
                      }}
                    >
                      취소
                    </div>
                  )}
                  <div className="tip_comment_button" onClick={handleCommentSubmitOrEdit} >
                    {isEditingComment ? "수정" : "등록"}
                  </div>
                </div>
            </div>
            <hr className="tip_comment_divider" />
           <div className="tip_commnet">
            {commentData.length === 0 ? (
              <div className="tip_empty_comment">댓글이 없습니다.</div>
            ) : (
              commentData.map(comment => (
                <CommentCard
                  key={comment.id}
                  id={comment.id}
                  department={comment.authorDept}
                  content={comment.content}
                  date={formatDate(comment.createdAt)}
                  isOwner={comment.authorId === userBrief.userId}
                  onEdit={() => handleCommentEdit(comment)}
                  onDelete={openDeleteCommentModal}
                />
              ))
            )}
          </div>

          {/* 댓글 페이지네이션 */}
          {commentTotalPages > 1 && (
            <div className="tip_page_wrap" style={{ textAlign: "center", marginTop: "15px" }}>
              <button
                onClick={() => setCommentPage(prev => Math.max(prev - 1, 0))}
                disabled={commentPage === 0}
                className="tip_page_button"
              >
                &lt;
              </button>

              {Array.from({ length: commentTotalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCommentPage(pageNum - 1)}
                  className={`tip_page_button ${commentPage === pageNum - 1 ? "active" : ""}`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCommentPage(prev => Math.min(prev + 1, commentTotalPages - 1))}
                disabled={commentPage === commentTotalPages - 1}
                className="tip_page_button"
              >
                &gt;
              </button>
            </div>
          )}
          </div>
        </div>
      </section>

      {isEditModalOpen && <TipModal open={isEditModalOpen} onCancel={closeEditModal} mode="edit" initialData={editTipData}  onSuccess={() => {closeEditModal(); fetchTipDetail();}}/>}
      {isDeleteModalOpen && <TextModal open={isDeleteModalOpen} onCancel={closeDeleteModal} onConfirm={handleDeleteConfirm} mode="tipdelete" title={tip.title} />}
      {isDeleteCommentModalOpen && <TextModal open={isDeleteCommentModalOpen} onCancel={closeDeleteCommentModal} onConfirm={handleDeleteCommentConfirm} mode="commentdelete" />}
      {isBookmarkModalOpen && <TextModal open={isBookmarkModalOpen} onCancel={closeBookmarkModal} onConfirm={handleBookmarkConfirm} mode={bookmarkModalMode} title={tip.title} />}
    </main>
  );
};

export default TipDetail;
