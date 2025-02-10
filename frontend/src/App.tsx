// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TriggrHubApp from './components/TriggrHubApp';
import TestChat from './components/TestChat/index';
;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/test-chat" element={<TestChat />} />
        <Route path="/*" element={<TriggrHubApp />} />
      </Routes>
    </Router>
  );
}

export default App;