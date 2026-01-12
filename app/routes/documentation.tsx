import type { Route } from "./+types/documentation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Documentation - Legato" },
    { name: "description", content: "Legato documentation" },
  ];
}

export default function Documentation() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-semibold">Documentation</h1>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
