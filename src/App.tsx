import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ComingSoon from "./pages/ComingSoon";
import Admin from "./pages/Admin";
import { CurrencyProvider } from "./context/CurrencyContext";

import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";

function App() {
  if (typeof window !== "undefined" && (window.location.pathname.startsWith("/auth/callback") || window.location.pathname === "/auth/callback")) {
    return <AuthCallback />;
  }

  return (
    <CurrencyProvider>
      <BeeCursorProvider>
        <Router>
          <CustomBeeCursor />
          <ScrollToTop />
          <SessionGuardWatcher />
          <div className="flex flex-col min-h-screen relative font-sans text-foreground bg-[#FFF9E8]">
          <Routes>
            {/* 1. Admin Studio Portal */}
            <Route path="/admin/*" element={<Admin />} />

            {/* 2. SEO Playbook Blogs (Indexed by Google) */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />

            {/* 3. Production Launch Gate: Coming Soon Only (Until Client Handover) */}
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </div>
      </Router>
    </BeeCursorProvider>
  </CurrencyProvider>
  );
}

export default App;
