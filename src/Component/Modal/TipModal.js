import "./Modal.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Input, Button, Upload, Select, message } from "antd";
import { useRecoilValue } from "recoil";
import { userBriefState } from "../../Recoil/Atom";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const allTags = ["전공", "학식", "배달", "동아리", "위치", "대회", "성적"];

const TipModal = ({ open, onCancel, onSubmit, initialData = null, mode = "create", onSuccess }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [tags, setTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const userBrief = useRecoilValue(userBriefState);

  // 모달 열릴 때마다 initialData로 초기화
  useEffect(() => {
    if (open) {
      setTitle(initialData?.title || "");
      setContent(initialData?.text || "");
      setImageFiles(initialData?.images || []);
      setTags(initialData?.tags || []);
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
    return false; // ← 반드시 false
  };

   // 태그 선택 변경 핸들러
  const handleTagsChange = (value) => {
     if (value.length > 3) {
        message.warning("태그는 최대 3개까지 선택 가능합니다.");
        return;
      }
      setTags(value);
  };

  // Tip 작성, 수정 API
  const handleSubmit = async () => {
    if (submitting) return;
    
    if (!title.trim()) return message.error("제목을 입력해주세요.");
    if (!content.trim()) return message.error("내용을 입력해주세요.");

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("text", content.trim());
      formData.append("tags", tags.join(","));

      imageFiles.forEach((file) => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj);
        }
      });

      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        message.error("로그인이 필요합니다.");
        setSubmitting(false);
        return;
      }

      if (mode === "edit" && initialData?.id) {
        await axios.patch(`/community/${initialData.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        message.success("Tip이 수정되었습니다.");
      } else {
        await axios.post("/community", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        message.success("Tip이 작성되었습니다.");
      }

      if (onSuccess) onSuccess();
      handleCancel();
    } catch (error) {
      console.error(error);
      if (error.response?.status === 403) {
        message.error("권한이 없습니다. 로그인 상태를 확인해주세요.");
      } else {
        message.error("작성 중 오류가 발생했습니다.");
      }
    } finally {
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
      wrapClassName="custommodal_wrap"
    >
      <section className="custommodal_layout">
        <h2 className="custommodal_title">{mode === "edit" ? "Tip 수정" : "Tip 작성"}</h2>

        {/* 제목 */}
        <div className="custommodal_input_group">
          <p className="custommodal_input_label">제목</p>
          <Input
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* 내용 */}
        <div className="custommodal_input_group" style={{ marginTop: 16 }}>
          <p className="custommodal_input_label">내용</p>
          <Input.TextArea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            autoSize={{ minRows: 1, maxRows: 30 }}
          />
        </div>

        {/* 이미지 업로드 */}
        <div className="custommodal_input_group" style={{ marginTop: 16 }}>
          <p className="custommodal_input_label">이미지</p>
          <Upload
            className="custommodal_img_upload"
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

        <div className="custommodal_input_group" style={{ marginTop: 16 }}>
          <p className="custommodal_input_label">태그</p>
          <Select
            mode="multiple"
            allowClear
            placeholder="태그"
            value={tags}
            onChange={handleTagsChange}
            style={{ width: "100%" }}
          >
            {allTags.map((tag) => (
              <Select.Option key={tag} value={tag}>
                {tag}
              </Select.Option>
            ))}
          </Select>
        </div>
      </section>

      {/* 확인 / 취소 */}
      <section style={{ marginTop: 10, marginBottom: 10, textAlign: "right" }}>
        <Button
          type="primary"
          className="custommodal_button_ok"
          onClick={handleSubmit}
          style={{ marginRight: 20 }}
        >
          확인
        </Button>
        <Button className="custommodal_button_cancle" onClick={handleCancel}>
          취소
        </Button>
      </section>
    </Modal>
  );
};

export default TipModal;
