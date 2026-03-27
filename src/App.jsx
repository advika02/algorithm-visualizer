import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SortingPage from "./pages/SortingPage";
import BinarySearchPage from "./pages/BinarySearchPage";
import BFSPage from "./pages/BFSPage";
import DFSPage from "./pages/DFSPage";
import DijkstraPage from "./pages/DijkstraPage";
import ComingSoonPage from "./pages/ComingSoonPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Sorting */}
        <Route path="/sorting/:algorithm" element={<SortingPage />} />

        {/* Search */}
        <Route path="/search/binary" element={<BinarySearchPage />} />

        {/* Graph */}
        <Route path="/graph/bfs" element={<BFSPage />} />
        <Route path="/graph/dfs" element={<DFSPage />} />
        <Route path="/graph/dijkstra" element={<DijkstraPage />} />
        <Route path="/graph/:algo" element={<ComingSoonPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
