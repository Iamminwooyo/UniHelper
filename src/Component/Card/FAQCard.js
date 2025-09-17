import "./Card.css"; 
import { Collapse } from "antd";

const { Panel } = Collapse;

const FAQCard = ({ question, answer }) => {
  return (
    <div className="faqcard_layout">
      <Collapse accordion>
        <Panel 
          header={
            <div className="faqcard_header">
              <span className="faqcard_prefix">Q.</span>
              <span className="faqcard_question">{question}</span>
            </div>
          } 
          key="1"
        >
          <p>
            <span className="faqcard_answer_prefix">A.</span> {answer}
          </p>
        </Panel>
      </Collapse>
    </div>
  );
};

export default FAQCard;
