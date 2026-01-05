import "./Layout.css";
import Header from "./Header";
import Side from "./Side";
import Main from "./Main";
import Footer from "./Footer";
import Login from "../../Page/Login/Login";
import Join from "../../Page/Join/Join";
import Notice from "../../Page/Notice/Notice";
import NoticeDetail from "../../Page/Notice/NoticeDetail";
import NoticeWrite from "../../Page/Notice/NoticeWrite";
import NoticeSub from "../../Page/Notice/NoticeSub";
import Tip from "../../Page/Tip/Tip";
import TipDetail from "../../Page/Tip/TipDetail";
import TipWrite from "../../Page/Tip/TipWrite";
import TipSub from "../../Page/Tip/TipSub";
import Enroll from "../../Page/Enroll/Enroll";
import EnrollPractice from "../../Page/Enroll/EnrollPractice";
import EnrollGuide from "../../Page/Enroll/EnrollGuide";
import User from "../../Page/User/User";
import UserAlarm from "../../Page/User/UserAlarm";
import AcademicFAQ from "../../Page/Academic/AcademicFAQ";
import AcademicChat from "../../Page/Academic/AcademicChat";
import AcademicManagement from "../../Page/Academic/AcademicManagement";

import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import Snowfall from 'react-snowfall';
import { useRecoilValue } from "recoil";
import { askingState } from "../../Recoil/Atom"; 
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const antIcon = (
  <LoadingOutlined style={{ fontSize: 48, color: "#78D900" }} spin />
);

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("accessToken");
  return token ? children : <Navigate to="/login" replace />;
};

const Layout = () => {
    const location = useLocation();
    const path = location.pathname;

    const isAsking = useRecoilValue(askingState);

    const [loading, setLoading] = useState(true);

    const isMobile = useMediaQuery({ maxWidth: 768 });
  

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800); // 원하는 로딩 시간 설정

        return () => clearTimeout(timer);
    }, [path]);

    if (loading) {
        return (
        <div className="layout_loading">
            <Spin indicator={antIcon} />
        </div>
        );
    }

    if (path === "/login") {
        return (
            <div className="layout_background">
                <Snowfall color="#ffffff" />
                <Login />
            </div>
        );
    }

    if (path === "/join") {
        return (
            <div className="layout_background">
                <Snowfall color="#ffffff" />
                <Join />
            </div>
        );
    }

    if (path === "/enroll") {
        if (isMobile) {
            return <Navigate to="/" replace />; 
        }
        return <Enroll />;
    }

    const isMain = path === "/";

    return(
        <div className="layout_background">
            {isAsking && <div className="global_overlay"></div>}
            <Snowfall color="#ffffff" 
            style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            top: 0,
            left: 0,
            zIndex: 1,
            pointerEvents: "none",
            }}/>
            <Header />
            <div className="layout_body">
                {!isMain &&  <Side />}
               <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/notice" element={<PrivateRoute><Notice /></PrivateRoute>} />
                    <Route path="/notice/:id" element={<PrivateRoute><NoticeDetail /></PrivateRoute>} />
                    <Route path="/notice/write" element={<PrivateRoute><NoticeWrite /></PrivateRoute>} />
                    <Route path="/notice/subscribe" element={<PrivateRoute><NoticeSub /></PrivateRoute>} />

                    <Route path="/tip" element={<PrivateRoute><Tip /></PrivateRoute>} />
                    <Route path="/tip/:id" element={<PrivateRoute><TipDetail /></PrivateRoute>} />
                    <Route path="/tip/write" element={<PrivateRoute><TipWrite /></PrivateRoute>} />
                    <Route path="/tip/subscribe" element={<PrivateRoute><TipSub /></PrivateRoute>} />

                    <Route
                    path="/enroll/practice"
                    element={
                        isMobile
                        ? <Navigate to="/" replace />
                        : <PrivateRoute><EnrollPractice /></PrivateRoute>
                    }
                    />
                    <Route
                    path="/enroll/guide"
                    element={
                        isMobile
                        ? <Navigate to="/" replace />
                        : <PrivateRoute><EnrollGuide /></PrivateRoute>
                    }
                    />

                    <Route path="/user" element={<PrivateRoute><User /></PrivateRoute>} />
                    <Route path="/user/alarm" element={<PrivateRoute><UserAlarm /></PrivateRoute>} />

                    <Route path="/academic/faq" element={<PrivateRoute><AcademicFAQ /></PrivateRoute>} />
                    <Route path="/academic/chat" element={<PrivateRoute><AcademicChat /></PrivateRoute>} />
                    <Route path="/academic/management" element={<PrivateRoute><AcademicManagement /></PrivateRoute>} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
}

export default Layout;