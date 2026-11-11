import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// The home page ships with the app; every other page's code downloads only
// when a visitor opens it, so the first load stays small.
const OurCompany = lazy(() => import("./pages/OurCompany"));
const Events = lazy(() => import("./pages/Events"));
const UpcomingEvents = lazy(() => import("./pages/UpcomingEvents"));
const BookStore = lazy(() => import("./pages/BookStore"));
const BookDetails = lazy(() => import("./pages/BookDetails"));
const BookPublishing = lazy(() => import("./pages/BookPublishing"));
const Contacts = lazy(() => import("./pages/Contacts"));
const HRDepartment = lazy(() => import("./pages/HRDepartment"));
const Careers = lazy(() => import("./pages/Careers"));
const Conference = lazy(() => import("./pages/Conference"));

function App() {
  return (
    <>
      <Navbar />
      {/* While a page's code arrives, hold its space so the footer does not
          jump up under the navbar. */}
      <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/our-company" element={<OurCompany />} />
          <Route path="/events" element={<Events />} />
          <Route path="/upcoming-events/:eventId" element={<UpcomingEvents />} />
          <Route path="/book-store" element={<BookStore />} />
          <Route path="/books/:slug" element={<BookDetails />} />
          <Route path="/book-publishing" element={<BookPublishing />} />
          <Route path="/contact" element={<Contacts />} />
          <Route path="/hr-department" element={<HRDepartment />} />
          <Route path="/hr" element={<HRDepartment />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/conferences/:confname" element={<Conference />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

export default App;
