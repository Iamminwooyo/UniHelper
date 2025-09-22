import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import AppContent from './AppContent';

function App() {
  return (
    <RecoilRoot>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </RecoilRoot>
  );
}

export default App;
