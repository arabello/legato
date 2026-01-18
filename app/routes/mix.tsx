import {
  GripVertical,
  MinusIcon,
  Plus,
  Trash2,
  Share2,
  Upload,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as React from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { describeTransition, type MixTrack } from "~/core/mix-storage";
import {
  formatOpenKey,
  openKeyFromString,
  generateAllRootKeys,
  type OpenKey,
} from "~/core/openKey";
import { decodeMixSharePayload, encodeMixSharePayload } from "~/core/mix-share";
import {
  customHarmonicSuggestion,
  getHarmonicSuggestions,
  projectHarmonicSuggestion,
  type HarmonicRuleDefinition,
  type HarmonicSuggestion,
} from "~/core/rules";
import {
  TransitionMoodBadge,
  TransitionTypeBadge,
} from "~/components/transition-badges";
import { getKeyColor } from "~/core/key-colors";
import type { Route } from "./+types/mix";
import type { AppLayoutContext } from "./layout";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Mix Editor - Legato` },
    { name: "description", content: "Edit your harmonic mix" },
  ];
}

function KeyNode({
  keyName,
  size = "md",
  isActive = false,
}: {
  keyName: string;
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  const sizeClasses = size === "sm" ? "h-10 w-10 text-sm" : "h-14 w-14 text-lg";
  const color = getKeyColor(keyName);

  return (
    <div
      className={`flex items-center justify-center rounded-lg border-2 font-semibold transition-all ${sizeClasses} ${
        isActive
          ? "ring-primary ring-offset-background ring-2 ring-offset-2"
          : ""
      }`}
      style={{
        borderColor: color,
        backgroundColor: `${color}1a`,
        color: color,
      }}
    >
      {keyName}
    </div>
  );
}

function EditableKeyNode({
  value,
  onChange,
  isInvalid = false,
}: {
  value: string;
  onChange: (value: string) => void;
  isInvalid?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="--"
      maxLength={3}
      aria-label="Custom Open Key"
      className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-center text-lg font-semibold uppercase transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${
        isInvalid
          ? "border-destructive text-destructive focus-visible:ring-destructive"
          : "border-muted-foreground/50 text-muted-foreground focus-visible:border-primary focus-visible:text-foreground focus-visible:ring-ring border-dashed"
      }`}
    />
  );
}

type MixSuggestion = HarmonicSuggestion & {
  keyLabel: string;
};

type SortableTrackItemProps = {
  track: MixTrack;
  rule?: HarmonicRuleDefinition;
  index: number;
  isSelected: boolean;
  isLastTrack: boolean;
  isDragging: boolean;
  tracksCount: number;
  onSelect: (trackId: string) => void;
  onTitleChange: (trackId: string, value: string) => void;
  onDetailsChange: (trackId: string, value: string) => void;
  onRemove: (trackId: string) => void;
};

function SortableTrackItem({
  track,
  rule,
  index,
  isSelected,
  isLastTrack,
  isDragging,
  tracksCount,
  onSelect,
  onTitleChange,
  onDetailsChange,
  onRemove,
}: SortableTrackItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const ruleType = rule?.type;
  const ruleMood = rule?.mood;
  const showDragHandle = tracksCount > 1;

  return (
    <React.Fragment>
      <div
        ref={setNodeRef}
        style={style}
        className="group relative"
        onClick={() => onSelect(track.id)}
      >
        {/* Track Node */}
        <div className="flex items-center gap-6 py-4">
          {/* Left side - Relationship info */}
          <div className="flex w-32 flex-col items-end gap-4 text-right">
            {rule && (
              <span className="text-muted-foreground text-sm">{rule.name}</span>
            )}
            {index > 0 && (
              <div className="flex items-center gap-2">
                {ruleType && <TransitionTypeBadge value={ruleType} />}
                {ruleMood && <TransitionMoodBadge value={ruleMood} />}
              </div>
            )}
          </div>

          {/* Key Node */}
          <KeyNode keyName={formatOpenKey(track.key)} isActive={isSelected} />

          {/* Right side - Track info */}
          <div className="flex items-start gap-3">
            <div className="w-48">
              <input
                value={track.title ?? ""}
                onChange={(event) =>
                  onTitleChange(track.id, event.target.value)
                }
                placeholder="Add track title..."
                className="font-medium outline-none focus-visible:ring-0"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }
                }}
              />
              <input
                value={track.details || ""}
                onChange={(event) =>
                  onDetailsChange(track.id, event.target.value)
                }
                placeholder="Add track BPM or notes"
                className="text-muted-foreground mt-1 w-full text-sm outline-none focus-visible:ring-0"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }
                }}
              />
            </div>
            {showDragHandle && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
                <span className="sr-only">Drag to reorder</span>
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-destructive opacity-0 transition-opacity group-hover:opacity-100 hover:text-white focus-visible:opacity-100"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove track</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove this track?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isLastTrack
                      ? "This will permanently remove the final track from your timeline."
                      : "Removing this key will relink the harmonic rule between the surrounding tracks. The next track's transition will refresh or disappear accordingly."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onRemove(track.id)}
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      {/* Separator */}
      <MinusIcon className="text-muted-foreground/30 h-4 w-4 -rotate-90" />

      {/* Add Track Button */}
      {isLastTrack && (
        <div className="mt-5 flex justify-center">
          <button className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full">
            <Plus className="h-6 w-6" />
          </button>
        </div>
      )}
    </React.Fragment>
  );
}

export default function Mix() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    mixes,
    hydrated,
    addKeyToMix,
    createMix,
    updateMixName,
    updateTrack,
    removeTrack,
    moveTrack,
    clearTimeline,
    importMixFromNml,
    openAboutDialog,
  } = useOutletContext<AppLayoutContext>();
  const shareParam = searchParams.get("share");
  const mix = mixes.find((entry) => entry.id === id);
  const [selectedTrackId, setSelectedTrackId] = React.useState<string | null>(
    null,
  );
  const [customKeyValue, setCustomKeyValue] = React.useState("");
  const [customKeyError, setCustomKeyError] = React.useState<string | null>(
    null,
  );
  const rootKeyOptions = React.useMemo(() => generateAllRootKeys(), []);
  const shareHandledRef = React.useRef(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [clearTimelineDialogOpen, setClearTimelineDialogOpen] =
    React.useState(false);
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">(
    "idle",
  );
  const importFileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeTrackId, setActiveTrackId] = React.useState<string | null>(null);
  const [pendingMove, setPendingMove] = React.useState<{
    trackId: string;
    fromIndex: number;
    toIndex: number;
  } | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleImportClick = () => {
    importFileInputRef.current?.click();
  };

  const handleImportFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        const newMix = importMixFromNml(content);
        if (newMix) {
          navigate(`/mix/${newMix.id}`);
        }
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be selected again
    event.target.value = "";
  };

  const handleSuggestedKeyClick = (suggestion: MixSuggestion) => {
    if (!mix) return;
    const nextKey = openKeyFromString(suggestion.keyLabel);
    if (!nextKey) return;
    addKeyToMix(mix.id, nextKey);
  };

  const handleMixNameChange = (value: string) => {
    if (!mix) return;
    updateMixName(mix.id, value);
  };

  const handleTrackTitleChange = (trackId: string, value: string) => {
    if (!mix) return;
    updateTrack(mix.id, trackId, { title: value });
  };

  const handleTrackDetailsChange = (trackId: string, value: string) => {
    if (!mix) return;
    updateTrack(mix.id, trackId, { details: value });
  };

  const handleRemoveTrack = (trackId: string) => {
    if (!mix) return;
    removeTrack(mix.id, trackId);
  };

  const handleCustomKeySubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!mix) return;
    const parsed = openKeyFromString(customKeyValue);
    if (!parsed) {
      setCustomKeyError("Wrong format");
      return;
    }
    setCustomKeyError(null);
    addKeyToMix(mix.id, parsed);
    setCustomKeyValue("");
  };

  const handleRootKeySelect = (key: OpenKey) => {
    if (!mix) return;
    addKeyToMix(mix.id, key);
  };

  const trackSignature = mix?.tracks.map((track) => track.id).join("|") ?? "";
  const anchorOpenKey =
    mix?.tracks[mix.tracks.length - 1]?.key || mix?.startKey;
  const anchorKey = anchorOpenKey ? formatOpenKey(anchorOpenKey) : "1m";
  const isTimelineEmpty = (mix?.tracks.length ?? 0) === 0;

  // Compute display order: when there's a pending move, show tracks in the new order
  const displayTracks = React.useMemo(() => {
    if (!mix) return [];
    if (!pendingMove) return mix.tracks;

    const tracks = [...mix.tracks];
    const fromIndex = tracks.findIndex((t) => t.id === pendingMove.trackId);
    if (fromIndex === -1) return mix.tracks;

    const [movedTrack] = tracks.splice(fromIndex, 1);
    tracks.splice(pendingMove.toIndex, 0, movedTrack);
    return tracks;
  }, [mix, pendingMove]);

  const harmonicSuggestions = React.useMemo<MixSuggestion[]>(() => {
    return getHarmonicSuggestions(anchorKey)
      .map((suggestion) => {
        const keyLabel = projectHarmonicSuggestion(anchorKey, suggestion.id);
        if (!keyLabel) return null;
        return { ...suggestion, keyLabel };
      })
      .filter((suggestion): suggestion is MixSuggestion => suggestion !== null);
  }, [anchorKey]);

  const trackTransitions = React.useMemo<
    Array<{ track: MixTrack; rule?: HarmonicRuleDefinition }>
  >(() => {
    if (!mix) {
      return [];
    }
    return displayTracks.map((track, index) => {
      const previousKey = displayTracks[index - 1]?.key;
      return {
        track,
        rule: describeTransition(previousKey, track.key),
      };
    });
  }, [mix, displayTracks]);

  React.useEffect(() => {
    if (!mix) {
      setSelectedTrackId(null);
      return;
    }

    setSelectedTrackId((current) => {
      if (current && mix.tracks.some((track) => track.id === current)) {
        return current;
      }
      return mix.tracks[0]?.id ?? null;
    });
  }, [mix?.id, trackSignature]);

  React.useEffect(() => {
    setCustomKeyValue("");
    setCustomKeyError(null);
  }, [mix?.id]);

  const shareLink = React.useMemo(() => {
    if (!mix || typeof window === "undefined") {
      return "";
    }
    const encoded = encodeMixSharePayload(mix);
    const basePath = import.meta.env.BASE_URL ?? "/";
    const normalizedBase = basePath.endsWith("/")
      ? basePath.slice(0, -1)
      : basePath;
    const sharePath = `${normalizedBase}/mix/${mix.id}`;
    const url = new URL(sharePath, window.location.origin);
    url.searchParams.set("share", encoded);
    return url.toString();
  }, [mix]);

  React.useEffect(() => {
    if (shareHandledRef.current) return;
    if (!hydrated) return;
    if (!shareParam) return;

    shareHandledRef.current = true;
    const next = new URLSearchParams(searchParams);
    next.delete("share");
    setSearchParams(next, { replace: true });

    const payload = decodeMixSharePayload(shareParam);
    if (!payload) {
      return;
    }

    const newMix = createMix({
      name: payload.name ?? "Shared Mix",
      keys:
        payload.tracks.length > 0
          ? payload.tracks.map((track) => track.key)
          : undefined,
    });

    if (payload.tracks.length > 0) {
      payload.tracks.forEach((track, index) => {
        const trackId = newMix.tracks[index]?.id;
        if (trackId) {
          updateTrack(newMix.id, trackId, {
            title: track.title,
            details: track.details,
          });
        }
      });
    }

    navigate(`/mix/${newMix.id}`, { replace: true });
  }, [
    hydrated,
    shareParam,
    createMix,
    updateTrack,
    navigate,
    searchParams,
    setSearchParams,
  ]);

  const handleShareDialogChange = (open: boolean) => {
    setShareDialogOpen(open);
    if (!open) {
      setCopyState("idle");
    }
  };

  const handleClearTimelineDialogChange = (open: boolean) => {
    setClearTimelineDialogOpen(open);
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareLink);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareLink;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch (error) {
      console.error("Failed to copy share link", error);
      setCopyState("error");
    }
  };

  const handleConfirmClearTimeline = () => {
    if (!mix) return;
    clearTimeline(mix.id);
    setClearTimelineDialogOpen(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTrackId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTrackId(null);
    const { active, over } = event;
    if (!over || !mix) return;

    const fromIndex = mix.tracks.findIndex((t) => t.id === active.id);
    const toIndex = mix.tracks.findIndex((t) => t.id === over.id);

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      setPendingMove({ trackId: active.id as string, fromIndex, toIndex });
      setMoveDialogOpen(true);
    }
  };

  const handleConfirmMove = () => {
    if (!mix || !pendingMove) return;
    moveTrack(mix.id, pendingMove.trackId, pendingMove.toIndex);
    setPendingMove(null);
    setMoveDialogOpen(false);
  };

  const handleCancelMove = () => {
    setPendingMove(null);
    setMoveDialogOpen(false);
  };

  const activeTrack = activeTrackId
    ? mix?.tracks.find((t) => t.id === activeTrackId)
    : null;

  if (!mix) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div>
          <p className="text-2xl font-semibold">Mix not found</p>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            It looks like this mix no longer exists on this device. Create a new
            one or head back home.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" asChild>
            <Link to="/">Back home</Link>
          </Button>
          <Button
            onClick={() => {
              const nextMix = createMix();
              navigate(`/mix/${nextMix.id}`);
            }}
          >
            Create mix
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center">
      {/* Main Timeline Area */}
      <div className="scrollbar-hide flex-1 overflow-auto p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <input
              value={mix.name}
              onChange={(event) => handleMixNameChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }
              }}
              className="text-center text-3xl font-bold outline-none focus-visible:ring-0"
              placeholder="Untitled Mix"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={importFileInputRef}
              type="file"
              accept=".nml"
              onChange={handleImportFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              type="button"
              title="Import from Traktor"
              onClick={handleImportClick}
            >
              <Upload className="h-4 w-4" />
              <span className="sr-only">Import from Traktor</span>
            </Button>
            <AlertDialog
              open={clearTimelineDialogOpen}
              onOpenChange={handleClearTimelineDialogChange}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  disabled={isTimelineEmpty}
                  title="Clear timeline"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Clear timeline</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear this timeline?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes every track from the timeline and resets the
                    starting key back to the default. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleConfirmClearTimeline}
                    disabled={isTimelineEmpty}
                  >
                    Clear timeline
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog
              open={shareDialogOpen}
              onOpenChange={handleShareDialogChange}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  title="Share mix"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share mix</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Share this mix</AlertDialogTitle>
                  <AlertDialogDescription>
                    Copy a link that recreates this timeline on another device.
                    Anyone opening it will get their own copy of these tracks.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {copyState === "error" && (
                  <p className="text-destructive text-sm">
                    Failed to copy the link automatically. Please copy it
                    manually.
                  </p>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel type="button">Close</AlertDialogCancel>
                  <Button
                    type="button"
                    onClick={handleCopyShareLink}
                    disabled={!shareLink}
                  >
                    {copyState === "copied" ? "Copied!" : "Copy Link"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Move Track Confirmation Dialog */}
        <AlertDialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Move this track?</AlertDialogTitle>
              <AlertDialogDescription>
                Moving this track will recalculate harmonic rules for all
                affected transitions. The relationships between surrounding
                tracks will update automatically.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelMove}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmMove}>
                Move track
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Track Timeline */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayTracks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col items-center">
              {trackTransitions.map(({ track, rule }, index) => (
                <SortableTrackItem
                  key={track.id}
                  track={track}
                  rule={rule}
                  index={index}
                  isSelected={track.id === selectedTrackId}
                  isLastTrack={index === displayTracks.length - 1}
                  isDragging={track.id === activeTrackId}
                  tracksCount={displayTracks.length}
                  onSelect={setSelectedTrackId}
                  onTitleChange={handleTrackTitleChange}
                  onDetailsChange={handleTrackDetailsChange}
                  onRemove={handleRemoveTrack}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeTrack && (
              <div className="pointer-events-none opacity-60">
                <div className="flex items-center gap-6 py-4">
                  <div className="flex w-32 flex-col items-end gap-4 text-right" />
                  <KeyNode keyName={formatOpenKey(activeTrack.key)} />
                  <div className="w-48">
                    <p className="font-medium">
                      {activeTrack.title || "Untitled"}
                    </p>
                    {activeTrack.details && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        {activeTrack.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {isTimelineEmpty ? (
          <Card className="mx-auto mt-8 max-w-xl">
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Starting Root Key
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Choose a root key to seed your timeline. We&apos;ll add the
                first track using the key you select below.
              </p>
              <div className="mt-4 flex flex-row flex-wrap gap-3">
                {rootKeyOptions.map((keyOption) => (
                  <button
                    key={`${keyOption.number}${keyOption.letter}`}
                    onClick={() => handleRootKeySelect(keyOption)}
                    className="hover:cursor-pointer"
                  >
                    <KeyNode size="sm" keyName={formatOpenKey(keyOption)} />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mx-auto mt-8 max-w-xl">
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Suggested Next Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              {harmonicSuggestions.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Unable to analyze key {anchorKey}. Try selecting another
                  track.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {harmonicSuggestions.map((suggestion) => (
                    <div
                      key={`${suggestion.id}-${suggestion.keyLabel}`}
                      className="hover:bg-secondary flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors"
                      onClick={() => handleSuggestedKeyClick(suggestion)}
                    >
                      <KeyNode keyName={suggestion.keyLabel} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{suggestion.name}</p>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {suggestion.type && (
                            <TransitionTypeBadge value={suggestion.type} />
                          )}
                          {suggestion.mood && (
                            <TransitionMoodBadge value={suggestion.mood} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <form
                    key={customHarmonicSuggestion.id}
                    onSubmit={handleCustomKeySubmit}
                    className="border-border/60 rounded-lg border border-dashed p-3 sm:col-start-2"
                  >
                    <div className="flex items-center gap-4">
                      <EditableKeyNode
                        value={customKeyValue}
                        onChange={(value) => {
                          setCustomKeyValue(value);
                          if (customKeyError) {
                            setCustomKeyError(null);
                          }
                        }}
                        isInvalid={Boolean(customKeyError)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {customHarmonicSuggestion.name}
                          </p>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {customHarmonicSuggestion.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <Button type="submit" size="sm">
                            Add
                          </Button>
                        </div>
                        {customKeyError && (
                          <p className="text-destructive mt-2 text-xs">
                            {customKeyError}
                          </p>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="mt-8 pb-6 text-center">
          <button
            type="button"
            onClick={openAboutDialog}
            className="text-muted-foreground/60 hover:text-muted-foreground text-sm transition-colors"
          >
            Questions or feedback? Get in touch
          </button>
        </footer>
      </div>
    </div>
  );
}
