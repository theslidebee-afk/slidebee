import { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import { Loader2, LogOut, Upload, FileText, Video, Users } from "lucide-react";
import SlideBeeLogo from "../components/SlideBeeLogo";

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Dashboard State
  const [activeTab, setActiveTab] = useState("leads");
  
  // Data State
  const [leads, setLeads] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  // Blog Upload State
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImage, setBlogImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Fetch Leads
    const qLeads = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const unsubLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Blogs
    const qBlogs = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsubBlogs = onSnapshot(qBlogs, (snapshot) => {
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubLeads();
      unsubBlogs();
    };
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError("Invalid email or password.");
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogImage) return alert("Please select an image.");
    
    setIsUploading(true);
    try {
      // 1. Upload Image to Storage
      const storageRef = ref(storage, `blogs/${Date.now()}_${blogImage.name}`);
      const snapshot = await uploadBytes(storageRef, blogImage);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Save Document to Firestore
      await addDoc(collection(db, "blogs"), {
        title: blogTitle,
        content: blogContent,
        imageUrl: downloadURL,
        createdAt: serverTimestamp()
      });

      setBlogTitle("");
      setBlogContent("");
      setBlogImage(null);
      alert("Blog published successfully!");
    } catch (error) {
      console.error("Error publishing blog:", error);
      alert("Error publishing blog.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-center mb-8 flex flex-col items-center">
            <SlideBeeLogo size="lg" variant="light" className="mb-2" />
            <p className="text-muted-foreground mt-1 text-sm">Sign in to manage your leads & blog content</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all shadow-md">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-32">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-heading font-bold text-lg truncate">{user.email}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Administrator</p>
              </div>
              <div className="p-2 space-y-1">
                <button onClick={() => setActiveTab('leads')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'leads' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-foreground'}`}>
                  <Users size={18} /> Leads & Quotes
                </button>
                <button onClick={() => setActiveTab('blogs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'blogs' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-foreground'}`}>
                  <FileText size={18} /> Manage Blogs
                </button>
                <button onClick={() => setActiveTab('videos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'videos' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-foreground'}`}>
                  <Video size={18} /> Manage Videos
                </button>
              </div>
              <div className="p-4 border-t border-gray-100">
                <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-colors">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            {activeTab === 'leads' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-heading font-bold mb-6">Recent Leads</h2>
                <div className="space-y-4">
                  {leads.length === 0 ? (
                    <p className="text-muted-foreground">No leads yet.</p>
                  ) : (
                    leads.map(lead => (
                      <div key={lead.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg">{lead.name} <span className="text-sm font-normal text-muted-foreground">({lead.email})</span></h4>
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">{lead.service}</span>
                        </div>
                        {lead.company && <p className="text-sm text-gray-600 mb-3">🏢 {lead.company}</p>}
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg italic">"{lead.message}"</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'blogs' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Upload Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-2xl font-heading font-bold mb-6">Publish New Blog</h2>
                  <form onSubmit={handleBlogSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Blog Title</label>
                      <input type="text" required value={blogTitle} onChange={e => setBlogTitle(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Cover Image</label>
                      <input type="file" accept="image/*" required onChange={e => setBlogImage(e.target.files?.[0] || null)} className="w-full px-4 py-3 rounded-lg border file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Content (Markdown/Text)</label>
                      <textarea required rows={6} value={blogContent} onChange={e => setBlogContent(e.target.value)} className="w-full px-4 py-3 rounded-lg border focus:border-primary outline-none resize-none"></textarea>
                    </div>
                    <button type="submit" disabled={isUploading} className="bg-primary text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 disabled:opacity-70">
                      {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                      {isUploading ? "Uploading & Publishing..." : "Publish Blog"}
                    </button>
                  </form>
                </div>

                {/* Blog List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h3 className="text-xl font-heading font-bold mb-6">Published Blogs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {blogs.map(blog => (
                      <div key={blog.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <img src={blog.imageUrl} alt={blog.title} className="w-full h-48 object-cover" />
                        <div className="p-4">
                          <h4 className="font-bold mb-2 line-clamp-1">{blog.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2">{blog.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'videos' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-heading font-bold mb-2">Video Management</h2>
                <p className="text-muted-foreground">Video upload capabilities coming soon.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
