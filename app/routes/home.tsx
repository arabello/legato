import * as React from "react";
import { useNavigate, useOutletContext } from "react-router";
import { Plus, TrendingUp, Zap, Music, Waves, Upload } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { getKeyColor } from "~/core/key-colors";
import type { Route } from "./+types/home";
import type { AppLayoutContext } from "./layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Legato - Harmonic Mixing Reimagined" },
    {
      name: "description",
      content: "Craft seamless DJ sets with advanced harmonic analysis",
    },
  ];
}

const templates = [
  {
    id: "adjacent-flow",
    name: "Adjacent Flow",
    description:
      "Ride clockwise neighbors (±1) for butter-smooth phrasing and steady tension.",
    icon: TrendingUp,
    keys: ["7m", "8m", "9m", "10m"],
    moreCount: 8,
    popular: true,
  },
  {
    id: "relative-lift",
    name: "Relative Mood Lift",
    description:
      "Alternate minor ↔ relative major (same number) to brighten vocals without clashes.",
    icon: Waves,
    keys: ["8m", "8d", "9d", "9m"],
    moreCount: 6,
    popular: false,
  },
  {
    id: "energy-boost",
    name: "Energy Boost",
    description:
      "Use +7/+2 jumps for semitone cross-wheel spikes—perfect for peak-time drops.",
    icon: Zap,
    keys: ["8m", "3m", "10m", "5m"],
    moreCount: 4,
    popular: false,
  },
  {
    id: "tension-release",
    name: "Tension & Release",
    description:
      "Creep through minors, then resolve into parallel/relative majors for payoff.",
    icon: Music,
    keys: ["9m", "10m", "10d", "9d"],
    moreCount: 5,
    popular: false,
  },
];

function KeyBadge({ keyName }: { keyName: string }) {
  const color = getKeyColor(keyName);
  return (
    <span
      className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border px-2 text-xs font-semibold"
      style={{
        borderColor: color,
        color,
        backgroundColor: `${color}1a`,
      }}
    >
      {keyName}
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { createMix, importMixFromNml, openAboutDialog } =
    useOutletContext<AppLayoutContext>();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCreateMix = () => {
    const mix = createMix();
    navigate(`/mix/${mix.id}`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        const mix = importMixFromNml(content);
        if (mix) {
          navigate(`/mix/${mix.id}`);
        }
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be selected again
    event.target.value = "";
  };

  const handleTemplateClick = (template: (typeof templates)[number]) => {
    const mix = createMix({ name: template.name, keys: template.keys });
    navigate(`/mix/${mix.id}`);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 pt-16 pb-8">
        {/* Headline */}
        <h1 className="mb-4 text-center text-5xl font-bold tracking-tight">
          <span className="from-primary bg-linear-to-r to-orange-400 bg-clip-text text-transparent italic">
            Harmonic Mixing
          </span>
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8 max-w-lg text-center text-lg">
          Visualize key compatibility and energy levels for your seamless DJ
          sets.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Button size="lg" className="gap-2" onClick={handleCreateMix}>
            <Plus className="h-4 w-4" />
            Create New Mix
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".nml"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={handleImportClick}
          >
            <Upload className="h-4 w-4" />
            Import from Traktor
          </Button>
        </div>
      </div>

      {/* Templates Section */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-lg font-semibold">Start from a template</h2>

          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                role="button"
                tabIndex={0}
                onClick={() => handleTemplateClick(template)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleTemplateClick(template);
                  }
                }}
                className="hover:bg-secondary/50 focus-visible:ring-ring relative cursor-pointer transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold">{template.name}</h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {template.keys.map((key) => (
                          <KeyBadge key={key} keyName={key} />
                        ))}
                        <span className="text-muted-foreground text-sm">
                          +{template.moreCount} more
                        </span>
                      </div>
                    </div>
                    <div className="bg-secondary ml-4 flex h-10 w-10 items-center justify-center rounded-lg">
                      <template.icon className="text-muted-foreground h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 pb-6 text-center">
        <button
          type="button"
          onClick={openAboutDialog}
          className="text-muted-foreground/60 hover:text-muted-foreground text-sm transition-colors"
        >
          Questions or feedback? Get in touch
        </button>
      </footer>
    </div>
  );
}
