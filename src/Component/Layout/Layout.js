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

import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const antIcon = (
  <LoadingOutlined style={{ fontSize: 48, color: "#78D900" }} spin />
);

const Layout = () => {
    const location = useLocation();
    const path = location.pathname;

    const [loading, setLoading] = useState(true);
  

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
                <Login />
            </div>
        );
    }

    if (path === "/join") {
        return (
            <div className="layout_background">
                <Join />
            </div>
        );
    }

    const isMain = path === "/";

    return(
        <div className="layout_background">
            <Header />
            <div className="layout_body">
                {!isMain &&  <Side />}
               <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/notice" element={<Notice />} />
                    <Route path="/notice/:id" element={<NoticeDetail />} />
                    <Route path="/notice/write" element={<NoticeWrite />} />
                    <Route path="/notice/subscribe" element={<NoticeSub />} />
                    <Route path="/tip" element={<Tip />} />
                    <Route path="/tip/:id" element={<TipDetail />} />
                    <Route path="/tip/write" element={<TipWrite />} />
                    <Route path="/tip/subscribe" element={<TipSub />} />
                  
                    <Route path="*" element={<Main />} />
                </Routes>
            </div>
            <Footer />
        </div>
    );
}

export default Layout;