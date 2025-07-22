import "./Notice.css";
import Masonry from "react-masonry-css";
import { useState } from "react";
import { Cascader, Tag } from "antd";
import SearchBar from "../../Component/Search/Search";
import NoticeCard from "../../Component/Card/NoticeCard";
import { noticedata } from "../../Data/Noticedata";

const options = [
  {
    value: "status",
    label: "상태",
    children: [
      { value: "processing", label: "processing" },
      { value: "success", label: "success" },
      { value: "error", label: "error" },
      { value: "warning", label: "warning" },
    ],
  },
  {
    value: "color",
    label: "색상",
    children: [
      { value: "magenta", label: "magenta" },
      { value: "red", label: "red" },
      { value: "volcano", label: "volcano" },
      { value: "orange", label: "orange" },
      { value: "gold", label: "gold" },
      { value: "lime", label: "lime" },
      { value: "green", label: "green" },
      { value: "cyan", label: "cyan" },
      { value: "blue", label: "blue" },
      { value: "geekblue", label: "geekblue" },
      { value: "purple", label: "purple" },
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
            />
            
            <div className="notice_fillter_group">
                {selectedTags.map((tag) => (
                    <Tag
                    key={tag}
                    closable
                    onClose={() => handleTagClose(tag)}
                    color={tagColors[tag]}
                    closeIcon={
                    <span
                        style={{
                        position: "absolute",
                        top: -3,
                        right: 3,
                        fontWeight: "400",
                        fontSize: 15,
                        lineHeight: 1,
                        color: "#000",
                        cursor: "pointer",
                        userSelect: "none",
                        }}
                    >
                        x
                    </span>
                    }
                    >
                    {tag}
                    </Tag>
                ))}
            </div>
        </div>
        <Masonry
          breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
          className="notice_post"
          columnClassName="notice_post_column"
        >
          {noticedata.map((post) => (
            <NoticeCard
              key={post.id}
              profile={post.profile}
              name={post.name}
              date={post.date}
              check={post.check}
              image={post.imageUrl}
              content={post.content}
              bookmarked={post.bookmarked}
            />
          ))}
        </Masonry>
      </section>
    </main>
  );
};

export default Notice;
