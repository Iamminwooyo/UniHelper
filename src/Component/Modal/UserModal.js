import "./Modal.css";
import { departments, semesters } from "../../Data/Userdata";
import { Modal, Input, Button, Select, Upload, Image } from "antd";
import { useEffect, useState } from "react";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const UserModal = ({ open, onCancel, initialData = null, mode, onSuccess }) => {
  // ------------------ 상태 ------------------
  const [name, setName] = useState(initialData?.name || "");
  const [studentId, setStudentId] = useState(initialData?.studentId || "");
  const [department, setDepartment] = useState(initialData?.department || "");
  const [semester, setSemester] = useState(initialData?.semester || "");
  const [subType, setSubType] = useState(initialData?.subType || "부전공");
  const [subMajor, setSubMajor] = useState(initialData?.subMajor || "");

  // profileImage -> fileList로 통합
  const [fileList, setFileList] = useState(
    initialData?.profileImage
      ? [
          {
            uid: "-1",
            name: "profile.png",
            status: "done",
            url: initialData.profileImage,
          },
        ]
      : []
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [step, setStep] = useState(1);

  const [gradeData, setGradeData] = useState({
    major: "",
    basicMajor: "",
    generalRequired: "",
    subMajor: "",
    linkedMajor: "",
    subMinor: "",
    totalCredits: "",
    gpa: "",
  });

  // ------------------ useEffect ------------------
  useEffect(() => {
    if (open) {
      if (mode === "grade") {
        setAttachmentFiles([]);
        setStep(1);
        setGradeData({
          major: "",
          basicMajor: "",
          generalRequired: "",
          subMajor: "",
          linkedMajor: "",
          subMinor: "",
          totalCredits: "",
          gpa: "",
        });
      }

      if (mode === "profile" && initialData) {
        setName(initialData.name || "");
        setStudentId(initialData.studentId || "");
        setDepartment(initialData.department || "");
        setSemester(initialData.semester || "");
        setFileList(
          initialData.profileImage
            ? [
                {
                  uid: "-1",
                  name: "profile.png",
                  status: "done",
                  url: initialData.profileImage,
                },
              ]
            : []
        );
      }
    }
  }, [open, mode, initialData]);

  // ------------------ 핸들러 ------------------
  const handleAttachmentChange = ({ fileList }) => setAttachmentFiles(fileList);

  const handleProfileChange = ({ file, onSuccess, onError }) => {
    getBase64(file)
      .then((url) => {
        setFileList([
          {
            uid: "-1",
            name: file.name,
            status: "done",
            url,
          },
        ]);
        onSuccess && onSuccess("ok");
      })
      .catch(() => onError && onError("error"));
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleSubmit = () => {
    if (mode === "profile") {
      const data = {
        name,
        studentId,
        department,
        semester,
        subType,
        subMajor,
        profileImage: fileList[0]?.url || null,
      };
      console.log("제출 데이터:", data);
      if (onSuccess) onSuccess(data);
      onCancel();
    }

    if (mode === "grade") {
      if (step === 1) {
        setStep(2);
        return;
      }
      if (step === 2) {
        const data = { ...gradeData, attachmentFiles };
        console.log("제출 데이터:", data);
        if (onSuccess) onSuccess(data);
        setStep(1);
        onCancel();
      }
    }
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
        <h2 className="custommodal_title">
          {mode === "profile" ? "내 정보 수정" : "학점 정보 입력"}
        </h2>

        {/* ---------------- Profile 모드 ---------------- */}
        {mode === "profile" && (
          <>
            {/* 프로필 이미지 업로드 (서클 + 삭제 + 미리보기) */}
            <div className="custommodal_input_group">
              <p className="custommodal_input_label">프로필 이미지</p>
              <Upload
                accept="image/*"
                listType="picture-circle"
                fileList={fileList}
                onPreview={handlePreview}
                customRequest={handleProfileChange}
                onChange={({ fileList }) => setFileList(fileList)}
                className="custommodal_upload_circle"
              >
                {fileList.length >= 1 ? null : (
                  <div className="custommodal_upload">
                    <PlusOutlined />
                    <span className="custommodal_upload_text">이미지 선택</span>
                  </div>
                )}
              </Upload>
              <Image
                style={{ display: "none" }}
                preview={{
                  visible: previewOpen,
                  src: previewImage,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                }}
              />
            </div>

            {/* 이름 */}
            <div className="custommodal_input_group" style={{ marginTop: 16 }}>
              <p className="custommodal_input_label">이름</p>
              <Input
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* 학과 */}
            <div className="custommodal_input_group" style={{ marginTop: 16 }}>
              <p className="custommodal_input_label">학과</p>
              <Select
                placeholder="학과"
                value={department || undefined}
                onChange={(value) => setDepartment(value)}
                style={{ width: "100%" }}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                {departments.map((dep) => (
                  <Option key={dep} value={dep}>
                    {dep}
                  </Option>
                ))}
              </Select>
            </div>

            {/* 학기 */}
            <div className="custommodal_input_group" style={{ marginTop: 16 }}>
              <p className="custommodal_input_label">학기</p>
              <Select
                placeholder="학기"
                value={semester || undefined}
                onChange={(value) => setSemester(value)}
                style={{ width: "100%" }}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                {semesters.map((sem) => (
                  <Option key={sem} value={sem}>
                    {sem}
                  </Option>
                ))}
              </Select>
            </div>

            {/* 학번 */}
            <div className="custommodal_input_group" style={{ marginTop: 16 }}>
              <p className="custommodal_input_label">학번</p>
              <Input
                placeholder="학번"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                maxLength={15}
              />
            </div>

            {/* 부/복수 전공 */}
            <div className="custommodal_input_group" style={{ marginTop: 16 }}>
              <p className="custommodal_input_label">부/복수 전공</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <Select
                  placeholder="부/복수"
                  value={subType}
                  onChange={(value) => setSubType(value)}
                  style={{ width: "40%" }}
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value="부전공">부전공</Option>
                  <Option value="복수전공">복수전공</Option>
                </Select>
                <Select
                  placeholder="학과"
                  value={subMajor || undefined}
                  onChange={(value) => setSubMajor(value)}
                  style={{ width: "60%" }}
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  {departments.map((dep) => (
                    <Option key={dep} value={dep}>
                      {dep}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </>
        )}

        {/* ---------------- Grade 모드 ---------------- */}
        {mode === "grade" && step === 1 && (
          <div className="custommodal_input_group">
            <p className="custommodal_input_label">이수구분표 업로드</p>
            <Upload
              className="custommodal_file_upload"
              fileList={attachmentFiles}
              onChange={handleAttachmentChange}
              beforeUpload={() => false}
              multiple={false}
              accept=".pdf"
            >
              <Button icon={<UploadOutlined />} className="custommodal_file_upload_button">
                파일 선택
              </Button>
            </Upload>
          </div>
        )}

        {mode === "grade" &&
          step === 2 &&
          [
            ["전공", "major"],
            ["기초전공", "basicMajor"],
            ["교양필수", "generalRequired"],
            ["부/복수 전공", "linkedMajor"],
            ["부/복수 기초전공", "subMinor"],
            ["총 이수학점", "totalCredits"],
            ["평점", "gpa"],
          ].map(([label, key]) => (
            <div className="custommodal_input_group" style={{ marginTop: 16 }} key={key}>
              <p className="custommodal_input_label">{label}</p>
              <Input
                value={gradeData[key]}
                onChange={(e) => setGradeData({ ...gradeData, [key]: e.target.value })}
              />
            </div>
          ))}
      </section>

      {/* 버튼 영역 */}
      <section className="custommodal_footer">
        <Button type="primary" className="custommodal_button_ok" onClick={handleSubmit}>
          {mode === "grade" && step === 1 ? "다음" : "확인"}
        </Button>
        <Button className="custommodal_button_cancle" onClick={onCancel}>
          취소
        </Button>
      </section>
    </Modal>
  );
};

export default UserModal;
