import "./Notice.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef  } from "react";
import { useRecoilValue } from "recoil"
import NoticeModal from "../../Component/Modal/NoticeModal";
import TextModal from "../../Component/Modal/TextModal";
import { userBriefState } from "../../Recoil/Atom";
import { fetchNoticeDetail,fetchNoticeImagePreview, subscribeAuthor, unsubscribeAuthor, downloadNoticeFile, deleteNotice } from "../../API/NoticeAPI";
import { Image, Dropdown, Menu, message } from "antd";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";

const NoticeDetail = () => {
  const { id } = useParams();

  const [notice, setNotice] = useState(null);

  const isFetchingRef = useRef(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const boundUrlsRef = useRef([]);

  const [imgUrls, setImgUrls] = useState([]);
  const [imagesReady, setImagesReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(notice?.bookmarked ? "noticeunsubscribe" : "noticesubscribe");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNoticeData, setEditNoticeData] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const userBrief = useRecoilValue(userBriefState);
  const currentUserRole = userBrief?.roleType

  const imageCacheRef = useRef(new Map());

  const navigate = useNavigate();

   const cleanupBoundUrls = useCallback(() => {
    try {
      boundUrlsRef.current.forEach((u) => {
        try { URL.revokeObjectURL(u); } catch {}
      });
    } finally {
      boundUrlsRef.current = [];
    }
  }, []);

  

  // 공지사항 상제 조회 함수
  const loadNotice = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsFetchingDetail(true);

    try {
      const data = await fetchNoticeDetail(id);

      const blobs = await Promise.all(
        (data.images ?? []).map(async (f) => {
          try {
            const blob = await fetchNoticeImagePreview(f.url);
            const objUrl = URL.createObjectURL(blob);
            return { id: f.id, previewUrl: objUrl };
          } catch {
            return { id: f.id, previewUrl: null };
          }
        })
      );

      const enrichedImages = data.images.map(img => {
        const found = blobs.find(b => b.id === img.id);
        return { ...img, previewUrl: found?.previewUrl || img.url };
      });

      // 🔑 이미지 개수 줄었을 때 currentIndex 보정
      let newIndex = currentIndex;
      if (newIndex >= enrichedImages.length) {
        newIndex = Math.max(0, enrichedImages.length - 1);
      }
      setCurrentIndex(newIndex);

      setNotice({ ...data, images: enrichedImages });
      setModalMode(data?.bookmarked ? "noticeunsubscribe" : "noticesubscribe");
    } catch (e) {
      console.error("공지 상세 불러오기 실패:", e);
      setNotice(null);
      message.error("공지사항을 불러오는 데 실패했습니다.");
    } finally {
      setIsFetchingDetail(false);
      isFetchingRef.current = false;
    }
  }, [id, currentIndex]);

  // 공지사항 삭제 함수
  const handleDeleteConfirm = async () => {
    if (!notice || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteNotice(notice.id);
      message.success("공지사항이 삭제되었습니다.");
      setIsDeleteModalOpen(false);
      navigate(-1);
    } catch (e) {
      console.error("삭제 실패:", e);
      message.error("공지사항 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 구독 함수
  const handleConfirmBookmark = async () => {
    if (!notice || bookmarkLoading) return;
    setBookmarkLoading(true);

    try {
      if (!notice.bookmarked) {
        await subscribeAuthor(notice.authorId);
        message.success(`${notice.department}를 구독했습니다.`);
      } else {
        await unsubscribeAuthor(notice.authorId);
        message.success(`${notice.department} 구독을 취소했습니다.`);
      }
      await loadNotice();
      setIsModalOpen(false);
    } catch (error) {
      console.error("구독 처리 실패:", error);
      message.error("구독 처리 중 오류가 발생했습니다.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  // 파일 다운로드 함수
  const handleDownload = async (fileUrl) => {
    try {
      const blob = await downloadNoticeFile(fileUrl);
      if (!blob || blob.size === 0) {
        message.error("서버에서 파일을 찾을 수 없습니다.");
        return;
      }
      const fileName = decodeURIComponent(fileUrl.split("/").pop() || "download");
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      message.error("파일 다운로드에 실패했습니다.");
    }
  };

  // 렌더링 함수
  useEffect(() => {
    loadNotice();
    return () => {
      cleanupBoundUrls();
      for (const url of imageCacheRef.current.values()) {
        try { URL.revokeObjectURL(url); } catch {}
      }
      imageCacheRef.current.clear();
    };
  }, [id]);

  // 이전 이미지 이동 함수
  const prevImage = () => {
    setCurrentIndex((prev) => {
      const max = notice.images.length - 1;
      return prev === 0 ? max : prev - 1;
    });
  };

  // 다음 이미지 이동 함수
  const nextImage = () => {
    setCurrentIndex((prev) => {
      const max = notice.images.length - 1;
      return prev === max ? 0 : prev + 1; 
    });
  };

  // 구독 모달 열기 함수
  const openModal = (mode) => { 
    setModalMode(mode); 
    setIsModalOpen(true); 
  };

  // 공지사항 수정 모달 열기 함수
  const handleEditOpen = () => {
    if (!notice) return;
    setEditNoticeData(notice);
    setIsEditModalOpen(true);
  };

  // 공지사항 수정 모달 닫기 함수
  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditNoticeData(null);
  };

  // 공지사항 삭제 모달 열기 함수
  const handleDeleteOpen = () => {
    setIsDeleteModalOpen(true);
  };

  // 공지사항 삭제 모달 닫기 함수
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  // 시간 변환 함수
  const formatDate = (s) => (s ? s.slice(0, 10) : "");

  // 드롭다운 메뉴 함수
  const handleMenuClick = ({ key}) => {
    if (key === "edit") handleEditOpen();
    if (key === "delete") handleDeleteOpen();
  };

  // 드롭다운 메뉴
  const menu = (
    <Menu onClick={handleMenuClick} className="custom-dropdown-menu">
      <Menu.Item key="edit" className="custom-dropdown-item">수정</Menu.Item>
      <Menu.Item key="delete" className="custom-dropdown-item" danger>삭제</Menu.Item>
    </Menu>
  );

  return (
    <main className="notice_layout">
      <section className="notice_header">
        <h2 className="notice_header_title">공지사항</h2>
      </section>

      <section className="notice_detail_body">
        <div className="notice_back_icon">
          <FaArrowLeft onClick={() => navigate(-1)} style={{ cursor: "pointer" }} />
        </div>

        {isFetchingDetail ? (
          <div className="notice_empty">불러오는 중...</div>
        ) : !notice ? (
          <div className="notice_empty">존재하지 않는 공지입니다.</div>
        ) : (
          <>
            <div className="notice_info">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p className="notice_title">{notice.title}</p>
                {(notice?.authorId === userBrief?.userId || currentUserRole === "MANAGER") && (
                  <Dropdown overlay={menu} trigger={["click"]}>
                     <div className="notice_icon_dropdown"><HiDotsVertical className="notice_menu"/></div>
                  </Dropdown>
                )}
              </div>

              <hr className="notice_divider" />

              <div className="notice_info_block">
                <div className="notice_profile">
                  <img src="/image/profile.png" alt="profile" className="notice_profile_img" />
                  <div className="notice_text">
                    <p className="notice_name">{notice.department}</p>
                    <p className="notice_date">
                      {notice.updatedAt
                        ? `${formatDate(notice.updatedAt)} (수정됨)`
                        : formatDate(notice.createdAt)}
                    </p>
                  </div>
                </div>

                <div
                  className="notice_icon"
                  style={{ cursor: "pointer" }}
                  onClick={() => openModal(notice.bookmarked ? "noticeunsubscribe" : "noticesubscribe")}
                >
                  {notice.bookmarked ? <IoBookmark color="#78D900" /> : <IoBookmarkOutline />}
                </div>
              </div>
            </div>

            {notice.attachments?.length > 0 && (
              <div className="notice_file">
                <p className="notice_file_title">첨부파일</p>
                <ul className="notice_file_list">
                  {notice.attachments.map((att, idx) => {
                    const fileName = decodeURIComponent(att.url.split("/").pop() || `file-${idx + 1}`);
                    return (
                      <div key={att.id} className="notice_file_item_wrapper">
                        <div className="notice_file_item" onClick={() => handleDownload(att.url)}>
                          {fileName}
                        </div>
                      </div>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="notice_detail">
              {notice.images?.length > 0 && currentIndex < notice.images.length && (
                <div className="notice_detail_img_group">
                  {notice.images.length > 1 && (
                    <div className="arrow_left" onClick={prevImage}>
                      <FaArrowLeft />
                    </div>
                  )}

                  <div className="img_container">
                    <Image
                      src={notice.images[currentIndex]?.previewUrl || ""}
                      alt={`공지 이미지 ${currentIndex + 1}`}
                      className="notice_detail_img"
                      preview={{ mask: "이미지 보기" }}
                    />
                  </div>

                  {notice.images.length > 1 && (
                    <div className="arrow_right" onClick={nextImage}>
                      <FaArrowRight />
                    </div>
                  )}
                </div>
              )}

              {notice.text && <div className="notice_detail_content">{notice.text}</div>}
            </div>

            {isModalOpen && (
              <TextModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onConfirm={handleConfirmBookmark}
                mode={modalMode}
                name={notice.department}
              />
            )}

            {isEditModalOpen && editNoticeData && (
              <NoticeModal
                open={isEditModalOpen}
                onCancel={handleEditCancel}
                mode="edit"
                initialData={editNoticeData}
                onSuccess={loadNotice}
              />
            )}

            {isDeleteModalOpen && (
              <TextModal
                open={isDeleteModalOpen}
                onCancel={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                mode="noticedelete"
              />
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default NoticeDetail;