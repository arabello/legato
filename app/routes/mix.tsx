import { ChevronDownIcon, Flame, Layers, MinusIcon, Plus } from "lucide-react";
import * as React from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { describeTransition, type MixTrack } from "~/core/mix-storage";
import { formatOpenKey, openKeyFromString } from "~/core/openKey";
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
  const { mixes, addKeyToMix, createMix, updateMixName, updateTrack } =
    useOutletContext<AppLayoutContext>();
  const mix = mixes.find((entry) => entry.id === id);
  const [selectedTrackId, setSelectedTrackId] = React.useState<string | null>(
    null,
  );
  const [customKeyValue, setCustomKeyValue] = React.useState("");
  const [customKeyError, setCustomKeyError] = React.useState<string | null>(
    null,
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

  const trackSignature = mix?.tracks.map((track) => track.id).join("|") ?? "";
  const anchorOpenKey =
    mix?.tracks[mix.tracks.length - 1]?.key || mix?.startKey;
  const anchorKey = anchorOpenKey ? formatOpenKey(anchorOpenKey) : "1m";

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
        <div className="mb-8">
          <div className="text-center">
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
        </div>

        {/* Track Timeline */}
        <div className="flex flex-col items-center">
          {trackTransitions.map(({ track, rule }, index) => {
            const ruleType = rule?.type;
            const ruleMood = rule?.mood;
            const isSelected = track.id === selectedTrackId;
            return (
              <>
                <div
                  key={track.id}
                  className="relative"
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
                    <KeyNode keyName={formatOpenKey(track.key)} />

                    {/* Right side - Track info */}
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
                          handleTrackDetailsChange(track.id, event.target.value)
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
                  </div>
                </div>
                {/* Separator */}
                {
                  <MinusIcon className="text-muted-foreground/30 h-4 w-4 -rotate-90" />
                }

                {/* Add Track Button */}
                {index === mix.tracks.length - 1 && (
                  <div className="mt-5 flex justify-center">
                    <button className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105">
                      <Plus className="h-6 w-6" />
                    </button>
                  </div>
                )}
              </>
            );
          })}
        </div>

        {/* Suggested Next Keys */}
        <Card className="mx-auto mt-8 max-w-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Suggested Next Keys
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {harmonicSuggestions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Unable to analyze key {anchorKey}. Try selecting another track.
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
                  className="p-3 sm:col-start-2"
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
                    <div className="flex flex-1 flex-row justify-between">
                      <div className="flex flex-col">
                        <p className="font-medium">
                          {customHarmonicSuggestion.name}
                        </p>
                        {customKeyError && (
                          <p className="text-destructive text-xs">
                            {customKeyError}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="submit" size="sm">
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
