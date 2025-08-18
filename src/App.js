import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from "react";
import { RecoilRoot } from 'recoil';
import Layout from './Component/Layout/Layout';
import { reissueToken } from './API/AccountAPI'; 

function App() {

  // 액세스 토큰 재발급 함수
  useEffect(() => {
    const interval = setInterval(async () => {
        try {
          const accessToken = sessionStorage.getItem("accessToken");
          const refreshToken = sessionStorage.getItem("refreshToken");

          if (accessToken && refreshToken) {
            const data = await reissueToken(accessToken, refreshToken);

            if (data?.accessToken) {
              sessionStorage.setItem("accessToken", data.accessToken);
            }
            if (data?.refreshToken) {
              sessionStorage.setItem("refreshToken", data.refreshToken);
            }

            console.log("토큰 갱신 완료");
          }
        } catch (err) {
          console.error("주기적 토큰 갱신 실패", err);
        }
      }, 50 * 60 * 1000);

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
