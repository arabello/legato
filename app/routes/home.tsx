import { useNavigate, useOutletContext } from "react-router";
import { Plus, TrendingUp, Zap, Music, Waves } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
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
    id: "smooth-transition",
    name: "Smooth Transition",
    description: "Gradual energy build-up over 1 hour",
    icon: TrendingUp,
    keys: ["7m", "8d", "5m", "6d"],
    moreCount: 4,
    popular: false,
  },
  {
    id: "high-energy",
    name: "High Energy",
    description: "Peak time bangers and rapid mixing",
    icon: Zap,
    keys: ["4A", "5A", "6A", "7A"],
    moreCount: 8,
    popular: false,
  },
  {
    id: "camelot-circle",
    name: "Camelot Circle",
    description: "Harmonic journey through all keys",
    icon: Music,
    keys: ["1A", "2A", "3A", "4A"],
    moreCount: 20,
    popular: true,
  },
  {
    id: "deep-dive",
    name: "Deep Dive",
    description: "Hypnotic rhythms and minor keys",
    icon: Waves,
    keys: ["9m", "10m", "11m", "12m"],
    moreCount: 6,
    popular: false,
  },
];

function KeyBadge({ keyName }: { keyName: string }) {
  const isMinor = keyName.toLowerCase().endsWith("m");
  return (
    <span
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-medium ${
        isMinor
          ? "bg-key-minor/20 text-key-minor"
          : "bg-key-major/20 text-key-major"
      }`}
    >
      {keyName}
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { createMix } = useOutletContext<AppLayoutContext>();

  const handleCreateMix = () => {
    const mix = createMix();
    navigate(`/mix/${mix.id}`);
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
        <Button size="lg" className="gap-2" onClick={handleCreateMix}>
          <Plus className="h-4 w-4" />
          Create New Mix
        </Button>
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
    </div>
  );
}
