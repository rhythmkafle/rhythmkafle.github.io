import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import About from './pages/About.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import Experience from './pages/Experience.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
