import { useState, useEffect } from "react";
import { fetchCollections } from "../../API/AcademicAPI";
import { Modal, Button, Upload, AutoComplete, Spin, message } from "antd";
import { UploadOutlined, LoadingOutlined  } from "@ant-design/icons";
import "./Modal.css";

const AcademicModal = ({ open, onCancel, onSubmit, isUploading }) => {
  const [title, setTitle] = useState(""); // 폴더 이름
  const [attachmentFiles, setAttachmentFiles] = useState([]); // 첨부파일 리스트

  const [folderOptions, setFolderOptions] = useState([]);

  const folderNameRegex = /^[A-Za-z0-9!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]+$/;
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const data = await fetchCollections();
        setFolderOptions((data.collections || []).map((name) => ({ value: name })));
      } catch (err) {
        console.error("❌ 컬렉션 목록 불러오기 실패:", err);
      }
    };

    if (open) {
      loadCollections();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setAttachmentFiles([]);
    }
  }, [open]);

  // 폴더 이름 함수
  const handleTitleChange = (value) => {
    setTitle(value);
    if (!value) {
      setTitleError("폴더 이름을 입력해주세요.");
    } else if (!folderNameRegex.test(value)) {
      setTitleError("영문자와 숫자만 입력 가능합니다.");
    } else {
      setTitleError("");
    }
  };

  // 파일 선택 핸들러
  const handleAttachmentChange = ({ fileList }) => {
    setAttachmentFiles(fileList);
  };

 // 확인 버튼 클릭 시
  const handleSubmit = () => {
    if (!title) {
      message.error("폴더 이름을 입력해주세요.");
      return;
    }
    if (!folderNameRegex.test(title)) {
      message.error("영문자와 숫자만 입력 가능합니다.");
      return;
    }
    if (attachmentFiles.length === 0) {
      message.error("첨부파일을 최소 1개 이상 선택해주세요.");
      return;
    }

    const formData = {
      title,
      files: attachmentFiles.map((file) => file.originFileObj),
    };
    if (onSubmit) {
      onSubmit(formData, () => {
        setTitle("");
        setAttachmentFiles([]);
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={isUploading ? null : onCancel}  
      footer={null}
      centered
      closable={false}
      maskClosable={!isUploading}               
      keyboard={!isUploading}            
      wrapClassName="custommodal_wrap"
    >
      <section className="custommodal_layout">
        <h2 className="custommodal_title">챗봇 파일 업로드</h2>

        {/* ✅ 폴더 이름 (AutoComplete 사용) */}
       <div className="custommodal_input_group">
        <p className="custommodal_input_label">폴더 이름</p>
        <AutoComplete
          className="custommodal_autocomplete"
          style={{ width: "100%" }}
          placeholder="폴더 이름"
          options={folderOptions}
          value={title}
          onChange={handleTitleChange}
          filterOption={(inputValue, option) =>
            option.value.toLowerCase().includes(inputValue.toLowerCase())
          }
          getPopupContainer={(triggerNode) => triggerNode.parentNode} 
          disabled={isUploading}
        />
      </div>

       <p className={`custommodal_autocomplete_message ${titleError ? "error" : ""}`}>
        {titleError || "\u00A0"}
      </p>

        {/* 파일 업로드 */}
        <div className="custommodal_input_group" style={{ marginTop: 16 }}>
          <p className="custommodal_input_label">첨부파일</p>
          <Upload
            className="custommodal_file_upload"
            fileList={attachmentFiles}
            onChange={handleAttachmentChange}
            beforeUpload={() => false}
            multiple
            disabled={isUploading} 
          >
            <Button
              icon={<UploadOutlined />}
              className="custommodal_file_upload_button"
              disabled={isUploading} 
            >
              파일 선택
            </Button>
          </Upload>
        </div>
        {isUploading && (
          <div className="custommodal_upload_status">
            <Spin
              indicator={<LoadingOutlined style={{ color: "#78d900" }} spin />}
              size="small"
            />
            <span style={{ marginLeft: 8 }}>파일 업로드 중...</span>
          </div>
        )}
      </section>

      {/* 확인 / 취소 버튼 */}
      <section className="custommodal_footer">
        <Button
          type="primary"
          className="custommodal_button_ok"
          onClick={handleSubmit}
          disabled={isUploading}  
        >
          확인
        </Button>
        <Button className="custommodal_button_cancle" onClick={onCancel} disabled={isUploading}  >
          취소
        </Button>
      </section>
    </Modal>
  );
};

export default AcademicModal;
