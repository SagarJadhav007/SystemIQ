import Diagram from "./components/Diagram";
import ChatPanel from "./components/ChatPanel";
import Topbar from "./components/Topbar";

export default function App() {
  return (
    <div className="h-screen flex flex-col">
      <Topbar />

      <div className="flex flex-1">
        <Diagram />
        <ChatPanel />
      </div>
    </div>
  );
}