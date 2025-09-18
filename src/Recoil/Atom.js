import { atom } from "recoil";

export const MenuState = atom({
  key: "currentMenuState",
  default: null,
});

export const userBriefState = atom({
  key: "userBriefState",
  default: {
    userId:"",
    username: "",
    student_number: "",
    department: "",
    roleType:"",
    profileImage: { url: "" },
  },
});

export const AlarmCountState = atom({
  key: "UnreadAlarmCountState",
  default: 0,
});