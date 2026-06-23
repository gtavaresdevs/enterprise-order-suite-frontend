import { useState } from "react";

export function useChatAssistant() {
  const [chatInput, setChatInput] = useState("");

  const handleSend = () => {
    if (!chatInput.trim()) return;
    // Logic to send message to an API would go here via mutations
    setChatInput("");
  };

  return {
    chatInput,
    setChatInput,
    handleSend,
  };
}