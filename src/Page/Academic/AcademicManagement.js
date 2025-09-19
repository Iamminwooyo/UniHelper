import "./Academic.css";
import AcademicCard from "../../Component/Card/AcademicCard";
import InquiryCard from "../../Component/Card/InquiryCard";
import AcademicModal from "../../Component/Modal/AcademicModal";
import TextModal from "../../Component/Modal/TextModal";
import {
  fetchInquiries,
  deleteInquiries,
  uploadFiles,
  fetchFileTree,
} from "../../API/AcademicAPI";

import { Collapse, message } from "antd";
import { useState, useEffect, useCallback, useRef } from "react";

const { Panel } = Collapse;

const AcademicManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [selectedInquiryTitle, setSelectedInquiryTitle] = useState(null);
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);

  // ✅ 문의 목록 상태
  const [inquiries, setInquiries] = useState([]);
  const [isFetchingInquiries, setIsFetchingInquiries] = useState(false);
  const isFetchingInquiriesRef = useRef(false);

  // ✅ 파일 목록 상태
  const [fileGroups, setFileGroups] = useState([]);
  const [isFetchingFiles, setIsFetchingFiles] = useState(false);
  const isFetchingFilesRef = useRef(false);

  // ✅ 업로드 상태
  const [isUploading, setIsUploading] = useState(false);
  const isUploadingRef = useRef(false);

  // ✅ 삭제 상태
  const [isDeleting, setIsDeleting] = useState(false);
  const isDeletingRef = useRef(false);

  // ✅ 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1); // 화면은 1부터
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const blockSize = 5;
  const currentBlock = Math.floor((currentPage - 1) / blockSize);
  const startPage = currentBlock * blockSize + 1;
  const endPage = Math.min(startPage + blockSize - 1, totalPages);

  // ================== API 호출 ==================

  // 문의 목록 불러오기
  const loadInquiries = useCallback(async () => {
    if (isFetchingInquiriesRef.current) return;
    isFetchingInquiriesRef.current = true;
    setIsFetchingInquiries(true);

    try {
      const data = await fetchInquiries(currentPage, pageSize);
      console.log("📥 문의 목록 API 응답:", data);

      setInquiries(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error("❌ 문의 목록 불러오기 실패:", err);
      message.error("문의 목록을 불러오지 못했습니다.");
    } finally {
      setIsFetchingInquiries(false);
      isFetchingInquiriesRef.current = false;
    }
  }, [currentPage, pageSize]);

  // 파일 목록 불러오기
  const loadFileTree = useCallback(async () => {
    if (isFetchingFilesRef.current) return;
    isFetchingFilesRef.current = true;
    setIsFetchingFiles(true);

    try {
      const data = await fetchFileTree();
      console.log("📥 파일 트리 API 응답:", data);

      const groups = (data || []).map((group) => ({
        title: group.collectionName,
        files: group.files || [],
      }));

      setFileGroups(groups);
    } catch (err) {
      console.error("❌ 파일 트리 불러오기 실패:", err);
      message.error("파일 목록을 불러오지 못했습니다.");
    } finally {
      setIsFetchingFiles(false);
      isFetchingFilesRef.current = false;
    }
  }, []);

  // ================== 삭제 ==================

  const handleInquiryDelete = (id, title) => {
    setSelectedInquiryId(id);
    setSelectedInquiryTitle(title);
    setIsTextModalOpen(true);
  };

  const confirmInquiryDelete = async () => {
    if (isDeletingRef.current) return; // 세마포어
    isDeletingRef.current = true;
    setIsDeleting(true);

    try {
      await deleteInquiries([selectedInquiryId]);
      message.success(`"${selectedInquiryTitle}" 문의가 삭제되었습니다.`);

      setIsTextModalOpen(false);
      setSelectedInquiryId(null);
      setSelectedInquiryTitle(null);

      loadInquiries(); // 목록 새로고침
    } catch (err) {
      console.error("❌ 문의 삭제 실패:", err);
      message.error("문의 삭제에 실패했습니다.");
    } finally {
      isDeletingRef.current = false;
      setIsDeleting(false);
    }
  };

  // ================== 업로드 ==================

  const handleModalSubmit = async (formData, resetForm) => {
    if (isUploadingRef.current) return;
    isUploadingRef.current = true;
    setIsUploading(true);

    try {
      const fd = new FormData();
      formData.files.forEach((file) => {
        fd.append("file", file);
      });

      const res = await uploadFiles(fd, formData.title);
      console.log("📤 파일 업로드 결과:", res);

      message.success("파일 업로드 성공!");
      resetForm();
      setIsModalOpen(false);

      // 업로드 성공 후 목록 갱신
      loadFileTree();
    } catch (err) {
      console.error("❌ 파일 업로드 실패:", err);
      message.error("파일 업로드에 실패했습니다.");
    } finally {
      isUploadingRef.current = false;
      setIsUploading(false);
    }
  };

  // ================== 초기 진입 ==================
  useEffect(() => {
    loadInquiries();
    loadFileTree();
  }, [loadInquiries, loadFileTree]);

  // ================== 렌더링 ==================
  return (
    <main className="academic_layout">
      <section className="academic_header">
        <h2 className="academic_header_title">학사정보 관리</h2>
      </section>

      <section className="academic_management_body">
        {/* 파일 관리 */}
        <div className="academic_management_file">
          <div className="academic_file_header">
            <h2>파일 목록</h2>
            <div
              className="academic_management_plus"
              onClick={() => setIsModalOpen(true)}
              style={{ cursor: "pointer" }}
            >
              +
            </div>
          </div>

          {isFetchingFiles ? (
            <div className="academic_file_empty">불러오는 중...</div>
          ) : fileGroups.length === 0 ? (
            <p className="academic_file_empty">등록된 파일이 없습니다.</p>
          ) : (
            <>
              <Collapse accordion>
                {fileGroups.map((group, idx) => (
                  <Panel header={group.title} key={idx}>
                    <div className="academic_file_list">
                      {group.files.map((file, fIdx) => (
                        <AcademicCard
                          key={file.id}
                          index={fIdx}
                          name={file.filename}
                          date={new Date(file.createdAt).toISOString().split("T")[0]}
                          fileId={file.id}
                        />
                      ))}
                    </div>
                  </Panel>
                ))}
              </Collapse>

              <p className="academic_management_warning">
                ※ 한번 업로드한 파일은 삭제가 불가능하여 재업로드 경우, 새로운 폴더에 업로드
                하셔야하며, 챗봇은 최신 폴더안의 파일들로만 운영됩니다.
              </p>
            </>
          )}
        </div>

        {/* 문의 관리 */}
        <div className="academic_management_inquiry">
          <div className="academic_inquiry_header">
            <h2>문의 목록</h2>
          </div>
          <div className="academic_inquiry_list">
            {isFetchingInquiries ? (
              <div className="academic_inquiry_empty">불러오는 중...</div>
            ) : inquiries.length === 0 ? (
              <p className="academic_inquiry_empty">등록된 문의가 없습니다.</p>
            ) : (
              <>
                {inquiries.map((inq) => (
                  <InquiryCard
                    key={inq.pid}
                    title={inq.title}
                    name={inq.authorName}
                    department={inq.authorDepartment}
                    date={new Date(inq.createdAt).toISOString().split("T")[0]}
                    content={inq.content}
                    onDelete={() => handleInquiryDelete(inq.pid, inq.title)}
                  />
                ))}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div
                    className="academic_inquiry_page_wrap"
                    style={{ textAlign: "center", marginTop: "30px" }}
                  >
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="academic_inquiry_page_button"
                    >
                      &lt;
                    </button>

                    {Array.from(
                      { length: endPage - startPage + 1 },
                      (_, i) => startPage + i
                    ).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`academic_inquiry_page_button ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="academic_inquiry_page_button"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* 파일 추가 모달 */}
      <AcademicModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isUploading={isUploading}
      />

      {/* 삭제 확인 모달 */}
      <TextModal
        open={isTextModalOpen}
        onCancel={() => setIsTextModalOpen(false)}
        mode="inquirydelete"
        title={selectedInquiryTitle}
        onConfirm={confirmInquiryDelete}
      />
    </main>
  );
};

export default AcademicManagement;
