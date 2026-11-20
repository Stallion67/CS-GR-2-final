import { useMemo } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  Compass,
  Database,
  FlaskConical,
  Grid2X2,
  Leaf,
  MapPin,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  Play,
  Plus,
  Search,
  Sparkles,
  Sprout,
  Tags,
  X,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';

type View = 'overview' | 'herbarium' | 'capture' | 'evaluation';
type PlantStatus = 'Reconstructed' | 'In review' | 'Field note';
type CollectionLocation =
  | { status: 'verified'; label: string; verificationSource: string; verifiedBy: string }
  | { status: 'unknown'; reason: string };
type PlantImage =
  | { kind: 'field'; src: string; alt: string; contributor: string; attribution: string; consentScope: string }
  | { kind: 'illustration'; src: string; alt: string; source: string }
  | { kind: 'missing'; reason: string };
type Plant = {
  id: string;
  commonName: string;
  scientificName: string;
  localNames: string[];
  status: PlantStatus;
  photoCount: number;
  image: PlantImage;
  location: CollectionLocation;
  observation: { status: 'confirmed'; evidence: string } | { status: 'not-confirmed'; reason: string };
  use: string;
  lastUpdated: string;
};

type CaptureSession = {
  id: string;
  goat: string;
  district: string;
  frames: number;
  gps: string;
  imu: string;
  status: string;
  date: string;
};

type EvaluationMetric = {
  name: string;
  value: string;
  unit: string;
  benchmark: string;
  trend: string;
};

const queryClient = new QueryClient();

const unknownLocation: CollectionLocation = {
  status: 'unknown',
  reason: 'The supplied source chart does not include a collection location.',
};
const noFieldImage: PlantImage = {
  kind: 'missing',
  reason: 'No consented field photograph has been supplied.',
};
const noFieldObservation = {
  status: 'not-confirmed' as const,
  reason: 'The supplied source chart contains no verified field observation.',
};

const plants: Plant[] = [
  { id: 'hibiscus-01', commonName: 'Hibiscus', scientificName: 'Hibiscus rosa-sinensis', localNames: [], status: 'In review', photoCount: 820, image: noFieldImage, location: unknownLocation, observation: noFieldObservation, use: 'Awaiting consented community annotation', lastUpdated: 'Source chart' },
  { id: 'neem-02', commonName: 'Neem', scientificName: 'Azadirachta indica', localNames: [], status: 'In review', photoCount: 786, image: noFieldImage, location: unknownLocation, observation: noFieldObservation, use: 'Awaiting consented community annotation', lastUpdated: 'Source chart' },
  { id: 'tulsi-03', commonName: 'Tulsi', scientificName: 'Ocimum tenuiflorum', localNames: [], status: 'In review', photoCount: 399, image: noFieldImage, location: unknownLocation, observation: noFieldObservation, use: 'Awaiting consented community annotation', lastUpdated: 'Source chart' },
  { id: 'moringa-04', commonName: 'Moringa', scientificName: 'Moringa oleifera', localNames: [], status: 'In review', photoCount: 367, image: noFieldImage, location: unknownLocation, observation: noFieldObservation, use: 'Awaiting consented community annotation', lastUpdated: 'Source chart' },
  { id: 'aloe-05', commonName: 'Aloe vera', scientificName: 'Aloe vera', localNames: [], status: 'In review', photoCount: 235, image: noFieldImage, location: unknownLocation, observation: noFieldObservation, use: 'Awaiting consented community annotation', lastUpdated: 'Source chart' },
];

const totalLeafPhotos = plants.reduce((total, plant) => total + plant.photoCount, 0);

const sessions: CaptureSession[] = [
  { id: 'GB-240518', goat: 'Mokoto 07', district: 'Karamoja · Napak', frames: 1842, gps: 'Captured', imu: 'Captured', status: 'Ready to process', date: '18 May 2024' },
  { id: 'GB-240512', goat: 'Akiiki 12', district: 'Kisoro · Rubuguri', frames: 967, gps: 'Captured', imu: 'Partial', status: 'Needs review', date: '12 May 2024' },
  { id: 'GB-240503', goat: 'Lomodo 03', district: 'Gulu · Awach', frames: 2188, gps: 'Captured', imu: 'Captured', status: 'Reconstructed', date: '03 May 2024' },
];

const metrics: EvaluationMetric[] = [
  { name: 'Geometric accuracy', value: 'Not measured', unit: '', benchmark: 'Chamfer / Hausdorff vs. controlled capture', trend: 'Pending' },
  { name: 'View synthesis', value: 'Not measured', unit: '', benchmark: 'PSNR · SSIM · LPIPS on held-out views', trend: 'Pending' },
  { name: 'Mobile frame rate', value: 'Not measured', unit: 'FPS', benchmark: 'Target ≥ 30 FPS on mid-range Android', trend: 'Pending' },
  { name: 'Human usability', value: 'Not measured', unit: 'SUS', benchmark: 'Target > 68 with field participants', trend: 'Pending' },
];

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-10 w-10 place-items-center rounded-[14px] bg-[#e2aa46] text-[#18352a] shadow-[0_8px_22px_rgba(226,170,70,.18)]">
        <Leaf size={22} strokeWidth={2.3} />
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#18352a] bg-[#e76f51]" />
      </div>
      <div>
        <div className="font-display text-[24px] leading-[.8] tracking-[-.04em] text-[#f2ead7]">GoatBrowse</div>
        <div className="mt-1 font-mono-ui text-[9px] uppercase tracking-[.2em] text-[#aab9a6]">Herbarium / UG-01</div>
      </div>
    </div>
  );
}

function IconButton({ label, children, onClick, active = false }: { label: string; children: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button data-testid={`button-${label.toLowerCase().replaceAll(' ', '-')}`} aria-label={label} onClick={onClick} className={`grid h-9 w-9 place-items-center rounded-lg border transition ${active ? 'border-[#e2aa46] bg-[#e2aa46] text-[#18352a]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'}`}>
      {children}
    </button>
  );
}

function Sidebar({ view, setView, collapsed, setCollapsed }: { view: View; setView: (v: View) => void; collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const nav: { key: View; label: string; icon: ReactNode; note: string }[] = [
    { key: 'overview', label: 'Overview', icon: <Grid2X2 size={18} />, note: 'Field index' },
    { key: 'herbarium', label: 'Herbarium', icon: <Sprout size={18} />, note: '5 chart-only entries' },
    { key: 'capture', label: 'Field capture', icon: <Camera size={18} />, note: '03 active sessions' },
    { key: 'evaluation', label: 'Evaluation', icon: <BarChart3 size={18} />, note: 'Model health' },
  ];
  return (
    <aside className={`${collapsed ? 'lg:w-[82px]' : 'lg:w-[254px]'} relative z-10 flex w-full shrink-0 flex-col bg-[#18352a] text-[#eee5d1] transition-[width] duration-300`}>
      <div className="flex items-center justify-between px-5 py-6 lg:block lg:px-7 lg:py-8">
        <LogoMark />
        <button data-testid="button-collapse-sidebar" aria-label="Collapse sidebar" onClick={() => setCollapsed(!collapsed)} className="absolute right-5 top-6 hidden text-[#8ea897] transition hover:text-[#e2aa46] lg:block">
          {collapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
      <div className="hidden px-5 lg:block lg:px-4">
        <div className="mb-3 px-3 font-mono-ui text-[9px] uppercase tracking-[.18em] text-[#718a7a]">Workspace</div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <button data-testid={`nav-${item.key}`} key={item.key} onClick={() => setView(item.key)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${view === item.key ? 'bg-[#e2aa46] text-[#18352a]' : 'text-[#b8c5b8] hover:bg-[#274638] hover:text-[#f3ead7]'}`}>
              <span className={`${view === item.key ? '' : 'text-[#8fab91]'}`}>{item.icon}</span>
              {!collapsed && <span className="min-w-0"><span className="block text-[13px] font-semibold">{item.label}</span><span className={`mt-0.5 block text-[10px] ${view === item.key ? 'text-[#496246]' : 'text-[#718a7a]'}`}>{item.note}</span></span>}
            </button>
          ))}
        </nav>
      </div>
      <div className="hidden flex-1 lg:block" />
      <div className="hidden px-7 pb-8 lg:block">
        {!collapsed && <div className="mb-5 rounded-2xl border border-[#3c5b49] bg-[#203e31] p-4"><div className="flex items-center justify-between"><span className="font-mono-ui text-[9px] uppercase tracking-[.17em] text-[#91aa96]">Source chart</span><Activity size={14} className="text-[#e2aa46]" /></div><div className="mt-3 font-display text-[27px]">{totalLeafPhotos.toLocaleString()}</div><div className="mt-1 text-[11px] leading-4 text-[#a6b8a5]">Counts transcribed for five species; not verified field images.</div><div className="mt-3 flex gap-1">{plants.map((plant) => <span key={plant.id} className="h-1.5 flex-1 rounded-full bg-[#e2aa46]" />)}</div></div>}
        <div className="flex items-center gap-3 border-t border-[#355343] pt-5"><div className="grid h-8 w-8 place-items-center rounded-full bg-[#e87552] text-[11px] font-bold text-[#18352a]">AN</div>{!collapsed && <div><div className="text-[12px] font-semibold">Amina N.</div><div className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[#78927d]">Field researcher</div></div>}<MoreHorizontal size={17} className="ml-auto text-[#75907b]" /></div>
      </div>
      <div className="flex gap-1 overflow-x-auto px-3 pb-3 lg:hidden">{nav.map((item) => <button data-testid={`mobile-nav-${item.key}`} key={item.key} onClick={() => setView(item.key)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${view === item.key ? 'bg-[#e2aa46] text-[#18352a]' : 'bg-[#274638] text-[#b8c5b8]'}`}>{item.icon}{item.label}</button>)}</div>
    </aside>
  );
}

function Topbar({ view, onCapture, title, subtitle }: { view: View; onCapture: () => void; title?: string; subtitle?: string }) {
  const titles: Record<View, [string, string]> = { overview: ['Overview', 'Chart-listed species; field locations and images not supplied'], herbarium: ['Herbarium', 'Plant records from the supplied photo-count chart'], capture: ['Field capture', 'Trace the moment a specimen becomes data'], evaluation: ['Evaluation', 'Model quality against field truth'] };
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-5 py-4 md:px-9 md:py-5">
      <div>
        <div className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">
          <span>Project / UG-01</span><span className="text-[#d09c38]">·</span><span>Seed data</span>
        </div>
        <h1 className="mt-1 font-display text-[28px] leading-none tracking-[-.03em] text-[hsl(var(--foreground))] md:text-[32px]">{title ?? titles[view][0]}</h1>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{subtitle ?? titles[view][1]}</p>
      </div>
      <div className="flex items-center gap-2">
        <button data-testid="button-help" onClick={() => window.alert('GoatBrowse field guide: search, inspect, and compare reconstructed specimens.')} className="hidden h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] md:flex"><CircleHelp size={15} /> Field guide</button>
        <button data-testid="button-new-capture" onClick={onCapture} className="flex h-10 items-center gap-2 rounded-lg bg-[#e2aa46] px-3.5 text-xs font-bold text-[#18352a] shadow-[0_5px_16px_rgba(226,170,70,.2)] transition hover:-translate-y-0.5"><Plus size={16} /> New capture</button>
        <div className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-[#e87552] text-[11px] font-bold text-[#18352a] md:hidden">AN</div>
      </div>
    </header>
  );
}

function StatCard({ label, value, detail, accent = 'green', icon }: { label: string; value: string; detail: string; accent?: 'green' | 'gold' | 'coral'; icon: ReactNode }) {
  const tone = accent === 'gold' ? 'text-[#a56d18] bg-[#fbf0d0]' : accent === 'coral' ? 'text-[#b94f37] bg-[#f8e2d8]' : 'text-[#2f644d] bg-[#dbeadd]';
  return <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[0_4px_16px_rgba(40,65,47,.03)] md:p-5"><div className="flex items-start justify-between"><span className="font-mono-ui text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{label}</span><span className={`grid h-8 w-8 place-items-center rounded-lg ${tone}`}>{icon}</span></div><div className="mt-4 flex items-end gap-2"><strong className="font-display text-[34px] leading-none tracking-[-.04em]">{value}</strong><span className="mb-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">{detail}</span></div></div>;
}

function PlantArt({ plant, large = false }: { plant: Plant; large?: boolean }) {
  const imageLabel = plant.image.kind === 'field'
    ? 'Consented field photograph'
    : plant.image.kind === 'illustration'
      ? 'Illustration · not a field observation'
      : 'Field photograph not supplied';
  const locationLabel = plant.location.status === 'verified'
    ? plant.location.label
    : 'Collection location unknown';

  return <div className={`plant-visual relative ${large ? 'h-[230px] md:h-[278px]' : 'h-[150px]'} rounded-[14px]`}>
    {plant.image.kind === 'missing' ? (
      <div role="img" aria-label={`${plant.commonName}: ${plant.image.reason}`} className="absolute inset-0 grid place-items-center bg-[#e9e3d2] text-[#54715a]">
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <Sprout size={30} strokeWidth={1.5} />
          <span className="max-w-[220px] text-[11px] font-semibold">{plant.image.reason}</span>
        </div>
      </div>
    ) : (
      <>
        <img src={plant.image.src.startsWith('/') ? `${import.meta.env.BASE_URL}${plant.image.src.slice(1)}` : `${import.meta.env.BASE_URL}images/${plant.image.src}`} alt={plant.image.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
      </>
    )}
    <div className="absolute left-3 top-3 z-[1] rounded bg-[#f9f1df]/90 px-2 py-1 font-mono-ui text-[9px] uppercase tracking-[.12em] text-[#365241]">{imageLabel}</div>
    {plant.image.kind === 'illustration' && <div aria-hidden="true" className="absolute right-3 top-3 z-[1] rounded-full bg-[#f9f1df]/90 p-1.5 text-[#365241]"><Sparkles size={13} /></div>}
    <div className={`absolute bottom-3 left-3 z-[1] flex items-center gap-1 rounded bg-[#18352a]/80 px-2 py-1 font-mono-ui text-[9px] uppercase tracking-[.12em] ${plant.image.kind === 'missing' ? 'text-[#f4ead6]' : 'text-white'}`}><MapPin size={11} />{locationLabel}</div>
  </div>;
}

function StatusPill({ status }: { status: PlantStatus }) {
  const styles = status === 'Reconstructed' ? 'bg-[#dceadd] text-[#356347]' : status === 'In review' ? 'bg-[#fbefcf] text-[#956816]' : 'bg-[#f5dfd7] text-[#a94e38]';
  return <span data-testid={`status-${status.toLowerCase().replaceAll(' ', '-')}`} className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${styles}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
}

function Overview({ setView, openSpecies }: { setView: (v: View) => void; openSpecies: (p: Plant) => void }) {
  const [tab, setTab] = useState<'activity' | 'districts'>('activity');
  return <main className="field-grid animate-rise space-y-6 p-5 md:p-9">
    <section className="relative overflow-hidden rounded-[22px] bg-[#254c3a] p-6 text-[#f4ead6] shadow-[0_12px_30px_rgba(31,68,49,.12)] md:p-8"><div className="absolute -right-14 -top-24 h-72 w-72 rounded-full border-[28px] border-[#416c52]/40" /><div className="absolute -bottom-32 right-28 h-64 w-64 rounded-full border-[18px] border-[#e2aa46]/15" /><div className="relative max-w-2xl"><div className="mb-4 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.18em] text-[#c6d4bb]"><span className="h-1.5 w-1.5 rounded-full bg-[#e2aa46]" /> Source chart · five species</div><h2 className="font-display text-[39px] leading-[.98] tracking-[-.045em] md:text-[54px]">Reconstructing the plants<br /><span className="text-[#e2aa46]">that remember us.</span></h2><p className="mt-5 max-w-md text-[13px] leading-6 text-[#c6d2be]">Browse the species and counts in the supplied chart. Collection locations and consented field photographs are not provided, so no field observations are shown as confirmed.</p><div className="mt-6 flex flex-wrap gap-3"><button data-testid="button-open-herbarium" onClick={() => setView('herbarium')} className="flex items-center gap-2 rounded-lg bg-[#e2aa46] px-4 py-2.5 text-xs font-bold text-[#18352a] transition hover:bg-[#efbd61]">Explore herbarium <ArrowUpRight size={15} /></button><button data-testid="button-resume-capture" onClick={() => setView('capture')} className="flex items-center gap-2 rounded-lg border border-[#719377] px-4 py-2.5 text-xs font-semibold text-[#d9e1d0] transition hover:border-[#e2aa46] hover:text-[#e2aa46]"><Play size={14} /> Capture workflow</button></div><div className="mt-6 font-mono-ui text-[10px] text-[#b6c8b3]">{totalLeafPhotos.toLocaleString()} photo-count total transcribed from the source chart</div></div></section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Species in chart" value={String(plants.length)} detail="chart entries" icon={<Sprout size={16} />} /><StatCard label="Photo-count total" value={totalLeafPhotos.toLocaleString()} detail="from supplied chart" accent="gold" icon={<Camera size={16} />} /><StatCard label="Unknown locations" value={String(plants.filter((plant) => plant.location.status === 'unknown').length)} detail="no verified sites supplied" icon={<MapPin size={16} />} /><StatCard label="Field photos supplied" value={String(plants.filter((plant) => plant.image.kind === 'field').length)} detail="consented images only" accent="coral" icon={<Camera size={16} />} /></section>
    <section className="grid gap-6 xl:grid-cols-[1.35fr_.9fr]">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:p-6">
        <div className="flex items-center justify-between"><div><div className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Species from source chart</div><h3 className="mt-1 font-display text-[24px]">Chart entries</h3></div><button data-testid="button-view-all-plants" onClick={() => setView('herbarium')} className="flex items-center gap-1 text-[11px] font-bold text-[#2c684e]">View all <ArrowUpRight size={14} /></button></div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">{plants.slice(0, 3).map((plant) => <button data-testid={`card-overview-plant-${plant.id}`} onClick={() => openSpecies(plant)} key={plant.id} className="group text-left"><PlantArt plant={plant} /><div className="mt-3"><div className="text-[13px] font-bold">{plant.commonName}</div><div className="mt-0.5 font-display text-[14px] italic text-[hsl(var(--muted-foreground))]">{plant.scientificName}</div></div><div className="mt-2 flex items-center justify-between text-[10px] text-[hsl(var(--muted-foreground))]"><span>Location unknown</span><span>{plant.photoCount} chart count</span></div></button>)}</div>
      </div>
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:p-6">
        <div className="flex items-center justify-between"><div><div className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Dataset notes</div><h3 className="mt-1 font-display text-[24px]">{tab === 'activity' ? 'What is verified?' : 'Collection locations'}</h3></div><div className="flex rounded-lg bg-[hsl(var(--muted))] p-0.5"><button data-testid="button-tab-activity" onClick={() => setTab('activity')} className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold ${tab === 'activity' ? 'bg-[hsl(var(--card))] shadow-sm' : 'text-[hsl(var(--muted-foreground))]'}`}>Notes</button><button data-testid="button-tab-districts" onClick={() => setTab('districts')} className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold ${tab === 'districts' ? 'bg-[hsl(var(--card))] shadow-sm' : 'text-[hsl(var(--muted-foreground))]'}`}>Locations</button></div></div>
        {tab === 'activity' ? <div className="mt-5 space-y-4">{[['Counts', 'Transcribed from the supplied chart; not linked to attached images.', 'bg-[#e2aa46]'], ['Field photos', 'None supplied. A field photo must include contributor attribution and consent.', 'bg-[#e87552]'], ['Locations', 'Unknown for all entries; the source chart has no collection sites.', 'bg-[#77a277]'], ['Observations', 'No confirmed field observations are attached. Illustrations, when present, are labeled separately.', 'bg-[#9c7180]']].map(([title, note, dot]) => <div key={title} className="flex items-start gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} /><div><div className="text-[12px] font-semibold">{title}</div><div className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">{note}</div></div></div>)}</div> : <div className="mt-5 space-y-4">{plants.map((plant) => <div key={plant.id}><div className="mb-1.5 flex justify-between gap-3 text-[11px]"><span className="font-semibold">{plant.commonName} · {plant.location.status === 'verified' ? plant.location.label : 'Location unknown'}</span><span className="shrink-0 text-[hsl(var(--muted-foreground))]">{plant.photoCount} chart count</span></div><div className="h-2 rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[#3e7556]" style={{ width: `${Math.round((plant.photoCount / plants[0].photoCount) * 100)}%` }} /></div></div>)}</div>}
      </div>
    </section>
  </main>;
}

function Herbarium({ selected, setSelected, openSpecies }: { selected: Plant | null; setSelected: (p: Plant | null) => void; openSpecies: (plant: Plant) => void }) {
  const [query, setQuery] = useState('');
  const [locationStatus, setLocationStatus] = useState('All locations');
  const [status, setStatus] = useState<'All' | PlantStatus>('All');
  const filtered = useMemo(() => plants.filter((plant) => `${plant.commonName} ${plant.scientificName} ${plant.location.status === 'verified' ? plant.location.label : 'location unknown'} ${plant.localNames.join(' ')}`.toLowerCase().includes(query.toLowerCase()) && (locationStatus === 'All locations' || (locationStatus === 'Verified' ? plant.location.status === 'verified' : plant.location.status === 'unknown')) && (status === 'All' || plant.status === status)), [query, locationStatus, status]);
  const activePlant = filtered.find((plant) => plant.id === selected?.id) ?? filtered[0] ?? null;
  return <main className="animate-rise p-5 md:p-9">
    <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><div className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">{plants.length} chart entries · {totalLeafPhotos.toLocaleString()} photo-count total</div><h2 className="mt-1 font-display text-[34px] tracking-[-.04em]">Find a specimen</h2><p className="mt-1 max-w-lg text-[12px] text-[hsl(var(--muted-foreground))]">Search by botanical name or collection-location status.</p></div></div>
    <div className="mb-5 flex items-start gap-2 rounded-xl border border-[#cb9b3e]/40 bg-[#fbf0d0] px-3 py-3 text-[10px] leading-5 text-[#815b16]"><Database size={15} className="mt-0.5 shrink-0" /><span>Counts are transcribed from the supplied chart. No verified collection locations, field observations, or consented field photographs were provided. Any later illustrations will be labeled as illustrations, not observations.</span></div>
    <div className="mb-6 grid gap-2 md:grid-cols-[1fr_auto_auto]">
      <label className="relative block"><Search size={16} className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" /><input data-testid="input-herbarium-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search species or location status…" className="h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-9 pr-3 text-xs outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.12)]" /></label>
      <select data-testid="select-location-filter" value={locationStatus} onChange={(e) => setLocationStatus(e.target.value)} className="h-10 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-xs outline-none"><option>All locations</option><option>Unknown</option><option>Verified</option></select>
      <select data-testid="select-status-filter" value={status} onChange={(e) => setStatus(e.target.value as 'All' | PlantStatus)} className="h-10 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 text-xs outline-none"><option value="All">All review states</option><option>Reconstructed</option><option>In review</option><option>Field note</option></select>
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.55fr_.8fr]">
      <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((plant) => <button data-testid={`card-plant-${plant.id}`} key={plant.id} onClick={() => setSelected(plant)} className={`group rounded-2xl border bg-[hsl(var(--card))] p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(39,74,53,.08)] ${activePlant?.id === plant.id ? 'border-[#d09c38] ring-2 ring-[#d09c38]/20' : 'border-[hsl(var(--border))]'}`}><PlantArt plant={plant} /><div className="px-1.5 pb-1.5 pt-3"><div className="flex items-start justify-between gap-2"><div><div className="text-[13px] font-bold">{plant.commonName}</div><div className="mt-0.5 font-display text-[14px] italic text-[hsl(var(--muted-foreground))]">{plant.scientificName}</div></div><span className="font-mono-ui text-[10px] text-[#3c7556]">{plant.photoCount.toLocaleString()} chart count</span></div><div className="mt-3 flex items-center justify-between"><StatusPill status={plant.status} /><span className="text-[10px] font-semibold text-[#956816]">{plant.observation.status === 'confirmed' ? 'Confirmed observation' : 'Not field-verified'}</span></div><div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">{plant.location.status === 'verified' ? plant.location.label : 'Collection location unknown'}</div></div></button>)}
        {filtered.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-12 text-center"><Sprout className="mx-auto text-[hsl(var(--muted-foreground))]" size={28} /><div className="mt-3 font-display text-xl">No specimens match</div><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Try a plant name or another location status.</p></div>}
      </div>
      {activePlant ? <PlantDetail key={activePlant.id} plant={activePlant} onClose={() => setSelected(null)} onOpen={() => openSpecies(activePlant)} /> : <aside className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-6 text-sm text-[hsl(var(--muted-foreground))]">Choose a chart entry to inspect its count and field-evidence status.</aside>}
    </div>
  </main>;
}

function PlantDetail({ plant, onClose, onOpen }: { plant: Plant; onClose: () => void; onOpen: () => void }) {
  const location = plant.location.status === 'verified'
    ? plant.location.label
    : 'Unknown — no verified collection location supplied';
  const locationEvidence = plant.location.status === 'verified'
    ? `${plant.location.verificationSource} · verified by ${plant.location.verifiedBy}`
    : plant.location.reason;
  const imageSource = plant.image.kind === 'field'
    ? `Field photo · ${plant.image.attribution} · contributed by ${plant.image.contributor}`
    : plant.image.kind === 'illustration'
      ? `Illustration · ${plant.image.source}`
      : plant.image.reason;
  const imageConsent = plant.image.kind === 'field'
    ? `Consent recorded for: ${plant.image.consentScope}`
    : 'Not applicable — no field photo is attached';
  const observationEvidence = plant.observation.status === 'confirmed'
    ? `Confirmed observation · ${plant.observation.evidence}`
    : `Not confirmed · ${plant.observation.reason}`;

  return <aside className="h-fit rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 xl:sticky xl:top-5">
    <div className="mb-4 flex items-start justify-between"><div><div className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Specimen record</div><h3 data-testid="text-selected-plant" className="mt-1 font-display text-[27px] leading-none">{plant.commonName}</h3></div><button data-testid="button-close-specimen" onClick={onClose} className="rounded-md p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"><X size={16} /></button></div>
    <PlantArt plant={plant} large />
    <div className="mt-4"><div className="flex items-center justify-between"><span className="font-display text-[17px] italic">{plant.scientificName}</span><StatusPill status={plant.status} /></div>
      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-[hsl(var(--border))] py-4">{[['Local names', plant.localNames.length ? plant.localNames.join(' · ') : 'Not supplied — community verification pending'], ['Collection location', location], ['Location evidence', locationEvidence], ['Photo-count in chart', plant.photoCount.toLocaleString()], ['Community use notes', plant.use], ['Record source', plant.lastUpdated]].map(([label, value]) => <div key={label}><div className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{label}</div><div className="mt-1 text-[11px] font-semibold leading-4">{value}</div></div>)}</div>
      <div className="mt-4 rounded-xl bg-[hsl(var(--muted))] p-3"><div className="flex items-center gap-1.5 font-mono-ui text-[9px] uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]"><Tags size={12} /> Image and observation provenance</div><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-lg border border-[#4e805f] bg-[#deebdd] px-2 py-2 text-[11px] font-bold text-[#356347]">Photo count<span className="mt-0.5 block text-[9px] font-normal">transcribed from source chart</span></div><div className={`rounded-lg border px-2 py-2 text-[11px] font-bold ${plant.image.kind === 'field' ? 'border-[#4e805f] bg-[#deebdd] text-[#356347]' : 'border-[#d09c38] bg-[#fbefcf] text-[#815b16]'}`}>{plant.image.kind === 'field' ? 'Consented field photo' : plant.image.kind === 'illustration' ? 'Illustration only' : 'No field photo'}<span className="mt-0.5 block text-[9px] font-normal">{plant.image.kind === 'field' ? plant.image.contributor : plant.image.kind === 'illustration' ? 'Not a field observation' : 'Not supplied'}</span></div></div><div className="mt-3 space-y-1 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]"><div><strong className="text-[hsl(var(--foreground))]">Image source:</strong> {imageSource}</div><div><strong className="text-[hsl(var(--foreground))]">Image consent:</strong> {imageConsent}</div><div><strong className="text-[hsl(var(--foreground))]">Observation status:</strong> {observationEvidence}</div></div></div>
      <p className="mt-3 text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">Chart entries are references, not confirmed observations. Only display a field photo when contributor attribution and consent are recorded; keep unknown collection locations explicit.</p>
      <button data-testid="button-open-specimen-record" onClick={onOpen} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#254c3a] py-2.5 text-xs font-bold text-[#f4ead6] transition hover:bg-[#32644b]">Open species record <ArrowUpRight size={14} /></button>
    </div>
  </aside>;
}

function SpeciesPage({ plant, onBack, onOpenSpecies }: { plant: Plant; onBack: () => void; onOpenSpecies: (plant: Plant) => void }) {
  const plantIndex = plants.findIndex((item) => item.id === plant.id);
  const relatedPlants = plants.filter((item) => item.id !== plant.id);
  const locationLabel = plant.location.status === 'verified' ? plant.location.label : 'Unknown — no verified collection location supplied';
  const localNames = plant.localNames.length ? plant.localNames.join(' · ') : 'Not supplied — community verification pending';
  const imageSource = plant.image.kind === 'field'
    ? `Field photo · ${plant.image.attribution} · contributed by ${plant.image.contributor}`
    : plant.image.kind === 'illustration'
      ? `Illustration · ${plant.image.source}`
      : plant.image.reason;
  const imageConsent = plant.image.kind === 'field'
    ? `Consent recorded for: ${plant.image.consentScope}`
    : 'Not applicable — no field photo is attached';
  return <main className="animate-rise space-y-6 p-5 md:p-9">
    <button data-testid="button-back-to-herbarium" onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-bold text-[hsl(var(--foreground))] transition hover:border-[#3e7556]"><ArrowLeft size={15} /> Back to herbarium</button>
    <section className="grid overflow-hidden rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] lg:grid-cols-[1.1fr_.9fr]">
      <div className="min-h-[300px] lg:min-h-[480px]"><PlantArt plant={plant} large /></div>
      <div className="flex flex-col justify-center p-6 md:p-9">
        <div className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#3e7556]">Species record · {String(plantIndex + 1).padStart(2, '0')} / {plants.length}</div>
        <h2 data-testid={`text-species-title-${plant.id}`} className="mt-3 font-display text-[44px] leading-[.95] tracking-[-.04em] md:text-[58px]">{plant.commonName}</h2>
        <p className="mt-3 font-display text-[21px] italic text-[hsl(var(--muted-foreground))]">{plant.scientificName}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3"><StatusPill status={plant.status} /><span className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]"><MapPin size={14} /> Collection location: {locationLabel}</span><span className="text-xs font-semibold text-[#956816]">{plant.observation.status === 'confirmed' ? 'Confirmed observation' : 'Not field-verified'}</span></div>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[hsl(var(--muted))] p-4"><div className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Photo count in source chart</div><div data-testid={`text-species-count-${plant.id}`} className="mt-2 font-display text-[34px] leading-none">{plant.photoCount.toLocaleString()}</div></div>
          <div className="rounded-xl bg-[hsl(var(--muted))] p-4"><div className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Field observation</div><div className="mt-2 text-sm font-bold">{plant.observation.status === 'confirmed' ? 'Confirmed' : 'Not confirmed'}</div></div>
        </div>
        <p className="mt-5 text-xs leading-6 text-[hsl(var(--muted-foreground))]">This chart entry contains a count, not a confirmed field observation. {plant.image.kind === 'field' ? 'The attached field photo includes contributor attribution and recorded consent.' : plant.image.kind === 'illustration' ? 'The image is an illustration, not field evidence.' : 'No consented field photo has been supplied.'}</p>
      </div>
    </section>
    <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:p-7">
        <div className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Specimen information</div>
        <h3 className="mt-1 font-display text-[25px]">What this record contains</h3>
        <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {[
            ['Scientific name', plant.scientificName],
            ['Local names', localNames],
            ['Collection location', locationLabel],
            ['Location evidence', plant.location.status === 'verified' ? `${plant.location.verificationSource} · verified by ${plant.location.verifiedBy}` : plant.location.reason],
            ['Image source', imageSource],
            ['Image consent', imageConsent],
            ['Community use notes', plant.use],
            ['Photo-count source', plant.lastUpdated],
          ].map(([label, value]) => <div key={label} className="border-t border-[hsl(var(--border))] pt-3"><dt className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{label}</dt><dd className="mt-1 text-xs font-semibold leading-5">{value}</dd></div>)}
        </dl>
      </div>
      <aside className="rounded-2xl border border-[#cb9b3e]/40 bg-[#fbf0d0] p-5 md:p-7">
        <div className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-[#815b16]">Verification note</div>
        <h3 className="mt-1 font-display text-[25px] text-[#4e401f]">Field evidence status</h3>
        <p className="mt-3 text-xs leading-6 text-[#715d30]">{plant.observation.status === 'confirmed' ? `Confirmed observation: ${plant.observation.evidence}` : `Not confirmed: ${plant.observation.reason}`} The source chart provides a photo count but no collection site. Confirm plant identity, local names, uses, and location with local partners before treating this as a field record.</p>
      </aside>
    </section>
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:p-7">
      <div className="flex items-end justify-between gap-3"><div><div className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Continue browsing</div><h3 className="mt-1 font-display text-[25px]">Other species</h3></div><span className="text-[10px] text-[hsl(var(--muted-foreground))]">{relatedPlants.length} more records</span></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{relatedPlants.map((related) => <button data-testid={`card-related-species-${related.id}`} key={related.id} onClick={() => onOpenSpecies(related)} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 text-left transition hover:-translate-y-0.5 hover:border-[#3e7556]"><PlantArt plant={related} /><div className="px-1 pb-1 pt-3 text-sm font-bold">{related.commonName}</div><div className="px-1 pb-1 font-display text-sm italic text-[hsl(var(--muted-foreground))]">{related.scientificName}</div><div className="flex items-center justify-between px-1 pt-2 text-[10px] text-[hsl(var(--muted-foreground))]"><span>{related.location.status === 'verified' ? related.location.label : 'Location unknown'}</span><span>{related.photoCount} chart count</span></div></button>)}</div>
    </section>
  </main>;
}

function Capture({ onStart }: { onStart: () => void }) {
  const [showAll, setShowAll] = useState(false);
  return <main className="animate-rise p-5 md:p-9"><div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Capture ledger / 18 sessions</div><h2 className="mt-1 font-display text-[34px] tracking-[-.04em]">From hoofprint to mesh</h2><p className="mt-1 max-w-xl text-[12px] text-[hsl(var(--muted-foreground))]">Each walk leaves a trace. Keep the camera, GPS, and the human account of a plant in the same frame.</p></div><button data-testid="button-start-capture" onClick={onStart} className="flex items-center justify-center gap-2 rounded-lg bg-[#254c3a] px-4 py-3 text-xs font-bold text-[#f4ead6]"><Camera size={16} /> Start field capture</button></div><section className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-[#254c3a] p-5 text-[#f4ead6] md:col-span-2"><div className="flex items-center justify-between"><div><div className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-[#9fb7a0]">Capture readiness</div><div className="mt-2 font-display text-[29px]">Kit 04 is ready</div></div><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e2aa46] text-[#18352a]"><Check size={22} /></div></div><div className="mt-6 grid grid-cols-3 gap-2">{[['Camera rig', 'Connected'], ['GPS', '± 2.4 m'], ['IMU', 'Calibrated']].map(([name, status]) => <div key={name} className="rounded-xl border border-[#496c55] bg-[#2d5843] p-3"><div className="text-[10px] text-[#a6bca6]">{name}</div><div className="mt-1 text-[12px] font-bold text-[#e2aa46]">{status}</div></div>)}</div></div><div className="field-grid rounded-2xl border border-[hsl(var(--border))] bg-[#f1e7cb] p-5"><Compass className="text-[#a56d18]" size={23} /><div className="mt-8 font-display text-[23px] leading-[1.05] text-[#254c3a]">The field is the first source.</div><p className="mt-2 text-[11px] leading-5 text-[#647361]">Capture with local names and use notes before the asset.</p></div></section><section className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] p-5"><div><div className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Recent sessions</div><h3 className="mt-1 font-display text-[24px]">Field ledger</h3></div><button data-testid="button-toggle-sessions" onClick={() => setShowAll(!showAll)} className="flex items-center gap-1 text-[11px] font-bold text-[#2c684e]">{showAll ? 'Show active' : 'Show all sessions'} <ChevronDown size={14} className={showAll ? 'rotate-180' : ''} /></button></div><div className="divide-y divide-[hsl(var(--border))]">{(showAll ? [...sessions, ...sessions].slice(0, 5) : sessions).map((session, i) => <div key={`${session.id}-${i}`} className="grid items-center gap-3 px-5 py-4 md:grid-cols-[1.2fr_1fr_.8fr_.7fr_auto]"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e9dfc3] text-[#346247]"><Camera size={16} /></div><div><div className="text-[12px] font-bold">{session.id}</div><div className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">{session.goat} · {session.date}</div></div></div><div className="text-[11px]"><span className="text-[hsl(var(--muted-foreground))]">District</span><div className="mt-1 font-semibold">{session.district}</div></div><div className="text-[11px]"><span className="text-[hsl(var(--muted-foreground))]">Frames</span><div className="mt-1 font-mono-ui font-medium">{session.frames.toLocaleString()}</div></div><div><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${session.status === 'Reconstructed' ? 'bg-[#dceadd] text-[#356347]' : session.status === 'Needs review' ? 'bg-[#f5dfd7] text-[#a94e38]' : 'bg-[#fbefcf] text-[#956816]'}`}>{session.status}</span></div><button data-testid={`button-session-${session.id}`} onClick={onStart} className="flex items-center gap-1 text-[11px] font-bold text-[#2c684e]">Inspect <ArrowUpRight size={13} /></button></div>)}</div></section></main>;
}

function Evaluation() {
  return <main className="animate-rise p-5 md:p-9">
    <div className="mb-6"><div className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Evaluation suite / model health</div><h2 className="mt-1 font-display text-[34px] tracking-[-.04em]">Does the reconstruction hold?</h2><p className="mt-1 max-w-xl text-[12px] text-[hsl(var(--muted-foreground))]">Evaluation values are intentionally blank until the graphics pipeline produces measured results.</p></div>
    <div className="mb-5 rounded-xl border border-[#cb9b3e]/40 bg-[#fbf0d0] px-3 py-3 text-[11px] leading-5 text-[#815b16]">The supplied chart contains photo counts only. It does not include reconstruction, rendering, or usability measurements.</div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <div key={metric.name} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><div className="font-mono-ui text-[10px] uppercase tracking-[.11em] text-[hsl(var(--muted-foreground))]">{metric.name}</div><div className="mt-4 flex min-h-10 items-baseline gap-1"><span className="font-display text-[23px] leading-tight tracking-[-.04em]">{metric.value}</span><span className="font-mono-ui text-[11px] text-[hsl(var(--muted-foreground))]">{metric.unit}</span></div><div className="mt-2 flex min-h-8 items-start justify-between gap-2 text-[10px]"><span className="text-[hsl(var(--muted-foreground))]">{metric.benchmark}</span><span className="shrink-0 font-bold text-[#956816]">{metric.trend}</span></div></div>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:p-6"><div className="font-mono-ui text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">Source chart data</div><h3 className="mt-1 font-display text-[24px]">Photo counts by species</h3><div className="mt-7 space-y-5">{plants.map((plant) => <div key={plant.id}><div className="mb-2 flex items-center justify-between gap-3 text-[11px]"><span className="font-bold">{plant.commonName} · location unknown</span><span className="font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">{plant.photoCount.toLocaleString()}</span></div><div className="h-3 rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[#3e7556]" style={{ width: `${Math.round((plant.photoCount / plants[0].photoCount) * 100)}%` }} /></div></div>)}</div><div className="mt-6 border-t border-[hsl(var(--border))] pt-4 text-[10px] text-[hsl(var(--muted-foreground))]">The chart provides photo counts only. Collection locations are unknown and observations are not confirmed.</div></section>
      <section className="rounded-2xl bg-[#254c3a] p-6 text-[#f4ead6]"><div className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.14em] text-[#a9bea8]"><FlaskConical size={14} /> Verification queue</div><div className="mt-5 font-display text-[29px] leading-none">{plants.length} species<br /><span className="text-[#e2aa46]">need local review.</span></div><p className="mt-3 text-[11px] leading-5 text-[#bbcbbb]">Verify species identity, local names, use notes, and actual collection sites with botanists and community partners before treating these as field records.</p><div className="mt-7 space-y-3">{plants.map((plant) => <div key={plant.id} className="flex items-center justify-between gap-3 border-b border-[#486952] pb-3"><div><div className="text-[12px] font-bold">{plant.commonName}</div><div className="mt-0.5 text-[10px] text-[#a9bea8]">{plant.photoCount} chart count · collection location unknown</div></div><span className="rounded-md border border-[#718f76] px-2 py-1 text-[9px] font-bold text-[#e2aa46]">No field observation</span></div>)}</div></section>
    </div>
  </main>;
}

function CaptureModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#18352a]/55 p-0 backdrop-blur-sm md:items-center md:p-5"><div className="w-full max-w-lg rounded-t-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-2xl md:rounded-[22px] md:p-7"><div className="flex items-start justify-between"><div><div className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">New field capture</div><h2 className="mt-1 font-display text-[29px]">Begin with context.</h2></div><button data-testid="button-close-capture-modal" onClick={onClose} className="rounded-md p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"><X size={18} /></button></div><div className="mt-6 flex items-center gap-2">{[1, 2, 3].map((item) => <div key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-[#e2aa46]' : 'bg-[hsl(var(--muted))]'}`} />)}</div>{step === 1 && <div className="mt-7 space-y-4"><div><label className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Goat identifier</label><input data-testid="input-goat-id" defaultValue="Mokoto 08" className="mt-1 h-11 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 text-sm outline-none focus:border-[hsl(var(--primary))]" /></div><div><label className="font-mono-ui text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">District / sub-county</label><input data-testid="input-capture-district" defaultValue="Napak · Lorengecora" className="mt-1 h-11 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 text-sm outline-none focus:border-[hsl(var(--primary))]" /></div><p className="rounded-lg bg-[#fbf0d0] p-3 text-[11px] leading-4 text-[#815b16]">Starting a session will pair the camera rig with GPS and IMU metadata.</p></div>}{step === 2 && <div className="mt-7 rounded-2xl bg-[#254c3a] p-6 text-[#f4ead6]"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e2aa46] text-[#18352a]"><Camera size={28} /></div><div className="mt-5 text-center font-display text-[25px]">Kit 04 is looking for a signal.</div><p className="mx-auto mt-2 max-w-xs text-center text-[11px] leading-5 text-[#bbccba]">Camera, GPS, and motion sensor are ready. Walk slowly around the plant at 1.5 metres.</p><div className="mt-5 flex items-center justify-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.12em] text-[#e2aa46]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#e2aa46]" /> Waiting for first frame</div></div>}{step === 3 && <div className="mt-7 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#dceadd] text-[#356347]"><Check size={30} /></div><div className="mt-5 font-display text-[27px]">Session staged.</div><p className="mt-2 text-[12px] leading-5 text-[hsl(var(--muted-foreground))]">GB-240519 has been added to the ledger. You can begin walking whenever the field is ready.</p></div>}<div className="mt-7 flex justify-end gap-2">{step > 1 && <button data-testid="button-back-capture" onClick={() => setStep(step - 1)} className="rounded-lg border border-[hsl(var(--border))] px-4 py-2.5 text-xs font-bold">Back</button>}<button data-testid="button-next-capture" onClick={() => step < 3 ? setStep(step + 1) : onClose()} className="rounded-lg bg-[#e2aa46] px-4 py-2.5 text-xs font-bold text-[#18352a]">{step === 1 ? 'Pair capture kit' : step === 2 ? 'Stage session' : 'Done'}</button></div></div></div>;
}

function Home() {
  const [view, setView] = useState<View>('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState<Plant | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [isSpeciesRoute, speciesParams] = useRoute('/species/:id');
  const speciesPlant = isSpeciesRoute ? plants.find((plant) => plant.id === speciesParams?.id) ?? null : null;
  const activeView: View = isSpeciesRoute ? 'herbarium' : view;
  const navigateToView = (nextView: View) => { setView(nextView); setLocation('/'); };
  const openSpecies = (plant: Plant) => { setSelected(plant); setLocation(`/species/${plant.id}`); };
  const content = isSpeciesRoute
    ? speciesPlant
      ? <SpeciesPage plant={speciesPlant} onBack={() => { setSelected(speciesPlant); setView('herbarium'); setLocation('/'); }} onOpenSpecies={openSpecies} />
      : <NotFound />
    : view === 'overview'
      ? <Overview setView={navigateToView} openSpecies={openSpecies} />
      : view === 'herbarium'
        ? <Herbarium selected={selected} setSelected={setSelected} openSpecies={openSpecies} />
        : view === 'capture'
          ? <Capture onStart={() => setCaptureOpen(true)} />
          : <Evaluation />;
  const selectedTitle = isSpeciesRoute && speciesPlant ? speciesPlant.commonName : undefined;
  const selectedSubtitle = isSpeciesRoute && speciesPlant ? `${speciesPlant.scientificName} · Individual species record` : undefined;
  return <div className="flex min-h-[100dvh] flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))] lg:flex-row"><Sidebar view={activeView} setView={navigateToView} collapsed={collapsed} setCollapsed={setCollapsed} /><div className="min-w-0 flex-1"><Topbar view={activeView} onCapture={() => setCaptureOpen(true)} title={selectedTitle} subtitle={selectedSubtitle} />{content}</div>{captureOpen && <CaptureModal onClose={() => setCaptureOpen(false)} />}</div>;
}

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/species/:id" component={Home} /><Route component={NotFound} /></Switch>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter hook={useHashLocation}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
