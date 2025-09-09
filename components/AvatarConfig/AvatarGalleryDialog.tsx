import React, { useState, useMemo } from "react";
import { AVATARS } from "@/app/lib/constants";
import { Tilt } from "@/components/ui/tilt";
import { Spotlight } from "@/components/ui/spotlight";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Sparkles, TrendingUp, Grid3X3 } from "lucide-react";

interface Avatar {
  avatar_id: string;
  name: string;
  image: string;
  isNew?: boolean;
  isPopular?: boolean;
}

interface AvatarGalleryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatarId: string;
  onAvatarSelect: (avatarId: string) => void;
}

export const AvatarGalleryDialog: React.FC<AvatarGalleryDialogProps> = ({
  isOpen,
  onClose,
  selectedAvatarId,
  onAvatarSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Filter avatars based on search and category
  const filteredAvatars = useMemo(() => {
    let filtered = [...AVATARS];

    // Filter by category
    if (activeTab === "new") {
      filtered = filtered.filter(avatar => avatar.isNew);
    } else if (activeTab === "popular") {
      filtered = filtered.filter(avatar => avatar.isPopular);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(avatar => 
        avatar.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, activeTab]);

  const handleAvatarSelect = (avatarId: string) => {
    onAvatarSelect(avatarId);
    onClose();
  };

  const AvatarCard = ({ avatar }: { avatar: Avatar }) => (
    <Tilt
      key={avatar.avatar_id}
      rotationFactor={6}
      isReverse={false}
      springOptions={{
        stiffness: 26.7,
        damping: 4.1,
        mass: 0.2,
      }}
      className={`
        cursor-pointer rounded-xl p-3 transition-all duration-300 group relative
        ${
          selectedAvatarId === avatar.avatar_id
            ? "bg-blue-600 border-2 border-blue-400 shadow-lg shadow-blue-500/25"
            : "bg-zinc-800/80 border-2 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700/80"
        }
      `}
      onClick={() => handleAvatarSelect(avatar.avatar_id)}
    >
      {/* Spotlight Effect */}
      <Spotlight
        className="z-10 from-white/40 via-white/15 to-white/5 blur-3xl"
        size={150}
        springOptions={{
          stiffness: 26.7,
          damping: 4.1,
          mass: 0.2,
        }}
      />
      
      {/* Avatar image with badges */}
      <div
        className={`
          relative w-full aspect-[4/3] rounded-lg mb-3 overflow-hidden transition-all duration-300
          ${
            selectedAvatarId === avatar.avatar_id
              ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-zinc-900"
              : ""
          }
        `}
      >
        <img
          src={avatar.image}
          alt={avatar.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0 grayscale-[0.2]"
          loading="lazy"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.avatar-fallback')) {
              const fallback = document.createElement('div');
              fallback.className = `avatar-fallback w-full h-full flex items-center justify-center text-2xl font-bold rounded-lg ${
                selectedAvatarId === avatar.avatar_id
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-600 text-zinc-200 group-hover:bg-zinc-500"
              }`;
              fallback.textContent = avatar.name.charAt(0);
              parent.appendChild(fallback);
            }
          }}
        />
        
        {/* Corner Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {avatar.isNew && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-2 py-1 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              NEW
            </Badge>
          )}
          {avatar.isPopular && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-2 py-1 shadow-lg">
              <TrendingUp className="w-3 h-3 mr-1" />
              POPULAR
            </Badge>
          )}
        </div>

        {/* Selection Indicator */}
        {selectedAvatarId === avatar.avatar_id && (
          <div className="absolute inset-0 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <div className="bg-blue-500 rounded-full p-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
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
        
        {/* Quick badges for features */}
        <div className="flex justify-center gap-1">
          {avatar.isNew && !avatar.isPopular && (
            <span className="text-xs text-emerald-400">New Release</span>
          )}
          {avatar.isPopular && !avatar.isNew && (
            <span className="text-xs text-orange-400">Most Used</span>
          )}
          {avatar.isNew && avatar.isPopular && (
            <span className="text-xs text-purple-400">Featured</span>
          )}
        </div>
      </div>
    </Tilt>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-7xl w-[95vw] h-[90vh] p-0 overflow-hidden"
        aria-labelledby="avatar-gallery-title"
        aria-describedby="avatar-gallery-description"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-zinc-800">
            <DialogTitle 
              id="avatar-gallery-title" 
              className="text-2xl font-semibold text-zinc-100 flex items-center gap-3"
            >
              <Grid3X3 className="w-6 h-6 text-blue-400" />
              Choose Your Avatar
              <Badge variant="secondary" className="text-xs">
                {filteredAvatars.length} available
              </Badge>
            </DialogTitle>
            <p id="avatar-gallery-description" className="sr-only">
              Browse and select from available avatars. Use search to filter by name or browse by category.
            </p>
          </DialogHeader>

          {/* Search and Tabs */}
          <div className="p-6 pb-4 border-b border-zinc-800 bg-zinc-900/50">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Command className="rounded-lg border border-zinc-700 bg-zinc-800">
                  <CommandInput 
                    placeholder="Search avatars by name..." 
                    className="pl-10"
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                </Command>
              </div>

              {/* Category Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    All ({AVATARS.length})
                  </TabsTrigger>
                  <TabsTrigger value="new" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    New ({AVATARS.filter(a => a.isNew).length})
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Popular ({AVATARS.filter(a => a.isPopular).length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Avatar Grid */}
          <div className="flex-1 p-6">
            <ScrollArea className="h-full w-full">
              {filteredAvatars.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                  {filteredAvatars.map((avatar) => (
                    <AvatarCard key={avatar.avatar_id} avatar={avatar} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Search className="w-16 h-16 text-zinc-600 mb-4" />
                  <h3 className="text-lg font-medium text-zinc-400 mb-2">No avatars found</h3>
                  <p className="text-zinc-500 text-sm max-w-md">
                    {searchQuery 
                      ? `No avatars match "${searchQuery}". Try different keywords or browse all avatars.`
                      : "No avatars available in this category."
                    }
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-4 text-blue-400 hover:text-blue-300 text-sm underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};