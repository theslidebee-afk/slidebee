import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ComingSoon from "./pages/ComingSoon";
import Admin from "./pages/Admin";
import { CurrencyProvider } from "./context/CurrencyContext";

function App() {
  return (
    <CurrencyProvider>
      <Router>
        <div className="flex flex-col min-h-screen relative font-sans text-foreground bg-[#FFF9E8]">
          <Routes>
            {/* 1. Admin Studio Portal */}
            <Route path="/admin/*" element={<Admin />} />

            {/* 2. Production Launch Gate: Coming Soon Only (Until Client Handover) */}
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </div>
      </Router>
    </CurrencyProvider>
  );
}

export default App;
