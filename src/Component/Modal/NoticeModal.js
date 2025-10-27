import "./Modal.css";
import { useState, useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import { userBriefState } from "../../Recoil/Atom";
import { createNotice, updateNotice, fetchNoticeImagePreview  } from "../../API/NoticeAPI";
import { Modal, Input, Button, Upload, message } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";

const NoticeModal = ({ open, onCancel, initialData = null, mode = "create", onSuccess }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userBrief = useRecoilValue(userBriefState);

  const createdObjectUrlsRef = useRef([]);

  // 렌더링 함수
  useEffect(() => {
    if (!open) return;

    setTitle(initialData?.title || "");
    setContent(initialData?.text || "");

    const initialAttachments =
      (initialData?.attachments || []).map((att) => ({
        uid: `existing-file-${att.id}`,
        id: att.id,   
        name: att.url.split("/").pop(),
        status: "done",
        url: att.url,
      })) ?? [];
    setAttachmentFiles(initialAttachments);

    let cancelled = false;

    const loadExistingImages = async () => {
      for (const u of createdObjectUrlsRef.current) {
        try { URL.revokeObjectURL(u); } catch {}
      }
      createdObjectUrlsRef.current = [];

      const imgs = initialData?.images || [];
      if (!imgs.length) {
        setImageFiles([]);
        return;
      }

      try {
        const files = [];
        for (let i = 0; i < imgs.length; i++) {
          const original = imgs[i];
          try {
            const blob = await fetchNoticeImagePreview(original.url);
            if (cancelled) return;
            const objUrl = URL.createObjectURL(blob);
            createdObjectUrlsRef.current.push(objUrl);

            files.push({
              uid: `existing-img-${i}`,
              id: original.id,  
              name: original.url.split("/").pop(),
              status: "done",
              thumbUrl: objUrl,
            });
          } catch {
            // 개별 이미지 실패 시 무시
          }
        }
        if (!cancelled) setImageFiles(files);
      } catch (e) {
        if (!cancelled) setImageFiles([]);
      }
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

  // 공지사항 생성 / 수정 함수
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

        const keptAttachmentIds = attachmentFiles.filter(f => !f.originFileObj).map(f => f.id);
        const removeAttachmentIds = (initialData?.attachments || [])
          .filter(att => !keptAttachmentIds.includes(att.id))
          .map(att => att.id);

        const noticeDto = {
          title: title.trim(),
          text: content.trim(),
          department: userBrief?.department,
          removeImageIds,    
          removeAttachmentIds, 
        };
        formData.append("notice", JSON.stringify(noticeDto));

        imageFiles.forEach(f => {
          if (f.originFileObj) formData.append("images", f.originFileObj);
        });
        attachmentFiles.forEach(f => {
          if (f.originFileObj) formData.append("attachments", f.originFileObj);
        });

        await updateNotice(initialData.id, formData);
        message.success("공지사항이 수정되었습니다.");
      } else {
        const noticeDto = {
          title: title.trim(),
          text: content.trim(),
          department: userBrief?.department,
        };
        formData.append("notice", JSON.stringify(noticeDto));

        imageFiles.forEach(f => {
          if (f.originFileObj) formData.append("images", f.originFileObj);
        });
        attachmentFiles.forEach(f => {
          if (f.originFileObj) formData.append("attachments", f.originFileObj);
        });

        await createNotice(formData);
        message.success("공지사항이 작성되었습니다.");
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error("submit error:", err);
      message.error("작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // 이미지 업로드 함수
  const beforeImageUpload = (file) => {
    const isImage = file.type?.startsWith("image/");
    const isLt25M = file.size / 1024 / 1024 < 25;
    if (!isImage) {
      message.error("이미지 파일만 업로드 가능합니다.");
      return Upload.LIST_IGNORE; // ← 리스트에도 추가되지 않음
    }

    if (!isLt25M) {
      message.error("이미지는 25MB 이하만 가능합니다.");
      return Upload.LIST_IGNORE;
    }
    // 업로드는 수동(FormData로 직접 append) 처리 → false 리턴
    return false;
  };

  // 이미지 저장 함수
  const handleImageChange = ({ fileList }) => {
    setImageFiles(fileList);
  }

  // 파일 저장 함수
  const handleAttachmentChange = ({ fileList }) => setAttachmentFiles(fileList);

  // 닫기 함수
  const handleClose = () => onCancel?.();


  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      closable={false}
      wrapClassName="custommodal_wrap"
    >
      <section className="custommodal_layout">
        <h2 className="custommodal_title">{mode === "edit" ? "공지사항 수정" : "공지사항 작성"}</h2>

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

      <section className="custommodal_footer">
        <Button
          type="primary"
          className="custommodal_button_ok"
          onClick={handleSubmit}
        >
          확인
        </Button>
        <Button className="custommodal_button_cancle" onClick={handleClose}>
          취소
        </Button>
      </section>
    </Modal>
  );
};

export default NoticeModal;
