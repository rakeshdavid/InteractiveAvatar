import { TaskType, TaskMode } from "@heygen/streaming-avatar";
import React, { useCallback, useEffect, useState } from "react";
import { usePrevious } from "ahooks";

import { Select } from "../Select";
import { Button } from "../Button";
import { SendIcon } from "../Icons";
import { useTextChat } from "../logic/useTextChat";
import { Input } from "../Input";
import { useConversationState } from "../logic/useConversationState";

export const TextInput: React.FC = () => {
  const { sendMessage, sendMessageSync, repeatMessage, repeatMessageSync } =
    useTextChat();
  const { startListening, stopListening } = useConversationState();
  const [taskType, setTaskType] = useState<TaskType>(TaskType.TALK);
  const [taskMode, setTaskMode] = useState<TaskMode>(TaskMode.ASYNC);
  const [message, setMessage] = useState("");

  const handleSend = useCallback(() => {
    if (message.trim() === "") {
      return;
    }
    if (taskType === TaskType.TALK) {
      taskMode === TaskMode.SYNC
        ? sendMessageSync(message)
        : sendMessage(message);
    } else {
      taskMode === TaskMode.SYNC
        ? repeatMessageSync(message)
        : repeatMessage(message);
    }
    setMessage("");
  }, [
    taskType,
    taskMode,
    message,
    sendMessage,
    sendMessageSync,
    repeatMessage,
    repeatMessageSync,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSend();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend]);

  const previousText = usePrevious(message);

  useEffect(() => {
    if (!previousText && message) {
      startListening();
    } else if (previousText && !message) {
      stopListening();
    }
  }, [message, previousText, startListening, stopListening]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Control selects grouped together for mobile */}
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Select
          isSelected={(option) => option === taskType}
          options={Object.values(TaskType)}
          renderOption={(option) => option.toUpperCase()}
          value={taskType.toUpperCase()}
          onSelect={setTaskType}
        />
        <Select
          isSelected={(option) => option === taskMode}
          options={Object.values(TaskMode)}
          renderOption={(option) => option.toUpperCase()}
          value={taskMode.toUpperCase()}
          onSelect={setTaskMode}
        />
      </div>
      
      {/* Message input and send button */}
      <div className="flex gap-2 items-end w-full">
        <Input
          className="flex-1 min-w-0"
          placeholder={`Type something for the avatar to ${taskType === TaskType.REPEAT ? "repeat" : "respond"}...`}
          value={message}
          onChange={setMessage}
          inputMode="text"
          autoComplete="off"
          autoCapitalize="sentences"
          autoCorrect="on"
          enterKeyHint="send"
        />
        <Button className="!px-3 !py-3 !min-h-[44px] flex items-center justify-center" onClick={handleSend}>
          <SendIcon size={20} />
        </Button>
      </div>
    </div>
  );
};
