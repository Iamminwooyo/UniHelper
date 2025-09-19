import { downloadFileById } from "../../API/AcademicAPI";
import { message } from "antd";

const AcademicCard = ({ index, name, date, fileId }) => {
  const handleDownload = async () => {
    try {
      const blob = await downloadFileById(fileId); // filename 기반 다운로드
      if (!blob || blob.size === 0) {
        message.error("서버에서 파일을 찾을 수 없습니다.");
        return;
      }
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name; // 원래 파일명 그대로 저장
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("❌ 파일 다운로드 실패:", err);
      message.error("파일 다운로드에 실패했습니다.");
    }
  };

  return (
    <section className="academiccard_layout" onClick={handleDownload}>
      <p className="academiccard_name">
        <span className="academiccard_index">{index + 1}. </span>
        <span className="academiccard_link">{name}</span>
      </p>
      <span className="academiccard_date">{date}</span>
    </section>
  );
};

export default AcademicCard;
