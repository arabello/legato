import {
  TransitionMoodBadge,
  TransitionTypeBadge,
} from "~/components/transition-badges";
import type { Route } from "./+types/documentation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Documentation - Legato" },
    { name: "description", content: "Legato documentation" },
  ];
}

const usageSteps = [
  {
    title: "Create or load a mix",
    description:
      "Start from the Home page by tapping “Create New Mix” for a blank canvas or pick a template to prefill a timeline with keys that already flow together.",
  },
  {
    title: "Describe each track",
    description:
      "Rename every slot with the track title and optional notes so you remember why it fits the story (e.g., intro vocal, peak-time stab, closing anthem).",
  },
  {
    title: "Review the suggested transitions",
    description:
      "The suggestions panel shows the next key following the harmonic mixings rules, highlighting the transition type and mood.",
  },
  {
    title: "Add or override keys",
    description:
      "Click a suggestion to append it to the timeline, or use the “Custom” option to enter your own root note.",
  },
  {
    title: "Share or iterate",
    description:
      "Use the share button to copy a Legato link and gather feedback, then keep adjusting until the entire arc of your set feels intentional.",
  },
];

export default function Documentation() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4">
          <p className="text-primary text-sm font-semibold tracking-wider uppercase">
            Documentation
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Design harmonic DJ sets with confidence
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Legato helps you plan transitions that stay in key, feel
            intentional, and keep the dancefloor energy under your control.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">
            Harmonic mixing blends tracks whose basslines, chords, and melodies
            align musically, creating seamless transitions that keep the energy
            flowing. Based on{" "}
            <a
              href="https://blog.native-instruments.com/harmonic-mixing-rules-and-how-to-break-them/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              harmonic mixing principles
            </a>
            , Legato helps you navigate the Camelot wheel to find compatible
            keys and create smooth transitions between tracks. share compatible
            notes. Legato translates the{" "}
            <a
              href="https://mixedinkey.com/camelot-wheel/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Camelot/Open Key wheel
            </a>{" "}
            (numbers 1–12 with “m” for minor and “d” for major) into practical
            suggestions so you can move between adjacent keys for smooth mixes,
            jump to relatives for mood shifts, or trigger high-energy
            modulations without second-guessing the theory.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How to use the app</h2>
          <p className="text-muted-foreground leading-relaxed">
            Work through the steps below whenever you prepare a new set. Every
            action happens inside the mix editor, and each timeline entry
            represents one track in the order you intend to perform it.
          </p>
          <ol className="list-decimal space-y-4 ps-4">
            {usageSteps.map((step) => (
              <li key={step.title} className="px-4 py-2">
                <div className="font-medium">{step.title}</div>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Interpreting suggestions</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every suggestion shows the next key plus two important badges. Treat
            them as quick-reading cues: <strong>Type</strong> explains how the
            blend should be executed, while <strong>Mood</strong> hints at what
            the crowd will feel.
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex flex-row items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">Transition type</h3>
                <div className="flex flex-row gap-2">
                  <TransitionTypeBadge value="smooth" showIcon={false} />
                  <TransitionTypeBadge value="impact" showIcon={false} />
                </div>
              </div>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                A <TransitionTypeBadge value="smooth" showIcon={false} /> badge
                means both tracks can overlap for entire phrases—think adjacent
                keys, relative swaps, or staying in the same code. A{" "}
                <TransitionTypeBadge value="impact" showIcon={false} /> badge
                signals a planned jolt: semitone jumps, parallel moves, or other
                dramatic switches that should be executed quickly (cuts, drops,
                or effect-driven moments). Choose the badge that matches how you
                want the next transition to feel under your fingers.
              </p>
            </div>
            <div>
              <div className="flex flex-row items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">Transition mood</h3>
                <div className="flex flex-row gap-2">
                  <TransitionMoodBadge value="neutral" />
                  <TransitionMoodBadge value="tension" />
                  <TransitionMoodBadge value="moodier" />
                  <TransitionMoodBadge value="happier" />
                </div>
              </div>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Mood badges forecast the emotional swing caused by the key
                change. <TransitionMoodBadge value="neutral" /> keeps the story
                steady, <TransitionMoodBadge value="tension" /> injects urgency,
                <TransitionMoodBadge value="moodier" /> deepens the darkness,
                and <TransitionMoodBadge value="happier" /> opens up a brighter
                release. Match the badge to the crowd’s needs—reach for happier
                or neutral when you want relief, lean into tension or moodier
                when you need suspense.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Practical tips</h2>
          <p className="text-muted-foreground leading-relaxed">
            Build short clusters of adjacent keys to keep a groove running, then
            drop an impact transition when you crave a peak moment. Keep an eye
            on letter changes (m ↔ d) to orchestrate minor→major mood swings
            without clashes, and do quick EQ-heavy swaps whenever you
            intentionally break the rules. Exporting a share link after each
            rehearsal captures your current plan so you can compare revisions
            before showtime.
          </p>
        </section>
      </div>
    </div>
  );
}
