import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import TryOn from './pages/tryon/TryOn';
import ProductDetail from './pages/product/ProductDetail';
import Checkout from './pages/checkout/Checkout';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit"><Home /></motion.div>} />
        <Route path="/cabine" element={<motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit"><TryOn /></motion.div>} />
        <Route path="/produit" element={<motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit"><ProductDetail /></motion.div>} />
        <Route path="/paiement" element={<motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit"><Checkout /></motion.div>} />
        {/* Autres routes */}
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}