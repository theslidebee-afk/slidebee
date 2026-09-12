import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Templates from "./pages/Templates";
import TemplateDetail from "./pages/TemplateDetail";
import Services from "./pages/Services";
import OrderNow from "./pages/OrderNow";
import Examples from "./pages/Examples";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import ComingSoon from "./pages/ComingSoon";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ThankYou from "./pages/ThankYou";
import Footer from "./components/Footer";
import StickyMobileCTA from "./components/StickyMobileCTA";
import CookieBanner from "./components/CookieBanner";
import { CurrencyProvider } from "./context/CurrencyContext";

function App() {
  return (
    <CurrencyProvider>
      <Router>
        <div className="flex flex-col min-h-screen relative font-sans text-foreground bg-[#FFF9E8]">
          <Routes>
            {/* 1. Public Default Landing View: Coming Soon */}
            <Route path="/" element={<ComingSoon />} />
            <Route path="/coming-soon" element={<ComingSoon />} />

            {/* 2. Admin Studio (no public Navbar or Footer) */}
            <Route path="/admin/*" element={<Admin />} />

            {/* 3. Full Platform Pages (with Navbar & Footer) */}
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/home" element={<Home />} />
                      <Route path="/templates" element={<Templates />} />
                      <Route path="/templates/:id" element={<TemplateDetail />} />
                      <Route path="/template/:id" element={<TemplateDetail />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/ordernow" element={<OrderNow />} />
                      <Route path="/order" element={<OrderNow />} />
                      <Route path="/examples" element={<Examples />} />
                      <Route path="/portfolio" element={<Examples />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/account" element={<Login />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:id" element={<BlogDetail />} />
                      <Route path="/media/blog" element={<Blog />} />
                      <Route path="/media/blog/:id" element={<BlogDetail />} />
                      <Route path="/videos" element={<Navigate to="/blog" replace />} />
                      <Route path="/media/videos" element={<Navigate to="/blog" replace />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/thank-you" element={<ThankYou />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                  <StickyMobileCTA />
                  <CookieBanner />
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </CurrencyProvider>
  );
}

export default App;
