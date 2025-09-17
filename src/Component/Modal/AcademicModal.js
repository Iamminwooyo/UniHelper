import { useState } from "react";
import { Modal, Button, Upload, AutoComplete } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./Modal.css";

const AcademicModal = ({ open, onCancel, onSubmit }) => {
  const [title, setTitle] = useState(""); // 폴더 이름
  const [attachmentFiles, setAttachmentFiles] = useState([]); // 첨부파일 리스트

  // ✅ 더미 데이터 (서버에서 받아온다고 가정)
  const folderOptions = [
    { value: "2025-1학기" },
    { value: "2025-2학기" },
    { value: "2026-1학기" },
    { value: "졸업논문 자료" },
  ];

  // 파일 선택 핸들러
  const handleAttachmentChange = ({ fileList }) => {
    setAttachmentFiles(fileList);
  };

  // 확인 버튼 클릭 시
  const handleSubmit = () => {
    const formData = {
      title,
      files: attachmentFiles.map((file) => file.originFileObj),
    };
    if (onSubmit) {
      onSubmit(formData);
    }
    setTitle("");
    setAttachmentFiles([]);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      closable={false}
      wrapClassName="custommodal_wrap"
    >
      <section className="custommodal_layout">
        <h2 className="custommodal_title">챗봇 파일 업로드</h2>

        {/* ✅ 폴더 이름 (AutoComplete 사용) */}
        <div className="custommodal_input_group">
          <p className="custommodal_input_label">폴더 이름</p>
          <AutoComplete
            style={{ width: "100%" }}
            placeholder="폴더 이름"
            options={folderOptions}        // 더미데이터 사용
            value={title}
            onChange={(value) => setTitle(value)} // 입력 or 선택 시 반영
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().includes(inputValue.toLowerCase())
            }
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
          />
        </div>

        {/* 파일 업로드 */}
        <div className="custommodal_input_group" style={{ marginTop: 16 }}>
          <p className="custommodal_input_label">첨부파일</p>
          <Upload
            className="custommodal_file_upload"
            fileList={attachmentFiles}
            onChange={handleAttachmentChange}
            beforeUpload={() => false}
            multiple
          >
            <Button
              icon={<UploadOutlined />}
              className="custommodal_file_upload_button"
            >
              파일 선택
            </Button>
          </Upload>
        </div>
      </section>

      {/* 확인 / 취소 버튼 */}
      <section style={{ marginTop: 10, marginBottom: 10, textAlign: "right" }}>
        <Button
          type="primary"
          className="custommodal_button_ok"
          onClick={handleSubmit}
          style={{ marginRight: 20 }}
        >
          확인
        </Button>
        <Button className="custommodal_button_cancle" onClick={onCancel}>
          취소
        </Button>
      </section>
    </Modal>
  );
};

export default AcademicModal;
