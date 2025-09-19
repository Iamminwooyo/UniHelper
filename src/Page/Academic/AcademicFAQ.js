import { useState } from "react";
import "./Academic.css";
import FAQCard from "../../Component/Card/FAQCard";
import { faqs } from "../../Data/FAQdata";
import FaqModal from "../../Component/Modal/FaqModal";
import { createInquiry } from "../../API/AcademicAPI"; 
import { message } from "antd";

const AcademicFAQ = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  // 문의 등록
  const handleSubmit = async (data) => {
    if (isInquirySubmitting) return; 
    setIsInquirySubmitting(true);

    try {
      await createInquiry(data);
      message.success("문의가 정상적으로 등록되었습니다.");
      setIsModalOpen(false); 
    } catch (err) {
      message.error("문의 등록에 실패했습니다.");
    } finally {
      setIsInquirySubmitting(false);
    }
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

      <FaqModal
        open={isModalOpen}
        onCancel={handleClose}
        onSubmit={handleSubmit}
        isSubmitting={isInquirySubmitting} 
      />
    </main>
  );
};

export default AcademicFAQ;
