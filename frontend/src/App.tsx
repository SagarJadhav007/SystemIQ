import ChatPanel from "./components/ChatPanel";
import Diagram from "./components/Diagram";
import Topbar from "./components/Topbar";

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-gray-800">
          <Diagram />
        </div>
        <div className="w-1/2">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}

export default App;