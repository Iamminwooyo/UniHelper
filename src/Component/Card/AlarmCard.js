import "./Card.css";
import { Checkbox, Badge } from "antd";

const AlarmCard = ({ id, profile, noticeId, name, date, content, isRead, selected, onSelect, onOpen }) => {
  return (
    <section
      className="alarmcard_layout"
    >
      <div className="alarmcard_dot">
        <Badge status="success" color={isRead ? "#555" : "#78D900"} />
      </div>

      <div className="alarmcard_header">
        <div className="alarmcard_info">
          <img src={profile || "/image/profile.png"} alt="" className="alarmcard_img" />
          <div className="alarmcard_text">
            <p className="alarmcard_name">{name}</p>
            <p className="alarmcard_date">{date}</p>
          </div>
        </div>

        <div>
          <Checkbox
            className="alarmcard_checkbox" 
            checked={selected || false}   
            onChange={() => onSelect(id)}        
          />
        </div>
      </div>

      <div className="alarmcard_content" onClick={() => onOpen(noticeId)}>
        {content} <span>안내 공지가 등록되었습니다.</span>
      </div>
    </section>
  );
};

export default AlarmCard;
