import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import React from "react";

import { useVoiceChat } from "../logic/useVoiceChat";
import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";

import { AudioInput } from "./AudioInput";
import { TextInput } from "./TextInput";

export const AvatarControls: React.FC = () => {
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    startVoiceChat,
    stopVoiceChat,
  } = useVoiceChat();
  const { interrupt } = useInterrupt();

  return (
    <div className="flex flex-col gap-4 relative w-full items-center">
      <ToggleGroup
        className={`bg-zinc-700 border border-zinc-600 rounded-lg p-1 transition-all duration-200 ${
          isVoiceChatLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isVoiceChatLoading}
        type="single"
        value={isVoiceChatActive || isVoiceChatLoading ? "voice" : "text"}
        onValueChange={(value) => {
          if (value === "voice" && !isVoiceChatActive && !isVoiceChatLoading) {
            startVoiceChat();
          } else if (
            value === "text" &&
            isVoiceChatActive &&
            !isVoiceChatLoading
          ) {
            stopVoiceChat();
          }
        }}
      >
        <ToggleGroupItem
          className="data-[state=on]:bg-zinc-800 data-[state=on]:text-white hover:bg-zinc-600 text-zinc-300 rounded-lg py-3 px-4 text-sm w-[90px] text-center min-h-[44px] touch-manipulation flex items-center justify-center transition-all duration-200"
          value="voice"
        >
          {isVoiceChatLoading && isVoiceChatActive ? "Connecting..." : "Voice Chat"}
        </ToggleGroupItem>
        <ToggleGroupItem
          className="data-[state=on]:bg-zinc-800 data-[state=on]:text-white hover:bg-zinc-600 text-zinc-300 rounded-lg py-3 px-4 text-sm w-[90px] text-center min-h-[44px] touch-manipulation flex items-center justify-center transition-all duration-200"
          value="text"
        >
          Text Chat
        </ToggleGroupItem>
      </ToggleGroup>
      
      {/* Input Area */}
      <div className="w-full">
        {isVoiceChatActive || isVoiceChatLoading ? <AudioInput /> : <TextInput />}
      </div>
      
      {/* Interrupt Button */}
      <div className="absolute top-[-70px] right-3">
        <Button 
          className="!bg-red-600 hover:!bg-red-700 !text-white !px-4 !py-2 !text-sm"
          onClick={interrupt}
          title="Stop avatar from speaking"
        >
          Interrupt
        </Button>
      </div>
    </div>
  );
};
