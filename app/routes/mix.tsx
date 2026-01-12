import { Flame, Layers, MinusIcon, Plus, Trash2, Share2 } from "lucide-react";
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
  type HarmonicMood,
  type HarmonicRuleDefinition,
  type HarmonicRuleType,
  type HarmonicSuggestion,
} from "~/core/rules";
import type { Route } from "./+types/mix";
import type { AppLayoutContext } from "./layout";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Mix Editor - Legato` },
    { name: "description", content: "Edit your harmonic mix" },
  ];
}

const keyColors: Record<string, string> = {
  "1m": "#FF1AF1",
  "2m": "#B85FFF",
  "3m": "#068CFF",
  "4m": "#00CDFF",
  "5m": "#00EBE9",
  "6m": "#00D989",
  "7m": "#00FF00",
  "8m": "#70FF00",
  "9m": "#FFD400",
  "10m": "#FF8500",
  "11m": "#FF5500",
  "12m": "#FF2F3E",
  "1d": "#FF1AF1",
  "2d": "#B85FFF",
  "3d": "#068CFF",
  "4d": "#00CDFF",
  "5d": "#00EBE9",
  "6d": "#00D989",
  "7d": "#00FF00",
  "8d": "#70FF00",
  "9d": "#FFD400",
  "10d": "#FF8500",
  "11d": "#FF5500",
  "12d": "#FF2F3E",
};

function KeyNode({
  keyName,
  size = "md",
}: {
  keyName: string;
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "sm" ? "h-10 w-10 text-sm" : "h-14 w-14 text-lg";
  const color = keyColors[keyName.toLowerCase()] ?? "#9ca3af";

  return (
    <div
      className={`flex items-center justify-center rounded-lg border-2 font-semibold ${sizeClasses}`}
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

const flowChipClasses = (type: HarmonicRuleType) =>
  type === "impact"
    ? "bg-energy-impact/20 text-energy-impact"
    : "bg-energy-smooth/20 text-energy-smooth";

const moodStyles: Record<HarmonicMood, string> = {
  neutral: "bg-muted/30 text-muted-foreground",
  tension: "bg-energy-tension/20 text-energy-tension",
  moodier: "bg-key-minor/20 text-key-minor",
  happier: "bg-key-major/20 text-key-major",
};

const capitalize = (value?: string) =>
  value ? value.slice(0, 1).toUpperCase() + value.slice(1) : "";

type MixSuggestion = HarmonicSuggestion & {
  keyLabel: string;
};

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
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">(
    "idle",
  );

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
    return mix.tracks.map((track, index) => {
      const previousKey = mix.tracks[index - 1]?.key;
      return {
        track,
        rule: describeTransition(previousKey, track.key),
      };
    });
  }, [mix, trackSignature]);

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
    const url = new URL(window.location.origin + `/mix/${mix.id}`);
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

        {/* Track Timeline */}
        <div className="flex flex-col items-center">
          {trackTransitions.map(({ track, rule }, index) => {
            const ruleType = rule?.type;
            const ruleMood = rule?.mood;
            const isSelected = track.id === selectedTrackId;
            const isLastTrack = index === mix.tracks.length - 1;
            return (
              <React.Fragment key={track.id}>
                <div
                  className="group relative"
                  onClick={() => setSelectedTrackId(track.id)}
                >
                  {/* Track Node */}
                  <div className="flex items-center gap-6 py-4">
                    {/* Left side - Relationship info */}
                    <div className="flex w-32 flex-col items-end gap-4 text-right">
                      {rule && (
                        <span className="text-muted-foreground text-sm">
                          {rule.name}
                        </span>
                      )}
                      {index > 0 && (
                        <div className="flex items-center gap-2">
                          {ruleType && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${flowChipClasses(ruleType)}`}
                            >
                              {ruleType === "impact" ? (
                                <Flame className="h-3 w-3" />
                              ) : (
                                <Layers className="h-3 w-3" />
                              )}
                              {capitalize(ruleType)}
                            </span>
                          )}
                          {ruleMood && (
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${moodStyles[ruleMood]}`}
                            >
                              {capitalize(ruleMood)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Key Node */}
                    <KeyNode
                      keyName={formatOpenKey(track.key)}
                      isActive={isSelected}
                    />

                    {/* Right side - Track info */}
                    <div className="flex items-start gap-3">
                      <div className="w-48">
                        <input
                          value={track.title ?? ""}
                          onChange={(event) =>
                            handleTrackTitleChange(track.id, event.target.value)
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
                            handleTrackDetailsChange(
                              track.id,
                              event.target.value,
                            )
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove track</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove this track?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {isLastTrack
                                ? "This will permanently remove the final track from your timeline."
                                : "Removing this key will relink the harmonic rule between the surrounding tracks. The next track’s transition will refresh or disappear accordingly."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleRemoveTrack(track.id)}
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
          })}
        </div>

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
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${flowChipClasses(suggestion.type)}`}
                            >
                              {suggestion.type === "impact" ? (
                                <Flame className="h-3 w-3" />
                              ) : (
                                <Layers className="h-3 w-3" />
                              )}
                              {capitalize(suggestion.type)}
                            </span>
                          )}
                          {suggestion.mood && (
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${moodStyles[suggestion.mood]}`}
                            >
                              {capitalize(suggestion.mood)}
                            </span>
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
      </div>
    </div>
  );
}
