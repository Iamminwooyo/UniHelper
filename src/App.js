import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from "react";
import axios from "axios";
import { RecoilRoot } from 'recoil';
import Layout from './Component/Layout/Layout';

function App() {
  // 액세스 토큰 재발급 API
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const accessToken = sessionStorage.getItem("accessToken");
        const refreshToken = sessionStorage.getItem("refreshToken");

        if (accessToken && refreshToken) {
          await axios.post("/auth/reissue", { accessToken, refreshToken });
          console.log("토큰 갱신 완료");
        }
      } catch (err) {
        console.error("주기적 토큰 갱신 실패", err);
      }
    }, 9 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <RecoilRoot>
        <Router>
          <div className="App">
            <Layout />
          </div>
        </Router>
    </RecoilRoot>
  );
}

export default App;
