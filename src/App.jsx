import { BrowserRouter, Routes, Route } from "react-router-dom";
import GreenhouseDashboard from "./pages/GreenhouseDashboard";
import HistoryPage from "./pages/HistoryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GreenhouseDashboard />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
