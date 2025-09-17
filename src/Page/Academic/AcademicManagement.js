// AcademicManagement.jsx
import "./Academic.css";
import AcademicCard from "../../Component/Card/AcademicCard";
import InquiryCard from "../../Component/Card/InquiryCard";
import AcademicModal from "../../Component/Modal/AcademicModal";
import TextModal from "../../Component/Modal/TextModal";
import { fileGroups, inquiries } from "../../Data/Academicdata";
import { Collapse, message } from "antd";
import { useState } from "react";

const { Panel } = Collapse;

const AcademicManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [selectedInquiryTitle, setSelectedInquiryTitle] = useState(null);

  // 문의 삭제 버튼 누를 때 → 모달 열기
  const handleInquiryDelete = (title) => {
    setSelectedInquiryTitle(title);
    setIsTextModalOpen(true);
  };

  // 문의 실제 삭제 (더미)
  const confirmInquiryDelete = () => {
    console.log(`"${selectedInquiryTitle}" 문의 삭제 확정!`);
    message.success(`"${selectedInquiryTitle}" 문의가 삭제되었습니다.`);
    setIsTextModalOpen(false);
    setSelectedInquiryTitle(null);
  };

  // 파일 추가 모달 제출
  const handleModalSubmit = (formData) => {
    console.log("모달 제출 데이터:", formData);
    setIsModalOpen(false);
    // TODO: formData API 전송
  };

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
          <Collapse accordion>
            {fileGroups.map((group, idx) => (
              <Panel header={group.title} key={idx}>
                <div className="academic_file_list">
                  {group.files.map((file, fIdx) => (
                    <AcademicCard
                      key={fIdx}
                      index={fIdx}
                      name={file.name}
                      date={file.date}
                      downloadUrl={file.url}
                    />
                  ))}
                </div>
              </Panel>
            ))}
          </Collapse>
          <p className="academic_management_warning">※ 한번 업로드한 파일은 삭제가 불가능하여 재업로드 경우, 새로운 폴더에 업로드 하셔야하며, 챗봇은 최신 폴더안의 파일들로만 운영됩니다.</p>
        </div>

        {/* 문의 관리 */}
        <div className="academic_management_inquiry">
          <div className="academic_inquiry_header">
            <h2>문의 목록</h2>
          </div>
          <div className="academic_inquiry_list">
            {inquiries.map((inq) => (
              <InquiryCard
                key={inq.id}
                title={inq.title}
                name={inq.name}
                department={inq.department}
                date={inq.date}
                content={inq.content}
                onDelete={() => handleInquiryDelete(inq.title)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 파일 추가 모달 */}
      <AcademicModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
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
