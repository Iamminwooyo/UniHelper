import "./Modal.css";
import { useState, useEffect } from "react";
import { courseData } from "../../Data/Enrolldata";
import { Modal,  Button, message } from "antd";

const modalConfig = {
  noticesubscribe: {
    title: "공지사항 구독",
    content: (name) => `${name}를 구독하시겠습니까?`,
    onOk: (name, onCancel) => {
      onCancel();
    },
  },
  noticeunsubscribe: {
    title: "구독 취소",
    content: (name) => `${name} 구독을 취소하시겠습니까?`,
    onOk: (name, onCancel) => {
      onCancel();
    },
  },
  notify: {
    title: "알림 설정",
    content: (name) => `${name}의 게시글 알림을 켜시겠습니까?`,
    onOk: (name, onCancel) => {
      message.success(`${name}의 게시글 알림을 설정했습니다.`);
      onCancel();
    },
  },
  unnotify: {
    title: "알림 해제",
    content: (name) => `${name}의 게시글 알림을 끄시겠습니까?`,
    onOk: (name, onCancel) => {
      message.success(`${name}의 게시글 알림을 껐습니다.`);
      onCancel();
    },
  },
  noticedelete: {
    title: "공지사항 삭제",
    content: () => `해당 공지사항을 삭제하시겠습니까?`,
    onOk: (name, onCancel) => {
      onCancel();
    },
  },
  tipsubscribe: {
    title: "Tip 저장",
    content: (title) => `"${title}" Tip을 저장하시겠습니까?`,
    onOk: (title, onCancel) => {
      onCancel();
    },
  },
  tipunsubscribe: {
    title: "저장 취소",
    content: (title) => `"${title}" Tip 저장을 취소하시겠습니까?`,
    onOk: (title, onCancel) => {
      onCancel();
    },
  },
  tipdelete: {
    title: "Tip 삭제",
    content: () => `해당 Tip을 삭제하시겠습니까?`,
    onOk: (name, onCancel) => {
      onCancel();
    },
  },
  commentdelete: {
    title: "댓글 삭제",
    content: () => `해당 댓글을 삭제하시겠습니까?`,
    onOk: (name, onCancel) => {
      onCancel();
    },
  },
  practicebasic: {
    title: "기본 수강신청",
    content: () => "기본 수강신청 연습을 시작하시겠습니까?",
    onOk: (name, onCancel) => {
      // 실제 실행 로직 (예: 페이지 이동, 상태 변경 등)
      console.log("기본 수강신청 시작!");
      onCancel();
    },
  },
  practicebasket: {
    title: "장바구니 수강신청",
    content: () => "장바구니 수강신청 연습을 시작하시겠습니까?",
    onOk: (name, onCancel) => {
      console.log("장바구니 수강신청 시작!");
      onCancel();
    },
  },
};

const TextModal = ({ open, onCancel, mode, name, title, onConfirm }) => {
  const config = modalConfig[mode] || {};
  const [missionCourses, setMissionCourses] = useState([]);

  // 고정 테스트 과목 3개
  const fixedCourses = courseData.filter((c) =>
    ["TST101", "TST102", "TST103"].includes(c.code)
  );

  // 랜덤으로 과목 뽑기 (고정 제외)
  const getRandomPracticeCourses = (count = 2) => {
    const shuffled = courseData
      .filter((c) => !["TST101", "TST102", "TST103"].includes(c.code)) // 테스트 3개 제외
      .sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    if (open && mode?.startsWith("practice")) {
      const randoms = getRandomPracticeCourses(2);
      setMissionCourses([...fixedCourses, ...randoms]); // 고정 + 랜덤
    }
  }, [open, mode]);

  const getContentParam = () => {
    if (mode.startsWith("tip")) return title;
    return name;
  };

  const handleSubmit = () => {
    if (mode?.startsWith("practice")) {
      sessionStorage.setItem("missionCourses", JSON.stringify(missionCourses));
    }

    if (onConfirm) {
      onConfirm();
    }

    if (config.onOk) {
      config.onOk(name, onCancel);
    } else {
      onCancel();
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
        <h2 className="custommodal_title">{config.title || ""}</h2>
        <div className="custommodal_text">{config.content ? config.content(getContentParam()) : ""}</div>
        {mode === "practicebasic" && (
          <>
            <p style={{ color: "white", marginTop: "10px" }}>
              아래 5개 과목을 찾아서 신청하세요
            </p>
            <div style={{ color: "white", lineHeight: "2" }}>
              {missionCourses.map((c) => (
                <div key={c.code}>
                  {c.name} - {c.code} ({c.department}) 
                </div>
              ))}
            </div>
            <p style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>
              모든 과목을 저장해야 연습이 종료됩니다.
            </p>
          </>
        )}

        {mode === "practicebasket" && (
          <>
            <p style={{ color: "white", marginTop: "10px" }}>
              장바구니에 있는 과목들을 신청하세요
            </p>
            <p style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>
              모든 과목을 저장해야 연습이 종료됩니다.
            </p>
          </>
        )}
      </section>

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


export default TextModal;
