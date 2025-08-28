import { useEffect, useState } from "react";
import "./Tour.css";

const Tour = ({ steps, refs, open, onClose }) => {
  const [current, setCurrent] = useState(0);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!open) return;
    if (steps[current]?.target) {
      const el = refs[steps[current].target]?.current;
      if (el) {
        setRect(el.getBoundingClientRect());
      }
    }
  }, [open, current, steps, refs]);

  if (!open || !steps[current]) return null;

  return (
    <div className="tour">
      {/* 배경 */}
      <div className="tour-backdrop" onClick={onClose}></div>

      {/* 하이라이트 박스 */}
      {rect && (
        <div
          className="tour-highlight"
          style={{
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
          }}
        />
      )}

      {/* 설명 박스 */}
      <div
        className="tour-popup"
        style={{
          top: rect ? rect.bottom + window.scrollY + 10 : "50%",
          left: rect ? rect.left + window.scrollX : "50%",
        }}
      >
        <h3>{steps[current].title}</h3>
        <p>{steps[current].description}</p>

        <div className="tour-footer">
          <button
            onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
            disabled={current === 0}
          >
            이전
          </button>
          <span>
            {current + 1} / {steps.length}
          </span>
          <button
            onClick={() => {
              if (current === steps.length - 1) {
                onClose();
              } else {
                setCurrent((c) => c + 1);
              }
            }}
          >
            {current === steps.length - 1 ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tour;