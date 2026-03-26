import ChatPanel from "./components/ChatPanel";
import Diagram from "./components/Diagram";

function App() {
  return (
    <div className="h-screen flex">
      <div className="w-1/2 border-r">
        <Diagram />
      </div>

      <div className="w-1/2">
        <ChatPanel />
      </div>
    </div>
  );
}

export default App;