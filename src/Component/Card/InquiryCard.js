import "./Card.css";
import { MdDeleteOutline } from "react-icons/md";

const InquiryCard = ({ name, department, date, title, content, onDelete, onClick }) => {
  return (
    <section className="inquirycard_layout">
        <div className="inquirycard_header">
            <span className="inquirycard_title">{title}</span>
            <MdDeleteOutline className="inquirycard_icon" onClick={onDelete} />
        </div>

        <hr className="inquirycard_divider" onClick={onClick} />

        <div className="inquirycard_info">
            <img className="inquirycard_profile_img" src="/image/profile.png" alt=""/>
            <div className="inquirycard_text">
                <p className="inquirycard_name">{name} ({department})</p>
                <p className="inquirycard_date">{date}</p>
            </div>
        </div>
        <div className="inquirycard_content">{content}</div>
    </section>
  );
};

export default InquiryCard;
