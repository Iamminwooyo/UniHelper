import "./Layout.css";
import Header from "./Header";
import Side from "./Side";
import Main from "./Main";
import Footer from "./Footer";
import Login from "../../Page/Login/Login";
import Join from "../../Page/Join/Join";

import { useLocation } from "react-router-dom";
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
        setLoading(true); // 경로 바뀔 때마다 로딩 초기화
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

    return(
        <div className="layout_background">
            <Header/>
            <div className="layout_body">
                <Side/>
                <Main/>
            </div>
            <Footer/>
        </div>
    );
}

export default Layout;