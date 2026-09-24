import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Stage from "./stage/Stage";
import { SmoothScroll } from "./motion/SmoothScroll";
import { Cursor } from "./components/Cursor";

const WorkPage = lazy(() => import("./pages/WorkPage"));
const ResearchPage = lazy(() => import("./pages/ResearchPage"));
const Studio = lazy(() => import("./studio/Studio"));

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <Cursor />
        <Suspense fallback={<div className="route-fallback" aria-live="polite">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Stage />} />
            <Route path="/work/:slug" element={<WorkPage />} />
            <Route path="/research/:slug" element={<ResearchPage />} />
            <Route path="/studio/*" element={<Studio />} />
            <Route path="/admin" element={<Navigate to="/studio" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </SmoothScroll>
    </BrowserRouter>
  );
}
