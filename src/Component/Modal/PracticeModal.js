// src/Component/Modal/DeptModal.js
import { useState, useEffect } from "react";
import { Modal, Button } from "antd";

const DeptModal = ({ open, onClose, setDeptName, setDeptCode }) => {
  const [selectedCollege, setSelectedCollege] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const collegeMap = {
  "테스트대학": [
    { dept: "테스트학과", code: "3251" },
  ],
  "무도대학": [
    { dept: "유도학과", code: "3101" },
    { dept: "유도경기지도학과", code: "3102" },
    { dept: "무도학과", code: "3103" },
    { dept: "태권도학과", code: "3104" },
    { dept: "경호학과", code: "3105" },
  ],
  "체육과학대학": [
    { dept: "스포츠레저학과", code: "3201" },
    { dept: "체육학과", code: "3202" },
    { dept: "골프학부", code: "3203" },
    { dept: "특수체육교육과", code: "3204" },
  ],
  "문화예술대학": [
    { dept: "무용과", code: "3301" },
    { dept: "미디어디자인학과", code: "3302" },
    { dept: "회화학과", code: "3303" },
    { dept: "연극학과", code: "3304" },
    { dept: "국악과", code: "3305" },
    { dept: "영화영상학과", code: "3306" },
    { dept: "문화유산학과", code: "3307" },
    { dept: "문화콘텐츠학과", code: "3308" },
    { dept: "실용음악과", code: "3309" },
  ],
  "인문사회융합대학": [
    { dept: "경영학과", code: "4202" },
    { dept: "관광경영학과", code: "4206" },
    { dept: "경찰행정학과", code: "4207" },
    { dept: "중국학과", code: "4208" },
    { dept: "사회복지학과", code: "4209" },
  ],
  "AI바이오융합대학": [
    { dept: "보건환경안전학과", code: "4304" },
    { dept: "바이오생명공학과", code: "4305" },
    { dept: "물리치료학과", code: "4306" },
    { dept: "식품조리학부", code: "4307" },
    { dept: "AI융합학부", code: "4308" },
  ],
};

  useEffect(() => {
    if (open) {
      setSelectedCollege("");
      setKeyword("");
      setSearchResults([]);
    }
  }, [open]);

  // ✅ 버튼 클릭 시 실행되는 함수
  const handleSearch = () => {
    if (keyword.trim()) {
        let filtered = [];

        if (selectedCollege && collegeMap[selectedCollege]) {
        // 특정 대학에서만 검색
        filtered = collegeMap[selectedCollege]
            .filter((d) => d.dept.includes(keyword.trim()))  // ✅ d.dept로 검색
            .map((d) => ({ ...d, college: selectedCollege })); // ✅ dept + code + college 포함
        } else {
        // 전체 대학 검색
        Object.keys(collegeMap).forEach((college) => {
            collegeMap[college].forEach((d) => {
            if (d.dept.includes(keyword.trim())) {
                filtered.push({ ...d, college }); // ✅ dept + code + college 포함
            }
            });
        });
        }

        setSearchResults(filtered);
    } else {
        setSearchResults([]);
    }
  };

  return (
    <Modal
      title="학과코드 조회"
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      styles={{
        content: {
          border: "4px solid #4F75B0",
          borderRadius: "0px",
        },
         body: {
        height: 500,          // 원하는 높이
        overflowY: "auto",    // 스크롤 가능
        },
      }}
    >
      <hr style={{ border: "1px solid #ccc", margin: "0 0 15px 0" }} />

      {/* 검색 영역 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
        <select
          style={{ padding: "5px 10px" }}
          onChange={(e) => setSelectedCollege(e.target.value)}
          value={selectedCollege}
        >
          <option value="">대학 선택</option>
          {Object.keys(collegeMap).map((college) => (
            <option key={college} value={college}>
              {college}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="학과명을 입력하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ flex: 1, padding: "5px 10px" }}
          />
          <button
            onClick={handleSearch}
            style={{
              background: "#4F75B0",
              color: "white",
              border: "none",
              padding: "5px 15px",
              cursor: "pointer",
            }}
          >
            학과코드 검색
          </button>
        </div>
      </div>

      {/* 검색 결과 테이블 */}
      <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>학과코드</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>학과명</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>단과대학명</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((item, i) => (
              <tr
                key={i}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setDeptName(item.dept);
                  setDeptCode(item.code);
                  onClose();
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF173")} // 노란색 hover
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.code}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px", color: "#2563eb", fontWeight: "bold" }}>
                  {item.dept}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.college}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};


const SaveModal = ({ open, onClose }) => {
  return (
    <Modal
      title="처리완료"
      open={open}
      footer={null}   // ✅ 기본 footer 제거
      onCancel={onClose}
      width={400}
      styles={{
        content: {
          border: "4px solid #4F75B0",
          borderRadius: "0px",
        },
      }}
    >
      {/* 날짜 */}
      <div style={{ padding: "10px 15px", borderTop: "1px solid #ddd" }}>
        <div style={{ textAlign: "right", fontSize: "12px", color: "#666" }}>
          [{new Date().toLocaleString("ko-KR")}]
        </div>
      </div>

      {/* 본문 */}
      <div style={{ border: "2px solid rgba(42, 42, 42, 0.5)", padding: "20px 15px" }}>
        <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.6" }}>
          수강신청이 완료되었습니다.<br />
          수강신청확인서를 확인하시기 바랍니다.
        </p>
      </div>

      {/* 확인 버튼 (가운데) */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Button type="primary" onClick={onClose}>
          확인
        </Button>
      </div>
    </Modal>
  );
};


export { DeptModal, SaveModal };