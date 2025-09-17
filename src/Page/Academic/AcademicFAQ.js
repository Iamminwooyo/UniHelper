import { useState } from "react";
import "./Academic.css";
import FAQCard from "../../Component/Card/FAQCard";
import { faqs } from "../../Data/FAQdata";
import FaqModal from "../../Component/Modal/FaqModal";

const AcademicFAQ = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  // ✅ 모달에서 입력값을 받는 경우 (onSubmit)
  const handleSubmit = (data) => {
    console.log("문의 내용:", data);
    setIsModalOpen(false); // 닫기
  };

  return (
    <main className="academic_layout">
      <section className="academic_header">
        <h2 className="academic_header_title">FAQ</h2>
      </section>

      <section className="academic_faq_body">
        {faqs.map((faq, index) => (
          <FAQCard
            key={index}
            question={faq.question}
            answer={faq.answer}
          />
        ))}

        <div className="academic_faq_feedback">
          <span className="academic_faq_title">아직 궁금증이 해결되지 않았나요?</span>
          <p className="academic_faq_text">
            챗봇과 관련되어 답변 개선 사항이나 불편한 사항은 문의해주시길 바랍니다.
          </p>
          <div className="academic_faq_button" onClick={handleOpen}>
            문의하기
          </div>
        </div>
      </section>

      {/* ✅ 문의 모달 */}
      <FaqModal
        open={isModalOpen}
        onCancel={handleClose}
        onSubmit={handleSubmit}
      />
    </main>
  );
};

export default AcademicFAQ;
