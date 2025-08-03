import "./Modal.css";
import { useState, useEffect } from "react";
import { Modal, Input, Button, Upload, message } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";

const NoticeModal = ({ open, onCancel, onSubmit, initialData = null, mode = "create" }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // 모달 열릴 때마다 initialData로 초기화
  useEffect(() => {
    if (open) {
      setTitle(initialData?.title || "");
      setContent(initialData?.content || "");
      setImageFiles(initialData?.images || []);
      setFileList(initialData?.attachments || []);
      setSubmitting(false);
    }
  }, [open, initialData]);

  const handleCancel = () => {
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
        images: imageFiles,
        attachments: fileList,
        id: initialData?.id, // 수정용 id 전달 (필요하면)
      });
      message.success(mode === "edit" ? "공지사항이 수정되었습니다." : "공지사항이 작성되었습니다.");
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
        <h2 className="passwordmodal_title">{mode === "edit" ? "공지사항 수정" : "공지사항 작성"}</h2>

        {/* 제목 */}
        <div className="noticemodal_input_group">
          <p className="noticemodal_input_label">제목</p>
          <Input
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* 내용 */}
        <div className="noticemodal_input_group" style={{ marginTop: 16 }}>
          <p className="noticemodal_input_label">내용</p>
          <Input.TextArea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            maxLength={1000}
            autoSize={{ minRows: 1, maxRows: 30 }}
          />
        </div>

        {/* 이미지 업로드 */}
        <div className="noticemodal_input_group" style={{ marginTop: 16 }}>
          <p className="noticemodal_input_label">이미지</p>
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
                <div style={{ marginTop: 8 }}>이미지 선택</div>
              </div>
            )}
          </Upload>
        </div>

        {/* 첨부파일 업로드 */}
        <div className="noticemodal_input_group" style={{ marginTop: 16 }}>
          <p className="noticemodal_input_label">첨부파일</p>
          <Upload
            className="noticemodal_file_upload"
            fileList={fileList}
            onChange={handleFileUploadChange}
            beforeUpload={() => false}
            multiple
          >
            <Button icon={<UploadOutlined />} className="noticemodal_file_upload_button">
              파일 선택
            </Button>
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
