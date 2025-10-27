import "./Modal.css";
import { useState, useEffect, useRef } from "react";
import { createTip, updateTip } from "../../API/TipAPI";
import { Modal, Input, Button, Upload, Select, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const allTags = ["전공", "학식", "배달", "동아리", "위치", "대회", "성적"];

const TipModal = ({ open, onCancel, initialData = null, mode = "create", onSuccess }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createdObjectUrlsRef = useRef([]);

  // 렌더링 함수
  useEffect(() => {
    if (!open) return;

    setTitle(initialData?.title || "");
    setContent(initialData?.text || "");
    setTags(initialData?.tags || []);

    let cancelled = false;

   const loadExistingImages = async () => {
      const imgs = initialData?.images || [];
      if (!imgs.length) {
        setImageFiles([]);
        return;
      }

      const files = imgs.map((original, i) => ({
        uid: `existing-img-${i}`,
        id: original.id,
        name: original.url.split("/").pop(),
        status: "done",
        url: original.url,     
        thumbUrl: original.url,  
      }));

      setImageFiles(files);
    };

    loadExistingImages();

    return () => {
      cancelled = true;
      for (const u of createdObjectUrlsRef.current) {
        try { URL.revokeObjectURL(u); } catch {}
      }
      createdObjectUrlsRef.current = [];
    };
  }, [open, initialData]);

   // Tip 생성, 수정 함수
  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!title.trim()) return message.error("제목을 입력해주세요.");
    if (!content.trim()) return message.error("내용을 입력해주세요.");

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      if (mode === "edit" && initialData?.id) {
        const keptImageIds = imageFiles.filter(f => !f.originFileObj).map(f => f.id);
        const removeImageIds = (initialData?.images || [])
          .filter(img => !keptImageIds.includes(img.id))
          .map(img => img.id);

        const payload = {
          title: title.trim(),
          text: content.trim(),
          tags,
          removeImageIds
        };

        const formData = new FormData();
        formData.append(
          "payload",
          new Blob([JSON.stringify(payload)], { type: "application/json" })
        );

        imageFiles.forEach(f => {
          if (f.originFileObj) {
            formData.append("images", f.originFileObj);
          }
        });

        await updateTip(initialData.id, formData);
        message.success("Tip이 수정되었습니다.");
      } else {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("text", content.trim());
        if (tags.length > 0) {
          formData.append("tags", tags.join(",")); 
        }

        imageFiles.forEach(f => {
          if (f.originFileObj) {
            formData.append("images", f.originFileObj);
          }
        });

        await createTip(formData);
        message.success("Tip이 작성되었습니다.");
      }

      onSuccess?.();
      handleCancel();
    } catch (err) {
      console.error("submit error:", err);
      message.error("작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 이미지 업로드 함수
  const beforeImageUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    const isLt25M = file.size / 1024 / 1024 < 25;
    if (!isImage) {
    message.error("이미지 파일만 업로드 가능합니다.");
    return Upload.LIST_IGNORE; // ← 리스트에도 추가되지 않음
    }

    if (!isLt25M) {
      message.error("이미지는 25MB 이하만 가능합니다.");
      return Upload.LIST_IGNORE;
    }

    return false; // ← 반드시 false
  };

  // 이미지 저장 함수
  const handleImageChange = ({ fileList }) => {
    setImageFiles(fileList);
  };

   // 태그 선택 변경 핸들러
  const handleTagsChange = (value) => {
     if (value.length > 3) {
        message.warning("태그는 최대 3개까지 선택 가능합니다.");
        return;
      }
      setTags(value);
  };

  // 닫기 함수
  const handleCancel = () => {
    onCancel();
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

        <div className="custommodal_input_group">
          <p className="custommodal_input_label">제목 <span style={{color: '#78D900', marginLeft:'3px', display:'flex', alignItems:'center'}}>* </span></p>
          <Input
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="custommodal_input_group" style={{ marginTop: 16 }}>
          <p className="custommodal_input_label">내용 <span style={{color: '#78D900', marginLeft:'3px', display:'flex', alignItems:'center'}}>* </span></p>
          <Input.TextArea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            autoSize={{ minRows: 1, maxRows: 30 }}
          />
        </div>

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

      <section className="custommodal_footer">
        <Button
          type="primary"
          className="custommodal_button_ok"
          onClick={handleSubmit}
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
