import * as React from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router";
import { Plus, Layers, Flame, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/mix";
import type { AppLayoutContext } from "./layout";
import type { EnergyLevel } from "~/core/mix-storage";
import {
  getHarmonicSuggestions,
  type HarmonicMood,
  type HarmonicRuleType,
  type HarmonicSuggestion,
} from "~/core/rules";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Mix Editor - Legato` },
    { name: "description", content: "Edit your harmonic mix" },
  ];
}

function KeyNode({
  keyName,
  isActive = false,
  size = "md",
}: {
  keyName: string;
  isActive?: boolean;
  size?: "sm" | "md";
}) {
  const isMinor = keyName.toLowerCase().endsWith("m");
  const sizeClasses = size === "sm" ? "h-10 w-10 text-sm" : "h-14 w-14 text-lg";

  return (
    <div
      className={`flex items-center justify-center rounded-lg border-2 font-semibold ${sizeClasses} ${
        isActive
          ? "border-primary bg-primary/10 text-primary"
          : isMinor
            ? "border-key-minor bg-key-minor/10 text-key-minor"
            : "border-key-major bg-key-major/10 text-key-major"
      }`}
    >
      {keyName}
    </div>
  );
}

function EnergyIndicator({ energy }: { energy: EnergyLevel }) {
  const config = {
    smooth: { icon: Layers, color: "text-energy-smooth", label: "Maintains" },
    impact: { icon: Flame, color: "text-energy-impact", label: "Boosts" },
    tension: { icon: Zap, color: "text-energy-tension", label: "Tension" },
  };

  const { icon: Icon, color, label } = config[energy];

  return (
    <div className={`flex items-center gap-1 text-sm ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </div>
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

const capitalize = (value: string) =>
  value.slice(0, 1).toUpperCase() + value.slice(1);

const suggestionEnergy = (suggestion: HarmonicSuggestion): EnergyLevel => {
  if (suggestion.mood === "tension") {
    return "tension";
  }
  return suggestion.type === "impact" ? "impact" : "smooth";
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

  const handleSuggestedKeyClick = (suggestion: HarmonicSuggestion) => {
    if (!mix) return;
    addKeyToMix(mix.id, suggestion.key, {
      relationship: suggestion.name,
      label: capitalize(suggestion.mood),
      energy: suggestionEnergy(suggestion),
      ruleType: suggestion.type,
      mood: suggestion.mood,
    });
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

  const anchorKey =
    mix.tracks[mix.tracks.length - 1]?.key || mix.startKey || "1m";
  const harmonicSuggestions = getHarmonicSuggestions(anchorKey);
  const trackSignature = mix.tracks.map((track) => track.id).join("|");

  React.useEffect(() => {
    setSelectedTrackId((current) => {
      if (current && mix.tracks.some((track) => track.id === current)) {
        return current;
      }
      return mix.tracks[0]?.id ?? null;
    });
  }, [mix.id, trackSignature]);

  return (
    <div className="flex h-full">
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
        <div className="mx-auto max-w-md">
          <div className="relative">
            {mix.tracks.map((track, index) => {
              const isSelected = track.id === selectedTrackId;
              return (
                <div
                  key={track.id}
                  className="relative"
                  onClick={() => setSelectedTrackId(track.id)}
                >
                  {/* Connector Line */}
                  {index > 0 && (
                    <div className="bg-border absolute top-0 left-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-8" />
                  )}

                  {/* Track Node */}
                  <div className="flex items-center gap-6 py-4">
                    {/* Left side - Relationship info */}
                    <div className="flex w-32 flex-col items-end text-right">
                      {index > 0 && track.label && (
                        <Badge
                          variant="outline"
                          className="border-muted-foreground/30 mb-1 text-xs"
                        >
                          {track.label}
                        </Badge>
                      )}
                      {(index > 0 || track.relationship) && (
                        <>
                          <span className="text-muted-foreground text-sm">
                            {track.relationship}
                          </span>
                          {index > 0 && (
                            <EnergyIndicator
                              energy={track.energy ?? "smooth"}
                            />
                          )}
                        </>
                      )}
                      {index > 0 && track.ruleType && (
                        <div className="mt-2 flex flex-wrap justify-end">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${flowChipClasses(track.ruleType)}`}
                          >
                            {track.ruleType === "impact" ? (
                              <Flame className="h-3 w-3" />
                            ) : (
                              <Layers className="h-3 w-3" />
                            )}
                            {capitalize(track.ruleType)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Key Node */}
                    <KeyNode keyName={track.key} isActive={isSelected} />

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
                        onFocus={() => setSelectedTrackId(track.id)}
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
                        onFocus={() => setSelectedTrackId(track.id)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Track Button */}
            <div className="relative py-4">
              <div className="bg-border absolute top-0 left-1/2 h-4 w-0.5 -translate-x-1/2" />
              <div className="flex justify-center">
                <button className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105">
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Next Keys */}
        <Card className="mx-auto mt-8 max-w-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Suggested Next Keys
              </CardTitle>
              <span className="text-muted-foreground text-sm">
                Based on {anchorKey}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {harmonicSuggestions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Unable to analyze key {anchorKey}. Try selecting another track.
              </p>
            ) : (
              harmonicSuggestions.map((suggestion) => (
                <div
                  key={`${suggestion.id}-${suggestion.key}`}
                  className="hover:bg-secondary flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors"
                  onClick={() => handleSuggestedKeyClick(suggestion)}
                >
                  <KeyNode keyName={suggestion.key} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{suggestion.name}</p>
                      <span className="text-muted-foreground text-xs">
                        {anchorKey} → {suggestion.key}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
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
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${moodStyles[suggestion.mood]}`}
                      >
                        {capitalize(suggestion.mood)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Energy Legend Panel */}
      <div className="border-border w-64 border-l p-6">
        <h3 className="text-muted-foreground mb-4 text-sm font-medium tracking-wider uppercase">
          Energy Legend
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="text-energy-smooth h-4 w-4" />
              <span className="text-sm">Smooth</span>
            </div>
            <span className="text-muted-foreground text-xs">
              Maintains energy
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="text-energy-impact h-4 w-4" />
              <span className="text-sm">Impact</span>
            </div>
            <span className="text-muted-foreground text-xs">Boosts energy</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="text-energy-tension h-4 w-4" />
              <span className="text-sm">Tension</span>
            </div>
            <span className="text-muted-foreground text-xs">
              Creates dissonance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
