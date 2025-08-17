import "./Card.css"; 

const SubscribeCard = ({ id, profile, name, updatedAt, createdAt,  title, content, images, onClick, }) => {

  const firstImage = images && images.length > 0 ? images[0] : null;

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.slice(0, 10);
  };
  

  return (
      <section className="subscribecard_layout">

        <h4 className="subscribecard_title">{truncateText(title, 10)}</h4>

        {firstImage ? (
          <img  onClick={onClick} src={firstImage} alt="공지 이미지" className="subscribecard_image" />
        ) : (
          <div  onClick={onClick} className="subscribecard_content"> {truncateText(content, 100)}</div>
        )}

        <div className="subscribecard_info">
          <div className="subscribecard_profile">
              <img src="/image/profile.png" alt="profile" className="subscribecard_profile_img" />
              <div className="subscribecard_text">
                  <p className="subscribecard_name">{name}</p>
                  <p className="subscribecard_date">
                    {updatedAt
                      ? `${formatDate(updatedAt)} (수정됨)`
                      : formatDate(createdAt)}
                  </p>
              </div>
          </div>
        </div>
      </section>
  );
};

export default SubscribeCard;
