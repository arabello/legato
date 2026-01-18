import * as React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  Home,
  FileText,
  Plus,
  AudioWaveform,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
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
import {
  appendTrack,
  clearMixTimeline,
  createMixRecord,
  createMixFromNml,
  loadMixes,
  moveTrack as moveTrackInMix,
  removeTrack as removeTrackFromMix,
  saveMixes,
  renameMix,
  updateTrackInfo,
  type CreateMixOptions,
  type Mix,
} from "~/core/mix-storage";
import { parseNmlFile } from "~/core/nml-parser";
import { formatOpenKey, type OpenKey } from "~/core/openKey";

export type AppLayoutContext = {
  mixes: Mix[];
  hydrated: boolean;
  createMix: (options?: CreateMixOptions) => Mix;
  deleteMix: (mixId: string) => void;
  deleteAllMixes: () => void;
  addKeyToMix: (mixId: string, key: OpenKey) => void;
  updateMixName: (mixId: string, name: string) => void;
  updateTrack: (
    mixId: string,
    trackId: string,
    updates: Parameters<typeof updateTrackInfo>[2],
  ) => void;
  clearTimeline: (mixId: string) => void;
  removeTrack: (mixId: string, trackId: string) => void;
  moveTrack: (mixId: string, trackId: string, toIndex: number) => void;
  importMixFromNml: (nmlContent: string) => Mix | null;
  openAboutDialog: () => void;
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mixes, setMixes] = React.useState<Mix[]>([]);
  const [hydrated, setHydrated] = React.useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = React.useState(false);
  const [emailCopyState, setEmailCopyState] = React.useState<
    "idle" | "copied" | "error"
  >("idle");

  const openAboutDialog = React.useCallback(() => {
    setAboutDialogOpen(true);
    setEmailCopyState("idle");
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("matteo.pelle.pellegrino@gmail.com");
      setEmailCopyState("copied");
      setTimeout(() => setEmailCopyState("idle"), 2000);
    } catch {
      setEmailCopyState("error");
    }
  };

  React.useEffect(() => {
    const stored = loadMixes();
    if (stored.length > 0) {
      setMixes(stored);
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    saveMixes(mixes);
  }, [hydrated, mixes]);

  const createMix = React.useCallback(
    (options?: CreateMixOptions) => {
      const newMix = createMixRecord(options);
      setMixes((prev) => [...prev, newMix]);
      return newMix;
    },
    [setMixes],
  );

  const deleteMix = React.useCallback(
    (mixId: string) => {
      setMixes((prev) => prev.filter((mix) => mix.id !== mixId));
      if (location.pathname === `/mix/${mixId}`) {
        navigate("/");
      }
    },
    [location.pathname, navigate],
  );

  const deleteAllMixes = React.useCallback(() => {
    setMixes([]);
    if (location.pathname.startsWith("/mix/")) {
      navigate("/");
    }
  }, [location.pathname, navigate]);

  const addKeyToMix = React.useCallback((mixId: string, key: OpenKey) => {
    setMixes((prev) =>
      prev.map((mix) => (mix.id === mixId ? appendTrack(mix, key) : mix)),
    );
  }, []);

  const updateMixName = React.useCallback((mixId: string, name: string) => {
    setMixes((prev) =>
      prev.map((mix) => (mix.id === mixId ? renameMix(mix, name) : mix)),
    );
  }, []);

  const updateTrack = React.useCallback(
    (
      mixId: string,
      trackId: string,
      updates: Parameters<typeof updateTrackInfo>[2],
    ) => {
      setMixes((prev) =>
        prev.map((mix) =>
          mix.id === mixId ? updateTrackInfo(mix, trackId, updates) : mix,
        ),
      );
    },
    [],
  );

  const removeTrack = React.useCallback((mixId: string, trackId: string) => {
    setMixes((prev) =>
      prev.map((mix) =>
        mix.id === mixId ? removeTrackFromMix(mix, trackId) : mix,
      ),
    );
  }, []);

  const moveTrack = React.useCallback(
    (mixId: string, trackId: string, toIndex: number) => {
      setMixes((prev) =>
        prev.map((mix) =>
          mix.id === mixId ? moveTrackInMix(mix, trackId, toIndex) : mix,
        ),
      );
    },
    [],
  );

  const clearTimeline = React.useCallback((mixId: string) => {
    setMixes((prev) =>
      prev.map((mix) => (mix.id === mixId ? clearMixTimeline(mix) : mix)),
    );
  }, []);

  const importMixFromNml = React.useCallback(
    (nmlContent: string): Mix | null => {
      try {
        const playlist = parseNmlFile(nmlContent);
        const newMix = createMixFromNml({ playlist });
        setMixes((prev) => [...prev, newMix]);
        return newMix;
      } catch (error) {
        console.error("Failed to import NML file", error);
        return null;
      }
    },
    [setMixes],
  );

  const contextValue = React.useMemo<AppLayoutContext>(
    () => ({
      mixes,
      hydrated,
      createMix,
      deleteMix,
      deleteAllMixes,
      addKeyToMix,
      updateMixName,
      updateTrack,
      clearTimeline,
      removeTrack,
      moveTrack,
      importMixFromNml,
      openAboutDialog,
    }),
    [
      mixes,
      hydrated,
      createMix,
      deleteMix,
      deleteAllMixes,
      addKeyToMix,
      updateMixName,
      updateTrack,
      clearTimeline,
      removeTrack,
      moveTrack,
      importMixFromNml,
      openAboutDialog,
    ],
  );

  const handleCreateMix = React.useCallback(() => {
    const newMix = createMix();
    navigate(`/mix/${newMix.id}`);
  }, [createMix, navigate]);

  return (
    <div className="bg-background flex h-screen w-full">
      {/* Sidebar */}
      <aside className="border-sidebar-border bg-sidebar flex w-56 flex-col border-r">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <AudioWaveform className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="text-foreground text-lg font-semibold">Legato</span>
        </div>

        {/* New Mix Button */}
        <div className="px-3 pb-4">
          <Button
            className="w-full justify-start gap-2"
            size="sm"
            onClick={handleCreateMix}
          >
            <Plus className="h-4 w-4" />
            New Mix
          </Button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 px-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
              }`
            }
          >
            <Home className="h-4 w-4" />
            Home
          </NavLink>
          <NavLink
            to="/documentation"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
              }`
            }
          >
            <FileText className="h-4 w-4" />
            Documentation
          </NavLink>
          <button
            type="button"
            onClick={openAboutDialog}
            className="text-sidebar-foreground hover:bg-secondary hover:text-foreground flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            About
          </button>
        </nav>

        {/* My Mixes */}
        <div className="mt-6 flex-1 overflow-hidden px-3">
          <div className="group mb-2 flex items-center justify-between px-3">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              My Mixes
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-white focus-visible:opacity-100"
                  type="button"
                >
                  Delete all
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all mixes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes every mix stored on this device. The action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={deleteAllMixes}
                  >
                    Delete all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <ScrollArea className="h-[calc(100%-2rem)] pr-2">
            {mixes.length === 0 ? (
              <p className="text-muted-foreground px-3 py-6 text-sm">
                No mixes yet. Start by creating one.
              </p>
            ) : (
              <div className="space-y-1">
                {mixes.map((mix) => {
                  const isActive = location.pathname === `/mix/${mix.id}`;
                  return (
                    <div key={mix.id} className="group relative">
                      <NavLink
                        to={`/mix/${mix.id}`}
                        className={`block rounded-md px-3 py-2 pr-10 transition-colors ${
                          isActive
                            ? "border-primary bg-secondary border"
                            : "hover:bg-secondary"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${isActive ? "text-foreground" : "text-sidebar-foreground"}`}
                          >
                            {mix.name}
                          </span>
                          {isActive && (
                            <span className="bg-primary h-2 w-2 rounded-full" />
                          )}
                        </div>
                        <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                          <span className="text-primary">
                            {formatOpenKey(mix.startKey)}
                          </span>
                          <span>•</span>
                          <span className="truncate">
                            {mix.tracks[0]?.details || "Add notes"}
                          </span>
                        </div>
                      </NavLink>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive absolute top-1/2 right-1 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete mix</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete this mix?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The mix{" "}
                              <span className="font-semibold">{mix.name}</span>{" "}
                              will be removed from this device.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteMix(mix.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet context={contextValue} />
      </main>

      {/* About Dialog */}
      <AlertDialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>About Legato</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  As a DJ who relies on harmonic mixing, I wanted a simple tool
                  to plan my sets with confidence. Legato was born from that
                  need—helping you visualize key transitions, experiment with
                  track order, and build sets that flow naturally.
                </p>
                <p>
                  Have questions, feedback, or ideas? I'd love to hear from you.
                  Reach out anytime at:
                </p>
                <p className="text-foreground font-medium">
                  matteo.pelle.pellegrino@gmail.com
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={handleCopyEmail}>
              {emailCopyState === "copied" ? "Copied!" : "Copy Email"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
