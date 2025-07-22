export const noticedata = [
  {
    id: 1,
    profile: "/image/profile.png",      // 프로필 이미지 경로
    name: "홍길동",
    date: "2025-07-22",
    check: 0,                            // 0이면 이미지, 1이면 본문
    imageUrl: "/image/notice1.jpg",    // 이미지 있을 때 경로
    content: "",                        // 본문 내용 (check=1일 때 사용)
    bookmarked: false                   // 북마크 상태
  },
  {
    id: 2,
    profile: "/image/profile2.png",
    name: "김철수",
    date: "2025-07-20",
    check: 1,
    imageUrl: "",
    content: "이번 학기 수강 신청 안내입니다.",
    bookmarked: true
  },
  {
    id: 3,
    profile: "/image/profile.png",
    name: "학사관리과",
    date: "2025-07-21",
    check: 0,
    imageUrl: "/image/notice2.jpg",
    content: "여름방학 안내입니다.",
    bookmarked: true
  },
  {
    id: 4,
    profile: "/image/profile2.png",
    name: "김철수",
    date: "2025-07-23",
    check: 1,
    imageUrl: "",
    content: "이번 학기 강의시간표 안내입니다.",
    bookmarked: true
  },
  {
    id: 5,
    profile: "/image/profile2.png",
    name: "김철수",
    date: "2025-07-23",
    check: 1,
    imageUrl: "",
    content: "이번 학기 강의시간표 안내입니다.",
    bookmarked: true
  },
];
