import "./User.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { AlarmCountState } from "../../Recoil/Atom";
import AlarmCard from "../../Component/Card/AlarmCard";
import { useNavigate } from "react-router-dom";
import { fetchAlarm, markAlarmsRead, deleteAlarms, fetchUnreadAlarmCount, fetchProfileImagePreview } from "../../API/UserAPI";
import TextModal from "../../Component/Modal/TextModal";
import { Checkbox, message } from "antd";

const UserAlarm = () => {
  const navigate = useNavigate();

  const [alarms, setAlarms] = useState([]);
  const [fetchingAlarm, setFetchingAlarm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const blockSize = 5;
  const currentBlock = Math.floor((currentPage - 1) / blockSize);
  const startPage = currentBlock * blockSize + 1;
  const endPage = Math.min(startPage + blockSize - 1, totalPages);

  const isFetchingRef = useRef(false);
  const imageCacheRef = useRef(new Map()); // ✅ Blob 캐시

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);

  const setUnreadCount = useSetRecoilState(AlarmCountState);

  // ✅ 알림 조회 함수 (프로필 이미지 Blob 처리 포함)
  const loadAlarms = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setFetchingAlarm(true);

    try {
      const data = await fetchAlarm({ page: currentPage, size: pageSize });

      const mapped = await Promise.all(
        (data.content || []).map(async (alarm) => {
          let profileUrl = "/image/profile.png"; // 기본 프로필

          // 프로필 Blob 처리
          const filename = alarm.authorProfileImageUrl;
          if (filename) {
            if (imageCacheRef.current.has(filename)) {
              profileUrl = imageCacheRef.current.get(filename);
            } else {
              try {
                const blob = await fetchProfileImagePreview(filename);
                const url = URL.createObjectURL(blob);
                imageCacheRef.current.set(filename, url);
                profileUrl = url;
              } catch (err) {
                console.warn("⚠️ 알림 프로필 이미지 로드 실패:", err);
              }
            }
          }

          return {
            id: alarm.notificationId,
            noticeId: alarm.noticeId,
            profile: profileUrl,
            name: alarm.authorName,
            department: alarm.department,
            date: alarm.createdAt,
            content: alarm.noticeTitle,
            isRead: alarm.read,
            selected: false,
          };
        })
      );

      setAlarms(mapped);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("❌ fetchAlarm 오류:", error);
      message.error("알림을 불러오는데 실패했습니다.");
    } finally {
      setFetchingAlarm(false);
      isFetchingRef.current = false;
    }
  }, [currentPage, pageSize]);

  // ✅ 렌더링 시 알림 불러오기
  useEffect(() => {
    loadAlarms();
  }, [loadAlarms]);

  // ✅ ObjectURL 메모리 정리
  useEffect(() => {
    return () => {
      for (const url of imageCacheRef.current.values()) {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      }
      imageCacheRef.current.clear();
    };
  }, []);

  // 카드 클릭 함수
  const handleOpen = async (noticeId, id) => {
    try {
      await markAlarmsRead([id]);
      navigate(`/notice/${noticeId}`);
    } catch (error) {
      message.error("읽음 처리 중 오류가 발생했습니다.");
    }
  };

  // 개별 선택 토글 함수
  const handleCheck = (id) => {
    setAlarms((prev) =>
      prev.map((alarm) =>
        alarm.id === id ? { ...alarm, selected: !alarm.selected } : alarm
      )
    );
  };

  // 전체 선택 토글 함수
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setAlarms((prev) => prev.map((alarm) => ({ ...alarm, selected: checked })));
  };

  // 읽음 처리 함수
  const handleMarkRead = () => {
    const selectedIds = alarms.filter((a) => a.selected).map((a) => a.id);
    if (selectedIds.length === 0) {
      message.error("읽음 처리할 알림을 선택해주세요.");
      return;
    }
    setModalMode("alarmread");
    setModalOpen(true);
  };

  // 삭제 처리 함수
  const handleDelete = () => {
    const selectedIds = alarms.filter((a) => a.selected).map((a) => a.id);
    if (selectedIds.length === 0) {
      message.error("삭제할 알림을 선택해주세요.");
      return;
    }
    setModalMode("alarmdelete");
    setModalOpen(true);
  };

  // 모달 확인 함수
  const handleConfirm = async () => {
    const selectedIds =
      modalMode === "alarmread"
        ? alarms.filter((a) => a.selected && !a.isRead).map((a) => a.id)
        : alarms.filter((a) => a.selected).map((a) => a.id);

    if (selectedIds.length === 0) {
      message.error(
        modalMode === "alarmread"
          ? "이미 처리된 알림입니다."
          : "삭제할 알림을 선택해주세요."
      );
      setModalOpen(false);
      return;
    }

    try {
      if (modalMode === "alarmread") {
        await markAlarmsRead(selectedIds);
        message.success("알림이 읽음 처리 되었습니다.");
      }

      if (modalMode === "alarmdelete") {
        await deleteAlarms(selectedIds);
        message.success("알림이 삭제되었습니다.");
      }

      await loadAlarms();

      const count = await fetchUnreadAlarmCount();
      setUnreadCount(count);

    } catch (error) {
      message.error("알림 처리 중 오류가 발생했습니다.");
    } finally {
      setModalOpen(false);
    }
  };


  return (
    <main className="user_layout">
      <section className="user_header">
        <h2 className="user_header_title">알림 목록</h2>
      </section>

      <section className="user_alarm_body">
        <div className="user_alarm_menu">
          <div className="user_alarm_check">
            <Checkbox
              className="user_alarm_checkbox"
              onChange={handleSelectAll}
              checked={alarms.length > 0 && alarms.every((a) => a.selected)}
              indeterminate={
                alarms.some((a) => a.selected) &&
                !alarms.every((a) => a.selected)
              }
            />
            <span className="user_alarm_check_text">전체선택</span>
          </div>
          <div className="user_alarm_button">
            <div className="user_alarm_read" onClick={handleMarkRead}>
              읽음
            </div>
            <div className="user_alarm_delete" onClick={handleDelete}>
              삭제
            </div>
          </div>
        </div>

        {fetchingAlarm ? (
          <div className="user_alarm_empty">불러오는 중...</div>
        ) : alarms.length === 0 ? (
          <div className="user_alarm_empty">알림이 존재하지 않습니다.</div>
        ) : (
          <>
            <div className="user_alarm">
              {alarms.map((alarm) => (
                <AlarmCard
                  key={alarm.id}
                  id={alarm.id}
                  profile={alarm.profile} 
                  noticeId={alarm.noticeId}
                  name={alarm.name}
                  department={alarm.department}
                  date={new Date(alarm.date).toISOString().split("T")[0]}
                  content={alarm.content}
                  isRead={alarm.isRead}
                  selected={alarm.selected}
                  onSelect={handleCheck}
                  onOpen={() => handleOpen(alarm.noticeId, alarm.id)}
                />
              ))}
            </div>

           {totalPages > 1 && (
              <div className="user_alarm_page_wrap" style={{ textAlign: "center", marginTop: "30px" }}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="user_alarm_page_button"
                >
                  &lt;
                </button>

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`user_alarm_page_button ${currentPage === pageNum ? "active" : ""}`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="user_alarm_page_button"
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <TextModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        mode={modalMode}
        name="알림"
        onConfirm={handleConfirm}
      />
    </main>
  );
};

export default UserAlarm;
