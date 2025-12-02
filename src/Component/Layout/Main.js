import "./Layout.css";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

const Main = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <section className="main_layout">
      <div className="main_row">
        <div 
          className="main_box card_info" 
          onClick={() => navigate("/academic/chat")}
        >
          <h3>학사정보</h3>
          <p>학사정보 관련 챗봇으로, 학사정보에 관한 내용을 물어보고 답변 받을 수 있습니다.</p>
        </div>

       {!isMobile && (
          <div
            className="main_box"
            style={{ "--hover-img": "url(/image/수강신청연습.jpg)" }}
            onClick={() => navigate("/enroll/practice")}
          >
            <h3>수강신청 연습</h3>
            <p>실제 수강신청과 비슷한 환경에서 수강신청을 연습할 수 있습니다.</p>
          </div>
        )}
      </div>

      <div className="main_row">
        <div 
          className="main_box card_tip" 
          onClick={() => navigate("/tip")}
        >
          <h3>Tip 게시판</h3>
          <p>학우들의 대학생활 꿀팁 같은 정보들을 찾아볼 수 있습니다.</p>
        </div>

        <div 
          className="main_box card_notice" 
          onClick={() => navigate("/notice")}
        >
          <h3>공지사항</h3>
          <p>학교, 혹은 학과내의 공지사항을 찾아볼 수 있습니다.</p>
        </div>
      </div>
    </section>
  );
};

export default Main;
