import { useNavigate } from "react-router-dom";
import ArrayVisualizer from "../components/ArrayVisualizer";

export default function BinarySearchPage() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper" style={{ background: "linear-gradient(to bottom, #0B1F4A, #0f2a66)", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <ArrayVisualizer initialAlgorithm="binary" onHome={() => navigate("/")} />
      </div>
    </div>
  );
}
