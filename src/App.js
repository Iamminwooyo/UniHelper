import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import Layout from './Component/Layout/Layout';

function App() {
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
