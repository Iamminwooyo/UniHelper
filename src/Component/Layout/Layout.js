import "./Layout.css";
import Header from "./Header";
import Side from "./Side";
import Main from "./Main";
import Footer from "./Footer";
import Login from "../../Page/Login/Login";
import Join from "../../Page/Join/Join";
import Notice from "../../Page/Notice/Notice";

import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { useRecoilValue } from "recoil";
import { MenuState } from "../../Recoil/Atom";

const antIcon = (
  <LoadingOutlined style={{ fontSize: 48, color: "#78D900" }} spin />
);
const pageComponents = {
  notice: Notice,
};

const Layout = () => {
    const location = useLocation();
    const path = location.pathname;

    const [loading, setLoading] = useState(true);

    const currentMenu = useRecoilValue(MenuState);

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

    const PageComponent = currentMenu ? pageComponents[currentMenu] : null;

    return(
        <div className="layout_background">
            <Header />
            <div className="layout_body">
                {PageComponent ? (
                <>
                    <Side />
                    <PageComponent />
                </>
                ) : (
                <Main />
                )}
            </div>
            <Footer />
        </div>
    );
}

export default Layout;