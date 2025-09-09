import type { Prompt } from "@/app/types/prompt";

import React, { useState, useMemo, useEffect } from "react";
import { StartAvatarRequest } from "@heygen/streaming-avatar";

import { Select } from "../Select";
import { PromptsManager } from "../Prompts";

import { Field } from "./Field";
import { AvatarGalleryDialog } from "./AvatarGalleryDialog";

import { usePrompts } from "@/store/usePromptsStore";
import { AVATARS, STT_LANGUAGE_LIST, PROMPTS } from "@/app/lib/constants";

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

  const [showPromptsManager, setShowPromptsManager] = useState<boolean>(false);
  const [showAvatarGallery, setShowAvatarGallery] = useState<boolean>(false);

  // Get prompts from API with fallback to hardcoded prompts
  const { prompts, fetchPrompts } = usePrompts();

  // Load prompts on component mount
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // Use API prompts if available, otherwise fall back to hardcoded prompts
  const availablePrompts: Prompt[] = prompts.length > 0 ? prompts : PROMPTS;

  const selectedAvatar = useMemo(() => {
    const avatar = AVATARS.find(
      (avatar) => avatar.avatar_id === config.avatarName,
    );

    return avatar || AVATARS[0]; // Default to first avatar if not found
  }, [config.avatarName]);

  const selectedPrompt = useMemo(() => {
    const prompt = availablePrompts.find(
      (prompt) => prompt.id === config.knowledgeId,
    );

    return prompt || availablePrompts[0]; // Default to first if not found
  }, [config.knowledgeId, availablePrompts]);

  return (
    <div className="relative flex flex-col gap-4 w-full max-w-4xl py-4 px-4 sm:px-6">
      {/* Header Section - Streamlined */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold text-zinc-100">
          Configure Your Avatar
        </h2>
        <p className="text-zinc-400 text-xs max-w-lg mx-auto">
          Choose your conversation style and avatar, then start testing.
        </p>
      </div>

      {/* Essential Configuration - Compact Layout */}
      <section
        aria-labelledby="essential-settings"
        className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700"
      >
        <h3
          className="text-base font-medium text-zinc-200 mb-3 flex items-center gap-2"
          id="essential-settings"
        >
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
          />
          Configuration
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field
            description="Conversation style and personality"
            label="Prompt"
            tooltip="The prompt defines how the avatar will respond and behave during conversations"
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  isSelected={(option) => option.id === selectedPrompt.id}
                  options={availablePrompts}
                  placeholder="Select Prompt"
                  renderOption={(option) => option.name}
                  value={selectedPrompt.name}
                  onSelect={(option) => onChange("knowledgeId", option.id)}
                />
              </div>
              <button
                aria-label="Manage avatar prompts and conversations"
                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
                title="Create, edit, and manage your avatar prompts"
                type="button"
                onClick={() => setShowPromptsManager(true)}
              >
                Manage
              </button>
            </div>
          </Field>

          <Field
            description="Primary speaking language"
            label="Language"
            tooltip="This affects both speech recognition and text-to-speech output"
          >
            <Select
              isSelected={(option) => option.value === config.language}
              options={STT_LANGUAGE_LIST}
              renderOption={(option) => option.label}
              value={
                STT_LANGUAGE_LIST.find(
                  (option) => option.value === config.language,
                )?.label
              }
              onSelect={(option) => onChange("language", option.value)}
            />
          </Field>
        </div>
      </section>

      {/* Avatar Selection - Compact */}
      <section className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-zinc-200 flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 bg-green-400 rounded-full"
            />
            Avatar
          </h3>
        </div>

        {/* Compact Avatar Preview */}
        <div className="flex items-center gap-3 p-3 bg-zinc-700/30 rounded-lg border border-zinc-600/50">
          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-zinc-500 flex-shrink-0">
            <img
              alt={selectedAvatar.name}
              className="w-full h-full object-cover"
              src={selectedAvatar.image}
              onError={(e) => {
                const target = e.target as HTMLImageElement;

                target.style.display = "none";
                const parent = target.parentElement;

                if (parent && !parent.querySelector(".avatar-fallback")) {
                  const fallback = document.createElement("div");

                  fallback.className =
                    "avatar-fallback w-full h-full flex items-center justify-center text-sm font-bold bg-zinc-600 text-zinc-200";
                  fallback.textContent = selectedAvatar.name.charAt(0);
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-zinc-100 truncate">
              {selectedAvatar.name}
            </h4>
            <div className="flex gap-1.5 mt-1">
              {selectedAvatar.isNew && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-300">
                  New
                </span>
              )}
              {selectedAvatar.isPopular && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-300">
                  Popular
                </span>
              )}
            </div>
          </div>
          <button
            aria-label="Open avatar gallery to choose a different avatar"
            className="px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
            title="Browse all available avatars"
            type="button"
            onClick={() => setShowAvatarGallery(true)}
          >
            Change
          </button>
        </div>
      </section>

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

      {/* Status Bar - Compact */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-3 border border-blue-700/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-blue-300/70">Ready:</span>
            <span
              className="text-blue-100 font-medium truncate"
              title={`${selectedPrompt.name} • ${selectedAvatar.name}`}
            >
              {selectedPrompt.name} • {selectedAvatar.name}
            </span>
          </div>
          <span className="text-green-400 text-xs">✓ Configured</span>
        </div>
      </div>

      {/* Prompts Manager Modal */}
      {showPromptsManager && (
        <PromptsManager
          isOpen={showPromptsManager}
          onClose={() => setShowPromptsManager(false)}
        />
      )}

      {/* Avatar Gallery Dialog */}
      <AvatarGalleryDialog
        isOpen={showAvatarGallery}
        selectedAvatarId={config.avatarName}
        onAvatarSelect={(avatarId) => onChange("avatarName", avatarId)}
        onClose={() => setShowAvatarGallery(false)}
      />
    </div>
  );
};
