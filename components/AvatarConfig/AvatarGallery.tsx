import React from "react";
import { AVATARS } from "@/app/lib/constants";
import { Tilt } from "@/components/ui/tilt";
import { Spotlight } from "@/components/ui/spotlight";

interface Avatar {
  avatar_id: string;
  name: string;
  image: string;
  isNew?: boolean;
  isPopular?: boolean;
}

interface AvatarGalleryProps {
  selectedAvatarId: string;
  onAvatarSelect: (avatarId: string) => void;
}

export const AvatarGallery: React.FC<AvatarGalleryProps> = ({
  selectedAvatarId,
  onAvatarSelect,
}) => {
  // Sort avatars: NEW first, then POPULAR, then regular
  const sortedAvatars = [...AVATARS].sort((a, b) => {
    // NEW avatars first (priority 1)
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    
    // If both/neither are NEW, then POPULAR avatars next (priority 2)
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;
    
    // If same priority, maintain original order
    return 0;
  });

  return (
    <div className="w-full">
      <h3 className="text-zinc-100 text-lg font-medium mb-4">Choose Your Avatar</h3>
      <div className="grid grid-cols-4 gap-4">
        {sortedAvatars.map((avatar) => (
          <Tilt
            key={avatar.avatar_id}
            rotationFactor={8}
            isReverse={false}
            springOptions={{
              stiffness: 26.7,
              damping: 4.1,
              mass: 0.2,
            }}
            className={`
              cursor-pointer rounded-lg p-2 transition-all duration-200 group
              ${
                selectedAvatarId === avatar.avatar_id
                  ? "bg-blue-600 border-2 border-blue-400"
                  : "bg-zinc-800 border-2 border-zinc-700 hover:border-zinc-500"
              }
            `}
            onClick={() => onAvatarSelect(avatar.avatar_id)}
          >
            {/* Spotlight Effect */}
            <Spotlight
              className="z-10 from-white/50 via-white/20 to-white/10 blur-2xl"
              size={200}
              springOptions={{
                stiffness: 26.7,
                damping: 4.1,
                mass: 0.2,
              }}
            />
            
            {/* Avatar image with badges */}
            <div
              className={`
                relative w-full aspect-[4/3] rounded-md mb-2 overflow-hidden transition-all duration-300
                ${
                  selectedAvatarId === avatar.avatar_id
                    ? "ring-2 ring-blue-400"
                    : ""
                }
              `}
            >
              <img
                src={avatar.image}
                alt={avatar.name}
                className="w-full h-full object-cover transition-all duration-700 group-hover:grayscale-0 grayscale-[0.3]"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center text-2xl font-bold ${
                        selectedAvatarId === avatar.avatar_id
                          ? "bg-blue-500 text-white"
                          : "bg-zinc-700 text-zinc-300"
                      }">
                        ${avatar.name.charAt(0)}
                      </div>
                    `;
                  }
                }}
              />
              
              {/* Corner Badges */}
              {avatar.isNew && (
                <div className="absolute top-1 right-1 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-20">
                  NEW
                </div>
              )}
              {avatar.isPopular && (
                <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-20">
                  POPULAR
                </div>
              )}
            </div>
            
            <p
              className={`
                text-center text-sm font-medium truncate transition-colors duration-200
                ${
                  selectedAvatarId === avatar.avatar_id
                    ? "text-white"
                    : "text-zinc-300 group-hover:text-zinc-100"
                }
              `}
              title={avatar.name}
            >
              {avatar.name}
            </p>
          </Tilt>
        ))}
      </div>
    </div>
  );
};