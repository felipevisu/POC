import { useState } from "react";
import useWebSocket from "../hooks/useWebSocket";

function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isConnected } = useWebSocket(
    "ws://localhost:8000/ws/chat/"
  );

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div>
      <div>Status: {isConnected ? "Connected" : "Disconnected"}</div>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
