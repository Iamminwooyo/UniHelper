import "./Modal.css";
import { useState } from "react";
import { Modal, Select, Button, message } from "antd";
import { grades, categories, days, timePeriods, departments, basicdepartments, liberalArtsAreas, credits  } from "../../Data/TimeTabledata";

const { Option } = Select;

const TimetableModal = ({ open, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    grade: "",
    category: "",
    department: "",
    day: "",
    timePeriod: "",
    credit: "",
  });

  const handleSubmit = () => {
  const { category, department, liberalArea } = formData;

  if (!category) {
    message.error("과목 구분을 선택해주세요.");
    return;
  }

  if (
    (category === "전공" || category === "기초전공") &&
    !department
  ) {
    message.error("학과를 선택해주세요.");
    return;
  }

  if (category === "교양선택" && !liberalArea) {
    message.error("교양 영역을 선택해주세요.");
    return;
  }

  // 성공 시 onSuccess 호출
  if (onSuccess) onSuccess(formData);
  onCancel();
};

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      closable={false}
      maskClosable={true}
      wrapClassName="custommodal_wrap"
    >
      <section className="custommodal_layout">
        <h2 className="custommodal_title">시간표 추천</h2>

        {/* 구분 */}
        <div className="custommodal_input_group" style={{ marginTop: 16 }}>
          <p className="custommodal_input_label">과목 구분 <span style={{color: '#78D900', marginLeft:'3px', display:'flex', alignItems:'center'}}>* </span></p>
          <Select
            placeholder="과목 구분"
            value={formData.category || undefined}
            onChange={(v) =>
              setFormData({
                ...formData,
                category: v,
                department: "", // 카테고리 바뀌면 학과 초기화
              })
            }
            style={{ width: "100%" }}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
          >
            {categories.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </div>

        {/* 학년 */}
        {(formData.category === "전공") && (
          <div className="custommodal_input_group" style={{ marginTop: 16 }}>
            <p className="custommodal_input_label">학년</p>
            <Select
              placeholder="학년"
              value={formData.grade || undefined}
              onChange={(v) => setFormData({ ...formData, grade: v })}
              style={{ width: "100%" }}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
            >
              {grades.map((g) => (
                <Option key={g} value={g}>
                  {g}
                </Option>
              ))}
            </Select>
          </div>
        )}

        {formData.category === "교양선택" && (
        <div className="custommodal_input_group" style={{ marginTop: 16 }}>
            <p className="custommodal_input_label">교양 영역 <span style={{color: '#78D900', marginLeft:'3px', display:'flex', alignItems:'center'}}>* </span></p>
            <Select
            placeholder="교양 영역"
            value={formData.liberalArea || undefined}
            onChange={(v) => setFormData({ ...formData, liberalArea: v })}
            style={{ width: "100%" }}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            >
            {liberalArtsAreas.map((area) => (
                <Option key={area} value={area}>
                {area}
                </Option>
            ))}
            </Select>
        </div>
        )}

        {/* 학과 (전공/기초전공일 때만 표시) */}
        {(formData.category === "전공" || formData.category === "기초전공") && (
          <div className="custommodal_input_group" style={{ marginTop: 16 }}>
            <p className="custommodal_input_label">학과<span style={{color: '#78D900', marginLeft:'3px', display:'flex', alignItems:'center'}}>* </span></p>
            <Select
              placeholder="학과"
              value={formData.department || undefined}
              onChange={(v) => setFormData({ ...formData, department: v })}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="children"
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
            >
              {(formData.category === "기초전공" ? basicdepartments : departments).map((dep) => (
                <Option key={dep} value={dep}>
                  {dep}
                </Option>
              ))}
            </Select>
          </div>
        )}

        {/* 학점 */}
        <div className="custommodal_input_group" style={{ marginTop: 16 }}>
          <p className="custommodal_input_label">학점</p>
          <Select
            placeholder="학점"
            value={formData.credit || undefined}
            onChange={(v) => setFormData({ ...formData, credit: v })}
            style={{ width: "100%" }}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
          >
            {credits.map((c) => (
              <Option key={c} value={c}>
                {c}학점
              </Option>
            ))}
          </Select>
        </div>

        {/* 요일 */}
        <div className="custommodal_input_group" style={{ marginTop: 16 }}>
          <p className="custommodal_input_label">요일</p>
          <Select
            placeholder="요일"
            value={formData.day || undefined}
            onChange={(v) => setFormData({ ...formData, day: v })}
            style={{ width: "100%" }}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
          >
            {days.map((d) => (
              <Option key={d} value={d}>
                {d}
              </Option>
            ))}
          </Select>
        </div>

        {/* 시간대 */}
        <div className="custommodal_input_group" style={{ marginTop: 16 }}>
          <p className="custommodal_input_label">시간대</p>
          <Select
            placeholder="시간대"
            value={formData.timePeriod || undefined}
            onChange={(v) => setFormData({ ...formData, timePeriod: v })}
            style={{ width: "100%" }}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
          >
            {timePeriods.map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Select>
        </div>
      </section>

      {/* 버튼 영역 */}
      <section className="custommodal_footer">
        <Button
          type="primary"
          className="custommodal_button_ok"
          onClick={handleSubmit}
        >
          추천
        </Button>
        <Button className="custommodal_button_cancle" onClick={onCancel}>
          취소
        </Button>
      </section>
    </Modal>
  );
};

export default TimetableModal;
