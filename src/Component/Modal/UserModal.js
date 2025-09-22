import "./Modal.css";
import { useRecoilValue } from "recoil";
import { userBriefState } from "../../Recoil/Atom";
import { departments, departmentsStaff, semesters } from "../../Data/Userdata";
import { uploadCreditsFile } from "../../API/UserAPI";
import { Modal, Input, Button, Select, Upload, Image, message, Spin } from "antd";
import { useEffect, useState } from "react";
import { UploadOutlined, PlusOutlined, LoadingOutlined } from "@ant-design/icons";

const { Option } = Select;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const UserModal = ({ open, onCancel, initialData = null, mode, onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);

  const userBrief = useRecoilValue(userBriefState);
  const roleType = userBrief.roleType;

  // ------------------ 상태 ------------------
  const [username, setUsername] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [gradeLabel, setGradeLabel] = useState("");
  const [subType, setSubType] = useState(null);
  const [subMajor, setSubMajor] = useState("");

  const [fileList, setFileList] = useState([]);
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

  const urlToFile = async (url, filename) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

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
        setUsername(initialData.username || "");
        setStudentNumber(initialData.studentNumber || "");
        setDepartment(initialData.department || "");
        setGradeLabel(initialData.gradeLabel || "");

        if (initialData.minor) {
          setSubType("부전공");
          setSubMajor(initialData.minor);
        } else if (initialData.doubleMajor) {
          setSubType("복수전공");
          setSubMajor(initialData.doubleMajor);
        } else {
          setSubType(null);
          setSubMajor("");
        }

        setFileList(
          initialData.profileUrl
            ? [
                {
                  uid: "-1",
                  name: "profile.png",
                  status: "done",
                  url: initialData.profileUrl,
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
            originFileObj: file,
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

  const handleSubmit = async () => {
     if (mode === "profile") {
    let profileImageFile = null;

    if (fileList.length === 0) {
      profileImageFile = null;
    } else if (fileList[0].originFileObj) {
      profileImageFile = fileList[0].originFileObj;
    } else {
      profileImageFile = await urlToFile(fileList[0].url, "profile.png");
    }

    const data = {
      username,
      studentNumber: roleType === "STUDENT" ? studentNumber : "",
      department,
      gradeLabel: roleType === "STUDENT" ? gradeLabel : "",
      minor: roleType === "STUDENT" && subType === "부전공" ? subMajor : null,
      doubleMajor: roleType === "STUDENT" && subType === "복수전공" ? subMajor : null,
      profileImageFile,
    };

    if (onSuccess) onSuccess(data);
    onCancel();
  }

     if (mode === "grade") {
        if (step === 1) {
          if (attachmentFiles.length === 0) {
            message.error("파일을 선택해주세요.");
            return;
          }

          const formData = new FormData();
          formData.append("file", attachmentFiles[0].originFileObj);

          try {
            setIsUploading(true); // 🔒 세마포어 ON
            const result = await uploadCreditsFile(formData); // API 호출
            console.log("📂 업로드 응답:", result);

           setGradeData({
            generalRequired: result["교양 필수"] ?? "",
            basicMajor: result["기초전공"] ?? "",
            major: result["단일전공자 최소전공이수학점"] ?? "",
            subMinor: result["부전공 기초전공"] ?? result["복수전공 기초전공"] ?? "",
            linkedMajor: result["부전공 최소전공이수학점"] ?? result["복수전공 최소전공이수학점"] ?? "",
            totalCredits: result["졸업학점"] ?? "",
            acquiredCredits: result["취득학점"] ?? "",
            transferCredits: result["편입인정학점"] ?? "",
            gpa: result["학점평점"] ?? "",
          });

            setStep(2);
          } catch (err) {
            console.error("❌ 업로드 실패:", err);
            if (err.response?.status === 401) {
              message.error("인증이 만료되었습니다. 다시 로그인해주세요.");
            } else {
              message.error("파일 업로드 중 오류가 발생했습니다.");
            }
          } finally {
            setIsUploading(false); // 🔓 세마포어 OFF
          }
          return;
        }

        if (step === 2) {
          const data = { ...gradeData };
          if (onSuccess) onSuccess(data);
          setStep(1);
          onCancel();
          }
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
      wrapClassName="custommodal_wrap"
    >
      <section className="custommodal_layout">
        <h2 className="custommodal_title">
          {mode === "profile" ? "내 정보 수정" : "학점 정보 입력"}
        </h2>

        {/* ---------------- Profile 모드 ---------------- */}
        {mode === "profile" && (
          <>
            {/* 프로필 이미지 업로드 */}
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={100}
                disabled
              />
            </div>

            {/* 학과 or 부서 */}
            <div className="custommodal_input_group" style={{ marginTop: 8 }}>
              <p className="custommodal_input_label">
                {roleType === "STUDENT" ? "학과" : "부서"}
              </p>
              <Select
                placeholder={roleType === "STUDENT" ? "학과" : "부서"}
                value={department || undefined}
                onChange={(value) => setDepartment(value)}
                style={{ width: "100%" }}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                {(roleType === "STUDENT" ? departments : departmentsStaff).map((dep) => (
                  <Option key={dep} value={dep}>
                    {dep}
                  </Option>
                ))}
              </Select>
            </div>

            {/* STUDENT 전용 필드 */}
            {roleType === "STUDENT" && (
              <>
                {/* 학기 */}
                <div className="custommodal_input_group" style={{ marginTop: 16 }}>
                  <p className="custommodal_input_label">학기</p>
                  <Select
                    placeholder="학기"
                    value={gradeLabel || undefined}
                    onChange={(value) => setGradeLabel(value)}
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
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    maxLength={15}
                  />
                </div>

                {/* 부/복수 전공 */}
                <div className="custommodal_input_group" style={{ marginTop: 16 }}>
                  <p className="custommodal_input_label">부/복수 전공</p>
                  <div style={{ display: "flex", flexDirection:'column', gap:'10px'}}>
                    <Select
                      placeholder="부/복수"
                      value={subType ?? undefined} 
                      onChange={(value) => {
                        if (value === "") {
                          setSubType(null);
                          setSubMajor("");
                        } else {
                          setSubType(value);
                        }
                      }}
                      style={{ width: "100%" }}
                      getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    >
                      <Option value="">없음</Option> 
                      <Option value="부전공">부전공</Option>
                      <Option value="복수전공">복수전공</Option>
                    </Select>
                    <Select
                      placeholder="학과"
                      value={subMajor || undefined}
                      onChange={(value) => setSubMajor(value)}
                      style={{ width: "100%", marginTop:"10px" }}
                      disabled={!subType}   
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

            {isUploading && (
              <div className="custommodal_upload_status">
                <Spin
                  indicator={<LoadingOutlined style={{ color: "#78d900" }} spin />}
                  size="small"
                />
                <span style={{ marginLeft: 8 }}>이수구분표 업로드 중...</span>
              </div>
            )}
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
            <div
              className="custommodal_input_group"
              style={{ marginTop: 16 }}
              key={key}
            >
              <p className="custommodal_input_label">{label}</p>
              <Input
                value={gradeData[key]}
                onChange={(e) =>
                  setGradeData({ ...gradeData, [key]: e.target.value })
                }
              />
            </div>
          ))}
      </section>

      {/* 버튼 영역 */}
      <section className="custommodal_footer">
        <Button
          type="primary"
          className="custommodal_button_ok"
          onClick={handleSubmit}
          disabled={isUploading}
        >
          {mode === "grade" && step === 1 ? "다음" : "확인"}
        </Button>
        <Button className="custommodal_button_cancle" onClick={onCancel} disabled={isUploading}>
          취소
        </Button>
      </section>
    </Modal>
  );
};

export default UserModal;
