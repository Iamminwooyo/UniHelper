import "./Modal.css";
import { useState } from "react";
import { Modal, Input, Button, Upload, message } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";

const NoticeModal = ({ open, onCancel, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const resetState = () => {
    setTitle("");
    setContent("");
    setImageFiles([]);
    setFileList([]);
    setSubmitting(false);
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  // 이미지 업로드 (여러 개)
  const handleImageChange = ({ fileList }) => {
    setImageFiles(fileList);
  };

  const beforeImageUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isImage) message.error("이미지 파일만 업로드 가능합니다.");
    if (!isLt2M) message.error("이미지는 2MB 이하만 가능합니다.");
    return isImage && isLt2M;
  };

  // 첨부파일 업로드
  const handleFileUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  // 제출
  const handleSubmit = async () => {
    if (!title.trim()) return message.error("제목을 입력해주세요.");
    if (!content.trim()) return message.error("내용을 입력해주세요.");

    setSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        images: imageFiles,       // 이미지 여러 개
        attachments: fileList,    // 첨부파일 여러 개
      });
      message.success("공지사항이 작성되었습니다.");
      handleCancel();
    } catch (error) {
      message.error("작성 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      closable={false}
      wrapClassName="passwordmodal_wrap"
    >
      <section className="passwordmodal_layout">
        <h2 className="passwordmodal_title">공지사항 작성</h2>

        {/* 제목 */}
        <div className="passwordmodal_input_group">
          <p className="passwordmodal_input_label">제목</p>
          <Input
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* 내용 */}
        <div className="passwordmodal_input_group" style={{ marginTop: 16 }}>
          <p className="passwordmodal_input_label">내용</p>
          <Input.TextArea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            maxLength={1000}
          />
        </div>

        {/* 이미지 업로드 */}
        <div className="passwordmodal_input_group" style={{ marginTop: 16 }}>
          <p className="passwordmodal_input_label">이미지 업로드</p>
          <Upload
            className="noticemodal_img_upload"
            listType="picture-card"
            fileList={imageFiles}
            onChange={handleImageChange}
            beforeUpload={beforeImageUpload}
            multiple
            onPreview={(file) => window.open(file.thumbUrl || file.url)}
          >
            {imageFiles.length >= 8 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </div>

        {/* 첨부파일 업로드 */}
        <div className="passwordmodal_input_group" style={{ marginTop: 16 }}>
          <p className="passwordmodal_input_label">첨부파일</p>
          <Upload
            className="noticemodal_file_upload"
            fileList={fileList}
            onChange={handleFileUploadChange}
            beforeUpload={() => false}
            multiple
          >
            <Button icon={<UploadOutlined />}>파일 선택</Button>
          </Upload>
        </div>
      </section>

      {/* 확인 / 취소 */}
      <section style={{ marginTop: 10, marginBottom: 10, textAlign: "right" }}>
        <Button
          type="primary"
          className="textmodal_button_ok"
          onClick={handleSubmit}
          loading={submitting}
          style={{ marginRight: 20 }}
        >
          확인
        </Button>
        <Button className="textmodal_button_cancle" onClick={handleCancel}>
          취소
        </Button>
      </section>
    </Modal>
  );
};

export default NoticeModal;
