import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
  ConnectionQuality,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import { useConnectionQuality } from "./logic/useConnectionQuality";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";

import { AVATARS, PROMPTS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: AVATARS[0].avatar_id,
  knowledgeId: PROMPTS[0].id,
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { connectionQuality } = useConnectionQuality();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const mediaStream = useRef<HTMLVideoElement>(null);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    setIsConnecting(true);
    setError(null);
    try {
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
      });

      await startAvatar(config);

      if (isVoiceChat) {
        await startVoiceChat();
      }
      setIsConnecting(false);
    } catch (error) {
      console.error("Error starting avatar session:", error);
      setIsConnecting(false);
      
      // Set user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('token') || error.message.includes('401')) {
          setError('Authentication failed. Please check your API key.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          setError('Network error. Please check your connection.');
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          setError('Usage limit reached. Please try again later.');
        } else {
          setError('Failed to start avatar session. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Error Notification */}
      {error && (
        <div className="flex justify-start">
          <div className="bg-red-900 border border-red-700 text-red-100 rounded-lg px-4 py-3 text-sm font-medium shadow-sm flex items-center gap-3">
            <span className="text-red-400">⚠</span>
            <div>
              <p className="font-medium">Connection Error</p>
              <p className="text-red-200 text-xs mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 ml-2"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Connection Quality Notification */}
      {sessionState !== StreamingAvatarSessionState.INACTIVE && 
       connectionQuality !== ConnectionQuality.UNKNOWN && (
        <div className="flex justify-start">
          <div className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-2 text-sm font-medium shadow-sm">
            Connection: <span className={`font-semibold ${
              connectionQuality === ConnectionQuality.GOOD ? 'text-green-400' :
              connectionQuality === ConnectionQuality.BAD ? 'text-red-400' : 'text-yellow-400'
            }`}>{connectionQuality}</span>
          </div>
        </div>
      )}
      <div className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg">
        <div className={`relative w-full overflow-hidden flex flex-col items-center justify-center ${
          sessionState !== StreamingAvatarSessionState.INACTIVE 
            ? "aspect-video" 
            : "min-h-0"
        }`}>
          {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
            <AvatarVideo ref={mediaStream} />
          ) : (
            <AvatarConfig config={config} onConfigChange={setConfig} />
          )}
        </div>
        <div className="flex flex-col gap-4 items-center justify-center p-6 border-t border-zinc-700 w-full bg-zinc-800/50">
          {sessionState === StreamingAvatarSessionState.CONNECTED ? (
            <AvatarControls />
          ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-row gap-4">
                <Button 
                  onClick={() => startSessionV2(true)}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Starting..." : "Test AI Avatar"}
                </Button>
                {/* <Button onClick={() => startSessionV2(false)}>
                  Start Text Chat
                </Button> */}
              </div>
              {error && (
                <button
                  onClick={() => startSessionV2(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <LoadingIcon />
              <div className="text-center">
                <p className="text-zinc-300 text-sm">Connecting to avatar...</p>
                <p className="text-zinc-500 text-xs mt-1">This may take a moment</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <MessageHistory />
      )}
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
