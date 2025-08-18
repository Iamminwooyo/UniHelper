import "./Tip.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef, useCallback  } from "react";
import TextModal from "../../Component/Modal/TextModal";
import TipModal from "../../Component/Modal/TipModal";
import CommentCard from "../../Component/Card/CommentCard";
import { useRecoilValue } from "recoil";
import { userBriefState } from "../../Recoil/Atom";
import { fetchTipDetail, deleteTip, bookmarkTip, reactToTip, fetchTipImagePreview, fetchTipComments, addTipComment, updateTipComment, deleteTipComment} from "../../API/TipAPI";
import { Image, Tag, Input, Dropdown, Menu, message } from "antd";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { AiOutlineLike, AiOutlineDislike, AiFillLike, AiFillDislike } from "react-icons/ai";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";

// 태그 색상
const tagColorsPool = [
  "magenta","red","volcano","orange","gold",
  "lime","green","cyan","blue","geekblue","purple",
];

// 랜덤 색상 함수
const getRandomColor = () => tagColorsPool[Math.floor(Math.random() * tagColorsPool.length)];

const TipDetail = () => {
  const { id } = useParams();
  const { TextArea } = Input;

  // 상태
  const [tip, setTip] = useState(null);
  const [comment, setComment] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [commentData, setCommentData] = useState([]);
  const [imgUrls, setImgUrls] = useState([]);

  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalPages, setCommentTotalPages] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTipData, setEditTipData] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);

  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [bookmarkModalMode, setBookmarkModalMode] = useState("tipsubscribe");

  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);

  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [isDeletingTip, setIsDeletingTip] = useState(false);
  const [isFetchingComment, setIsFetchingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const user = useRecoilValue(userBriefState);

  const boundUrlsRef = useRef([]);

  const navigate = useNavigate();

  const cleanupBoundUrls = useCallback(() => {
    try {
      boundUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
    } finally {
      boundUrlsRef.current = [];
    }
  }, []);

  // Tip 상세 조회 함수
  const loadTipDetail = async () => {
    if (isFetchingDetail) return;
    setIsFetchingDetail(true);

    try {
      const data = await fetchTipDetail(id);

      // 이미지 blob 처리
      const blobs = await Promise.all(
        (data.images ?? []).map(async (img) => {
          try {
            const blob = await fetchTipImagePreview(img.url);
            const objUrl = URL.createObjectURL(blob);
            boundUrlsRef.current.push(objUrl); 
            return { id: img.id, previewUrl: objUrl };
          } catch {
            return { id: img.id, previewUrl: null };
          }
        })
      );

      const enrichedImages = data.images?.map((img) => {
          const found = blobs.find((b) => b.id === img.id);
          return { ...img, previewUrl: found?.previewUrl || img.url };
        }) ?? [];

      // 인덱스 보정
      let newIndex = currentIndex;
      if (newIndex >= enrichedImages.length) {
        newIndex = Math.max(0, enrichedImages.length - 1);
      }
      setCurrentIndex(newIndex);

      setTip({ ...data, images: enrichedImages });
    } catch (error) {
      console.error("Tip 상세 불러오기 실패:", error);
      message.error("Tip 불러오기 실패");
      setTip(null);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  //  Tip 댓글 조회 함수
  const loadComments = async () => {
    if (isFetchingComment) return;
    setIsFetchingComment(true);
    try {
      const data = await fetchTipComments(id, commentPage + 1, 5);

       console.log("댓글 API 응답 data:", data);
      setCommentData(data.content);
      setCommentTotalPages(data.totalPages);
    } catch (error) {
      message.error("댓글 불러오기 실패");
    } finally {
      setIsFetchingComment(false);
    }
  };

  //  Tip 댓글 생성 / 수정 함수
  const handleCommentSubmitOrEdit = async () => {
    if (!comment.trim()) return;
    if (isFetchingComment) return;
    setIsFetchingComment(true);

    try {
      if (isEditingComment) {
        await updateTipComment(editingCommentId, comment);
        message.success("댓글이 수정되었습니다.");
      } else {
        await addTipComment(id, comment);
        message.success("댓글이 등록되었습니다.");
      }
      await loadComments();
      setComment("");
      setIsEditingComment(false);
      setEditingCommentId(null);
    } catch (err) {
      message.error("댓글 저장 실패");
    } finally {
      setIsFetchingComment(false);
    }
  };

  // 댓글 수정 버튼 클릭
  const handleCommentEdit = (comment) => {
    setComment(comment.content);
    setIsEditingComment(true);
    setEditingCommentId(comment.id);
  };

  // 댓글 삭제 함수
  const handleDeleteComment = async (commentId) => {
    if (isDeletingComment) return;
    setIsDeletingComment(true);

    try {
      await deleteTipComment(commentId);
      setCommentData((prev) => prev.filter((c) => c.id !== commentId));
      message.success("댓글이 삭제되었습니다.");
    } catch (err) {
      message.error("댓글 삭제 실패");
    } finally {
      setIsDeletingComment(false);
    }
  };

  // Tip 삭제 함수
  const handleDeleteConfirm = async () => {
    if (isDeletingTip) return;
    setIsDeletingTip(true);

    try {
      await deleteTip(id);
      message.success("Tip 삭제 완료");
      navigate("/tip");
    } catch (err) {
      message.error("Tip 삭제 실패");
    } finally {
      setIsDeletingTip(false);
    }
  };

  // 저장 클릭 함수
  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    setBookmarkModalMode(tip.bookmarked ? "tipunsubscribe" : "tipsubscribe");
    setIsBookmarkModalOpen(true);
  };

  // Tip 저장 함수
  const handleBookmarkConfirm = async () => {
    if (isBookmarking) return;
    setIsBookmarking(true);

    try {
      await bookmarkTip(id);
      setTip((prev) => ({ ...prev, bookmarked: !prev.bookmarked }));
      message.success(
        tip.bookmarked ? "저장 취소 완료" : "저장 완료"
      );
      await loadTipDetail();
      setIsBookmarkModalOpen(false);
    } catch (err) {
      message.error("북마크 실패");
    } finally {
      setIsBookmarking(false);
    }
  };

  // Tip 반응 함수
  const handleReaction = async (type) => {
    if (isReacting) return;
    setIsReacting(true);

    try {
      await reactToTip(id, type);
      await loadTipDetail();
      message.success(type === "LIKE" ? "좋아요" : "싫어요");
    } catch (err) {
      message.error("반응 실패");
    } finally {
      setIsReacting(false);
    }
  };

  // 렌더링 함수
  useEffect(() => {
    loadTipDetail();
    loadComments();
    return () => cleanupBoundUrls();
  }, [id, commentPage]);

  // 태그 색상 매핑 함수
  const tagColorMap = useMemo(() => {
    const map = {};
    (tip?.tags || []).forEach((tag) => {
      if (!map[tag]) map[tag] = getRandomColor();
    });
    return map;
  }, [tip?.tags?.join(",")]);

  const images = tip?.imageUrls || [];

  // 이전 이미지 이동 함수
  const prevImage = () => {
    setCurrentIndex((prev) => {
      const max = (tip?.images?.length ?? 1) - 1;
      return prev === 0 ? max : prev - 1;
    });
  };

  // 다음 이미지 이동 함수
  const nextImage = () => {
    setCurrentIndex((prev) => {
      const max = (tip?.images?.length ?? 1) - 1;
      return prev === max ? 0 : prev + 1;
    });
  };

  // 드롭다운 메뉴 열기 함수
  const handleEditOpen = () => {
    if (!tip) return;
    setEditTipData(tip);
    setIsEditModalOpen(true);
  };

  // 드롭다운 메뉴 삭제 열기 함수
  const handleDeleteOpen = () => {
    setIsDeleteModalOpen(true);
  };

  // 드롭다운 메뉴 클릭 함수
  const handleMenuClick = ({ key }) => {
    if (key === "edit") handleEditOpen();
    if (key === "delete") handleDeleteOpen();
  };

  // 드롭다운 메뉴
  const menu = (
    <Menu onClick={handleMenuClick} className="custom-dropdown-menu">
      <Menu.Item key="edit" className="custom-dropdown-item">
        수정
      </Menu.Item>
      <Menu.Item key="delete" className="custom-dropdown-item" danger>
        삭제
      </Menu.Item>
    </Menu>
  );

  // 날짜 변환 함수
  const formatDate = (dateString) => dateString?.slice(0, 10) || "";

  // 랜더링 함수
  useEffect(() => {
    loadTipDetail();
    loadComments();
  }, [id, commentPage]);

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
            {isFetchingDetail ? (
              <div className="tip_empty" style={{ textAlign: "center", padding: "50px 0" }}>
                불러오는 중...
              </div>
            ) : !tip ? (
              <div className="tip_empty"> 존재하지 않는 Tip입니다. </div>
            ) : (
              <>
                <div className="tip_info">
                  <div className="tip_info_header">
                    <p className="tip_title">{tip.title}</p>
                    {(tip.authorId === user.userId) && (
                      <Dropdown overlay={menu} trigger={["click"]}>
                        <div onClick={(e) => e.stopPropagation()} className="tip_info_icon">
                          <HiDotsVertical />
                        </div>
                      </Dropdown>
                    )}
                    {tip.authorId !== user.userId && user.roleType === "MANAGER" && (
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
                      {(tip.tags || []).map((tag) => (
                        <Tag key={tag} color={tagColorMap[tag]} className="tip_tag_item">{tag}</Tag>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="tip_detail">
                  {tip?.images?.length > 0 && (
                    <div className="tip_img_group">
                      {tip.images.length > 1 &&
                        <div className="arrow_left" onClick={prevImage}>
                          <FaArrowLeft />
                        </div>
                      }
                      <div className="img_container">
                        <Image
                          src={tip.images[currentIndex]?.previewUrl}
                          alt={`Tip 이미지 ${currentIndex + 1}`}
                          className="tip_img"
                          preview={{ mask: "이미지 보기" }}
                        />
                      </div>
                      {tip.images.length > 1 &&
                        <div className="arrow_right" onClick={nextImage}>
                          <FaArrowRight />
                        </div>
                      }
                    </div>
                  )}
                  {tip.text && <div className="tip_content">{tip.text}</div>}
                </div>

                <div className="tip_reaction">
                  <div className="tip_reaction_item" onClick={() => handleReaction("LIKE")}>
                    {tip.myReaction === "LIKE"
                      ? <AiFillLike color="#78D900" style={{ cursor: "pointer" }} />
                      : <AiOutlineLike style={{ cursor: "pointer" }} />}
                    <span>{tip.likeCount}</span>
                  </div>
                  <div className="tip_reaction_item" onClick={() => handleReaction("DISLIKE")}>
                    {tip.myReaction === "DISLIKE"
                      ? <AiFillDislike color="#FF0000" style={{ cursor: "pointer" }} />
                      : <AiOutlineDislike style={{ cursor: "pointer" }} />}
                    <span>{tip.dislikeCount}</span>
                  </div>
                  <div className="tip_reaction_item" style={{ cursor: "pointer" }} onClick={handleBookmarkClick}>
                    {tip.bookmarked ? <IoBookmark color="#78D900" /> : <IoBookmarkOutline />}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="tip_comment_container">
            <div className="tip_comment_input_group">
              <TextArea
                className="tip_comment_input"
                rows={3}
                placeholder="댓글"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={100}
              />
              <div style={{ width:"100%", display:"flex", justifyContent:isEditingComment ? "space-between" : "flex-end" }}>
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
                <div className="tip_comment_button" onClick={handleCommentSubmitOrEdit}>
                  {isEditingComment ? "수정" : "등록"}
                </div>
              </div>
            </div>
            <hr className="tip_comment_divider" />
            <div className="tip_commnet">
              {isFetchingComment ? (
                <div className="tip_empty_comment" style={{ textAlign:"center", padding:"20px 0" }}>불러오는 중...</div>
              ) : commentData.length === 0 ? (
                <div className="tip_empty_comment">댓글이 없습니다.</div>
              ) : (
                commentData.map((c) => (
                  <CommentCard
                    key={c.id}
                    id={c.id}
                    department={c.authorDept}
                    content={c.content}
                    date={c.updatedAt ? `${formatDate(c.updatedAt)} (수정됨)` : formatDate(c.createdAt)}
                    role={user.roleType}
                    isOwner={c.authorId === user.userId}
                    onEdit={() => handleCommentEdit(c)}
                    onDelete={setDeleteCommentId}
                  />
                ))
              )}
            </div>

            {commentTotalPages > 1 && (
              <div className="tip_page_wrap" style={{ textAlign: "center", marginTop: "15px" }}>
                <button
                  onClick={() => setCommentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={commentPage === 0}
                  className="tip_page_button"
                >
                  &lt;
                </button>
                {Array.from({ length: commentTotalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCommentPage(pageNum - 1)}
                    className={`tip_page_button ${commentPage === pageNum - 1 ? "active" : ""}`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setCommentPage((prev) => Math.min(prev + 1, commentTotalPages - 1))}
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

      {/* 모달들 */}
      {isEditModalOpen && (
        <TipModal
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          mode="edit"
          initialData={editTipData}
          onSuccess={() => {
            setIsEditModalOpen(false);
            loadTipDetail();
          }}
        />
      )}
      {isDeleteModalOpen && (
        <TextModal
          open={isDeleteModalOpen}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          mode="tipdelete"
          title={tip?.title}
        />
      )}
      {deleteCommentId && (
        <TextModal
          open={!!deleteCommentId}
          onCancel={() => setDeleteCommentId(null)}
          onConfirm={() => {
            handleDeleteComment(deleteCommentId);
            setDeleteCommentId(null);
          }}
          mode="commentdelete"
        />
      )}
      {isBookmarkModalOpen && (
        <TextModal
          open={isBookmarkModalOpen}
          onCancel={() => setIsBookmarkModalOpen(false)}
          onConfirm={handleBookmarkConfirm}
          mode={bookmarkModalMode}
          title={tip?.title}
        />
      )}
    </main>
  );
};

export default TipDetail;