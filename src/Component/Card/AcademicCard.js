// AcademicCard.js
import "./Card.css";

const AcademicCard = ({ index, name, date, downloadUrl }) => {
  return (
    <section className="academiccard_layout">
      <p className="academiccard_name">
        <span className="academiccard_index">{index + 1}. </span>
        {downloadUrl ? (
          <a
            href={downloadUrl}
            download
            className="academiccard_link"
            onClick={(e) => e.stopPropagation()} // 상위 이벤트 막기
          >
            {name}
          </a>
        ) : (
          name
        )}
      </p>
      <span className="academiccard_date">{date}</span>
    </section>
  );
};

export default AcademicCard;
