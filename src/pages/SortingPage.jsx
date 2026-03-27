import { useNavigate, useParams } from "react-router-dom";
import ArrayVisualizer from "../components/ArrayVisualizer";

export default function SortingPage() {
  const navigate = useNavigate();
  const { algorithm } = useParams();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(to bottom, #0B1F4A, #0f2a66)", fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: "hidden" }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <ArrayVisualizer initialAlgorithm={algorithm} onHome={() => navigate("/")} />
      </div>
    </div>
  );
}
