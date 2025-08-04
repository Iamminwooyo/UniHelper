import "./Notice.css";
import Masonry from "react-masonry-css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cascader, Tag } from "antd";
import SearchBar from "../../Component/Search/Search";
import NoticeCard from "../../Component/Card/NoticeCard";
import NoticeModal from "../../Component/Modal/NoticeModal";
import { noticedata } from "../../Data/Noticedata";
import { usersdata } from "../../Data/Userdata";
import { TbEdit } from "react-icons/tb";
import { IoClose } from "react-icons/io5";

const options = [
  {
    value: "대학 본부",
    label: "대학 본부",
    children: [
      {
        value: "총장 비서실",
        label: "총장 비서실",
      },
      {
        value: "감사실",
        label: "감사실",
      },
      {
        value: "부총장실",
        label: "부총장실",
      },
      {
        value: "기획처",
        label: "기획처",
        children: [
          { value: "기획예산과", label: "기획예산과" },
          { value: "대외협력실", label: "대외협력실" },
          { value: "평가성과분석센터", label: "평가성과분석센터" },
          { value: "혁신사업추진단", label: "혁신사업추진단" },
        ],
      },
      {
        value: "교무처",
        label: "교무처",
        children: [
          { value: "교무지원과", label: "교무지원과" },
          { value: "학사관리과", label: "학사관리과" },
          { value: "교직과", label: "교직과" },
        ],
      },
      {
        value: "교육혁신처",
        label: "교육혁신처",
        children: [
          { value: "교수학습지원센터", label: "교수학습지원센터" },
          { value: "원격교육지원센터", label: "원격교육지원센터" },
          { value: "취창업지원센터", label: "취창업지원센터" },
          { value: "학생생활상담센터", label: "학생생활상담센터" },
        ],
      },
      {
        value: "학생처",
        label: "학생처",
        children: [
          { value: "학생지원과", label: "학생지원과" },
          { value: "장학과", label: "장학과" },
          { value: "장애학생지원센터", label: "장애학생지원센터" },
        ],
      },
      {
        value: "사무처",
        label: "사무처",
        children: [
          { value: "총무지원과", label: "총무지원과" },
          { value: "회계과", label: "회계과" },
          { value: "안전관리과", label: "안전관리과" },
          { value: "비상계획과", label: "비상계획과" },
        ],
      },
      {
        value: "국제교류교육원",
        label: "국제교류교육원",
        children: [
          { value: "국제교류교육과", label: "국제교류교육과" },
          { value: "한국어학당", label: "한국어학당" },
        ],
      },
      {
        value: "입학관리실",
        label: "입학관리실",
      },
      {
        value: "기관생명윤리위원회",
        label: "기관생명윤리위원회",
      },
    ],
  },
  {
    value: "부속기관",
    label: "부속기관",
    children: [
      {
        value: "중앙도서관",
        label: "중앙도서관",
        children: [
          { value: "학술정보지원과", label: "학술정보지원과" },
          { value: "학술정보열람과", label: "학술정보열람과" },
        ],
      },
      { value: "생활관", label: "생활관" },
      { value: "체육지원실", label: "체육지원실" },
      { value: "신문방송국", label: "신문방송국" },
      { value: "박물관", label: "박물관" },
      { value: "산학협력단", label: "산학협력단" },
      { value: "스포츠-웰니스연구센터", label: "스포츠-웰니스연구센터" },
      { value: "정보관리실", label: "정보관리실" },
      { value: "예비군대대", label: "예비군대대" },
      { value: "글로벌사회공헌원", label: "글로벌사회공헌원" },
      {
        value: "단과대학 교학과",
        label: "단과대학 교학과",
        children: [
          { value: "무도대 교학과", label: "무도대 교학과" },
          { value: "체육과학대학 교학과", label: "체육과학대학 교학과" },
          { value: "문화예술대학 교학과", label: "문화예술대학 교학과" },
          { value: "인문사회융합대학 교학과", label: "인문사회융합대학 교학과" },
          { value: "AI바이오융합대학 교학과", label: "AI바이오융합대학 교학과" },
          { value: "용오름대학 교양지원과", label: "용오름대학 교양지원과" },
        ],
      },
      {
        value: "대학원 교학과",
        label: "대학원 교학과",
        children: [
          { value: "대학원교학과", label: "대학원교학과" },
          { value: "스포츠과학대학원 교학과", label: "스포츠과학대학원 교학과" },
          { value: "경영대학원 교학과", label: "경영대학원 교학과" },
          { value: "교육대학원 교학과", label: "교육대학원 교학과" },
          { value: "문화예술대학원 교학과", label: "문화예술대학원 교학과" },
          { value: "재활복지대학원 교학과", label: "재활복지대학원 교학과" },
          { value: "태권도대학원 교학과", label: "태권도대학원 교학과" },
        ],
      },
    ],
  },
  {
    value: "학생회",
    label: "학생회",
    children: [
      { value: "총학생회", label: "총학생회" },
      {
        value: "무도대학 학생회",
        label: "무도대학 학생회",
        children: [
          { value: "유도학과 학생회", label: "유도학과 학생회" },
          { value: "유도경기지도학과 학생회", label: "유도경기지도학과 학생회" },
          { value: "무도학과 학생회", label: "무도학과 학생회" },
          { value: "태권도학과 학생회", label: "태권도학과 학생회" },
          { value: "경호학과 학생회", label: "경호학과 학생회" },
        ],
      },
      {
        value: "체육과학대학 학생회",
        label: "체육과학대학 학생회",
        children: [
          { value: "스포츠레저학과 학생회", label: "스포츠레저학과 학생회" },
          { value: "체육학과 학생회", label: "체육학과 학생회" },
          { value: "골프학부 학생회", label: "골프학부 학생회" },
          { value: "특수체육교육과 학생회", label: "특수체육교육과 학생회" },
        ],
      },
      {
        value: "문화예술대학 학생회",
        label: "문화예술대학 학생회",
        children: [
          { value: "무용과 학생회", label: "무용과 학생회" },
          { value: "미디어디자인학과 학생회", label: "미디어디자인학과 학생회" },
          { value: "회화학과 학생회", label: "회화학과 학생회" },
          { value: "연극학과 학생회", label: "연극학과 학생회" },
          { value: "국악과 학생회", label: "국악과 학생회" },
          { value: "영화영상학과 학생회", label: "영화영상학과 학생회" },
          { value: "문화유산학과 학생회", label: "문화유산학과 학생회" },
          { value: "문화콘텐츠학과 학생회", label: "문화콘텐츠학과 학생회" },
          { value: "실용음악과 학생회", label: "실용음악과 학생회" },
        ],
      },
      {
        value: "인문사회융합대학 학생회",
        label: "인문사회융합대학 학생회",
        children: [
          { value: "경영학과 학생회", label: "경영학과 학생회" },
          { value: "관광경영학과 학생회", label: "관광경영학과 학생회" },
          { value: "경찰행정학과 학생회", label: "경찰행정학과 학생회" },
          { value: "중국학과 학생회", label: "중국학과 학생회" },
          { value: "사회복지학과 학생회", label: "사회복지학과 학생회" },
        ],
      },
      {
        value: "AI바이오융합대학 학생회",
        label: "AI바이오융합대학 학생회",
        children: [
          { value: "보건환경안전학과 학생회", label: "보건환경안전학과 학생회" },
          { value: "바이오생명공학과 학생회", label: "바이오생명공학과 학생회" },
          { value: "물리치료학과 학생회", label: "물리치료학과 학생회" },
          { value: "식품조리학부 학생회", label: "식품조리학부 학생회" },
          { value: "AI융합학부 학생회", label: "AI융합학부 학생회" },
        ],
      },
    ],
  },
];



const tagColorsPool = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
];

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * tagColorsPool.length);
  return tagColorsPool[randomIndex];
};

const Notice = () => {
  const [keyword, setKeyword] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagColors, setTagColors] = useState({}); // { tagStr: color }
  const [cascaderValue, setCascaderValue] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const currentUser = usersdata[1];

  const onFilterChange = (value) => {
    const tagStr = value[value.length - 1];
    if (!selectedTags.includes(tagStr)) {
      setSelectedTags((prev) => [...prev, tagStr]);
      setTagColors((prev) => ({
        ...prev,
        [tagStr]: getRandomColor(),
      }));
    }
    setCascaderValue([]);
  };

  const handleTagClose = (removedTag) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== removedTag));
    setTagColors((prev) => {
      const newColors = { ...prev };
      delete newColors[removedTag];
      return newColors;
    });
  };

  const handleCardClick = (id) => {
    navigate(`/notice/${id}`);
  };

  // 모달 닫기 함수
  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  // 모달 제출 함수 (예시)
  const handleModalSubmit = async (data) => {
    // data = { title, content, imageUrl, attachments }
    // TODO: 실제 API 호출 코드 작성 필요
    console.log("모달 제출 데이터:", data);

  
    setIsModalOpen(false);

    // 작성 후 리스트 리프레시 등 필요한 작업 추가
  };

  // 카드 필터링 함수
  const filteredNotices = noticedata.filter(post => {
    const matchesKeyword =
      keyword === "" ||
      post.content.toLowerCase().includes(keyword.toLowerCase()) ||
      post.title.toLowerCase().includes(keyword.toLowerCase());

    const matchesFilter =
      selectedTags.length === 0 || selectedTags.includes(post.name);

    return matchesKeyword && matchesFilter;
  });


  return (
    <main className="notice_layout">
      <section className="notice_header">
        <h2 className="notice_header_title">공지사항</h2>
        <SearchBar onSearchChange={setKeyword} />
      </section>
      <section className="notice_body">
        <div className="notice_fillter">
            <Cascader
            options={options}
            onChange={onFilterChange}
            placeholder="필터"
            changeOnSelect={false}
            value={cascaderValue}
            className="notice_filter_select"
            dropdownClassName="notice_filter_dropdown" 
            />
            
            <div className="notice_fillter_group">
                {selectedTags.map((tag) => (
                    <Tag
                    key={tag}
                    closable
                    onClose={() => handleTagClose(tag)}
                    color={tagColors[tag]}
                    closeIcon={
                      <IoClose
                        style={{
                          position: "absolute",
                          top: -1,
                          right: 0,
                          fontSize: 16,
                          color: "#000000",
                          opacity: 0.5,
                          cursor: "pointer",
                        }}
                      />
                    }
                    >
                    {tag}
                    </Tag>
                ))}
            </div>
            {(currentUser?.role === 2 || currentUser?.role === 3) && (
              <TbEdit
                className="notice_write_icon"
                onClick={() => setIsModalOpen(true)} 
              />
            )}
        </div>
         {filteredNotices.length === 0 ? (
            <div className="notice_empty">
              공지사항이 존재하지 않습니다.
            </div>
          ) : (
            <Masonry
              breakpointCols={{ default: 3, 768: 2 }}
              className="notice_post"
              columnClassName="notice_post_column"
            >
              {filteredNotices.map(post => (
                <NoticeCard
                  key={post.id}
                  title={post.title} 
                  profile={post.profile}
                  name={post.name}
                  date={post.date}
                  check={post.check}
                  images={post.imageUrls}
                  content={post.content}
                  bookmarked={post.bookmarked}
                  currentUserRole={currentUser?.role} 
                  onClick={() => handleCardClick(post.id)}
                />
              ))}
            </Masonry>
          )}
      </section>
      {isModalOpen && (
        <NoticeModal
          open={isModalOpen}
          onCancel={handleModalCancel}
          onSubmit={handleModalSubmit}
          mode="create"
        />
      )}
    </main>
  );
};

export default Notice;
