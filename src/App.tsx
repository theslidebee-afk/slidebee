import { HashRouter as Router, Routes, Route } from "react-router-dom";
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
import Videos from "./pages/Videos";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Footer from "./components/Footer";
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

            {/* 2. Full Platform Pages (with Navbar & Footer) */}
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
                      <Route path="/videos" element={<Videos />} />
                      <Route path="/media/blog" element={<Blog />} />
                      <Route path="/media/videos" element={<Videos />} />
                      <Route path="/admin/*" element={<Admin />} />
                    </Routes>
                  </main>
                  <Footer />
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
