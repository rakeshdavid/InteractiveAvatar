import React, { useState, useMemo } from "react";
import {
  AvatarQuality,
  ElevenLabsModel,
  STTProvider,
  VoiceEmotion,
  StartAvatarRequest,
  VoiceChatTransport,
} from "@heygen/streaming-avatar";

import { Input } from "../Input";
import { Select } from "../Select";

import { Field } from "./Field";
import { AvatarGallery } from "./AvatarGallery";

import { AVATARS, STT_LANGUAGE_LIST, KNOWLEDGE_BASES } from "@/app/lib/constants";

interface AvatarConfigProps {
  onConfigChange: (config: StartAvatarRequest) => void;
  config: StartAvatarRequest;
}

export const AvatarConfig: React.FC<AvatarConfigProps> = ({
  onConfigChange,
  config,
}) => {
  const onChange = <T extends keyof StartAvatarRequest>(
    key: T,
    value: StartAvatarRequest[T],
  ) => {
    onConfigChange({ ...config, [key]: value });
  };
  const [showMore, setShowMore] = useState<boolean>(false);

  const selectedAvatar = useMemo(() => {
    const avatar = AVATARS.find(
      (avatar) => avatar.avatar_id === config.avatarName,
    );

    return avatar || AVATARS[0]; // Default to first avatar if not found
  }, [config.avatarName]);

  const selectedKnowledgeBase = useMemo(() => {
    const knowledgeBase = KNOWLEDGE_BASES.find(
      (kb) => kb.id === config.knowledgeId,
    );
    return knowledgeBase || KNOWLEDGE_BASES[0]; // Default to first if not found
  }, [config.knowledgeId]);

  return (
    <div className="relative flex flex-col gap-6 w-full max-w-2xl py-8 max-h-full overflow-y-auto px-4">
      {/* Configuration Controls - 3 Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Prompt">
          <Select
            isSelected={(option) => option.id === selectedKnowledgeBase.id}
            options={KNOWLEDGE_BASES}
            placeholder="Select Prompt"
            renderOption={(option) => option.name}
            value={selectedKnowledgeBase.name}
            onSelect={(option) => onChange("knowledgeId", option.id)}
          />
        </Field>
        
        <Field label="Language">
          <Select
            isSelected={(option) => option.value === config.language}
            options={STT_LANGUAGE_LIST}
            renderOption={(option) => option.label}
            value={
              STT_LANGUAGE_LIST.find((option) => option.value === config.language)
                ?.label
            }
            onSelect={(option) => onChange("language", option.value)}
          />
        </Field>
        
        <Field label="Avatar Quality">
          <Select
            isSelected={(option) => option === config.quality}
            options={Object.values(AvatarQuality)}
            renderOption={(option) => option}
            value={config.quality}
            onSelect={(option) => onChange("quality", option)}
          />
        </Field>
      </div>

      {/* Avatar Gallery */}
      <AvatarGallery
        selectedAvatarId={config.avatarName}
        onAvatarSelect={(avatarId) => onChange("avatarName", avatarId)}
      />

      {/* Hidden advanced settings - ElevenLabs and Deepgram configurations
      {showMore && (
        <>
          <h1 className="text-zinc-100 w-full text-center mt-5">
            Voice Settings
          </h1>
          <Field label="Custom Voice ID">
            <Input
              placeholder="Enter custom voice ID"
              value={config.voice?.voiceId}
              onChange={(value) =>
                onChange("voice", { ...config.voice, voiceId: value })
              }
            />
          </Field>
          <Field label="Emotion">
            <Select
              isSelected={(option) => option === config.voice?.emotion}
              options={Object.values(VoiceEmotion)}
              renderOption={(option) => option}
              value={config.voice?.emotion}
              onSelect={(option) =>
                onChange("voice", { ...config.voice, emotion: option })
              }
            />
          </Field>
          <Field label="ElevenLabs Model">
            <Select
              isSelected={(option) => option === config.voice?.model}
              options={Object.values(ElevenLabsModel)}
              renderOption={(option) => option}
              value={config.voice?.model}
              onSelect={(option) =>
                onChange("voice", { ...config.voice, model: option })
              }
            />
          </Field>
          <h1 className="text-zinc-100 w-full text-center mt-5">
            STT Settings
          </h1>
          <Field label="Provider">
            <Select
              isSelected={(option) => option === config.sttSettings?.provider}
              options={Object.values(STTProvider)}
              renderOption={(option) => option}
              value={config.sttSettings?.provider}
              onSelect={(option) =>
                onChange("sttSettings", {
                  ...config.sttSettings,
                  provider: option,
                })
              }
            />
          </Field>
        </>
      )}
      <button
        className="text-zinc-400 text-sm cursor-pointer w-full text-center bg-transparent"
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? "Show less" : "Show more..."}
      </button>
      */}
    </div>
  );
};
