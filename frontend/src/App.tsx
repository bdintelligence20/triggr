import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TriggrHubApp from './components/TriggrHubApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<TriggrHubApp />} />
      </Routes>
    </Router>
  );
}

export default App;