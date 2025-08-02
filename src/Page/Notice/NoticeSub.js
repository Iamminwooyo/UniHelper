import "./Notice.css";
import Masonry from "react-masonry-css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../Component/Search/Search";
import SubscribeCard from "../../Component/Card/SubscribeCard";
import TextModal from "../../Component/Modal/TextModal";
import { noticedata } from "../../Data/Noticedata";
import { subscribedata } from "../../Data/Subscribedata";
import { IoBookmark } from "react-icons/io5";
import { FiBell, FiBellOff } from "react-icons/fi";

const NoticeSub = () => {
  const [keyword, setKeyword] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);

  const [subs, setSubs] = useState(subscribedata);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalMode, setModalMode] = useState("unsubscribe"); // notify, unnotify, unsubscribe

  const navigate = useNavigate();

  const handleOrgClick = (name) => {
    setSelectedOrg(prev => (prev === name ? null : name));
  };

  const handleCardClick = (id) => {
    navigate(`/notice/${id}`);
  };

  const openModal = (name, mode) => {
    setModalName(name);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    if (modalMode === "notify") {
      // 알림 켜기
      setSubs(prev =>
        prev.map(org =>
          org.name === modalName ? { ...org, notify: true } : org
        )
      );
    } else if (modalMode === "unnotify") {
      // 알림 끄기
      setSubs(prev =>
        prev.map(org =>
          org.name === modalName ? { ...org, notify: false } : org
        )
      );
    } else if (modalMode === "unsubscribe") {
      // 구독 취소 - 구독 목록에서 삭제 (필요하면)
      setSubs(prev => prev.filter(org => org.name !== modalName));
      // 구독 취소 후 선택 해제
      if (selectedOrg === modalName) setSelectedOrg(null);
    }
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <main className="subscribe_layout">
      <section className="subscribe_header">
        <h2 className="subscribe_header_title">구독 관리</h2>
        <SearchBar onSearchChange={setKeyword} />
      </section>
      <section className="subscribe_body">
        <div className="subscribe_text">
          <p className="subscribe_title">구독 목록</p>
          {subs.map((org) => (
            <div
              className={`subscribe_list ${selectedOrg === org.name ? "active" : ""}`}
              key={org.id}
              onClick={() => handleOrgClick(org.name)}
            >
              <div className="subscribe_profile">
                <img
                  src={org.profileimg}
                  alt={org.name}
                  className="subscribe_profile_img"
                />
                <p className="subscribe_name">{org.name}</p>
              </div>
              <div className="subscribe_icon">
                {org.notify ? (
                  <FiBell
                    style={{ cursor: "pointer", marginRight: 10 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(org.name, "unnotify"); 
                    }}
                  />
                ) : (
                  <FiBellOff
                    style={{ cursor: "pointer", marginRight: 10 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(org.name, "notify"); 
                    }}
                  />
                )}
                <IoBookmark
                  color="#78D900"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(org.name, "unsubscribe");
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <Masonry
          breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
          className="subscribe_post"
          columnClassName="subscribe_post_column"
        >
          {noticedata
            .filter(post =>
                (keyword === "" ||
                post.content.toLowerCase().includes(keyword.toLowerCase()) ||
                post.title.toLowerCase().includes(keyword.toLowerCase()) // 제목 추가
                ) &&
                (selectedOrg === null || post.name === selectedOrg)
            )
            .map(post => (
              <SubscribeCard
                key={post.id}
                title={post.title}
                profile={post.profile}
                name={post.name}
                date={post.date}
                check={post.check}
                images={post.imageUrls}
                content={post.content}
                bookmarked={post.bookmarked}
                onClick={() => handleCardClick(post.id)}
              />
            ))}
        </Masonry>
      </section>
      <TextModal
        open={isModalOpen}
        onCancel={closeModal}
        mode={modalMode}
        name={modalName}
        onOk={handleModalOk} // 모달 확인 시 상태 변경 함수 전달
      />
    </main>
  );
};

export default NoticeSub;
