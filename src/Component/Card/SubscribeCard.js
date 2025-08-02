import "./Card.css"; 

const SubscribeCard = ({ id, profile, name, date,  title, content, images, onClick, }) => {

  const firstImage = images && images.length > 0 ? images[0] : null;

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };
  

  return (
      <section className="subscribecard_layout" onClick={onClick}>

        <h4 className="subscribecard_title">{truncateText(title, 15)}</h4>

        {firstImage ? (
          <img src={firstImage} alt="공지 이미지" className="subscribecard_image" />
        ) : (
          <div className="subscribecard_content"> {truncateText(content, 100)}</div>
        )}

        <div className="subscribecard_info">
          <div className="subscribecard_profile">
              <img src={profile} alt="profile" className="subscribecard_profile_img" />
              <div className="subscribecard_text">
                  <p className="subscribecard_name">{name}</p>
                  <p className="subscribecard_date">{date}</p>
              </div>
          </div>
        </div>
      </section>
  );
};

export default SubscribeCard;
