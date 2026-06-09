'use client';

import { useEffect, useMemo, useState } from 'react';

type Scenario = {
  scenarioName: string;
  censusConfirmed: boolean;
  dcsPlan: 'A' | 'B';
  useAltCensusStart: boolean;
  censusStart: string;
  censusEnd: string;
  censusThuHours: number;
  censusFriHours: number;
  censusSatHours: number;
  censusSunHours: number;
  sundayCensus: boolean;
  avanceMonWed: boolean;
  avance08AfterCensus: boolean;
  avanceFteSalary: number;
  avanceFteFraction: number;
  censusHourlyRate: number;
  sunglassHutRate: number;
  sunglassHutHours: number;
  bccsFortnight: number;
  includeBccs: boolean;
  includeSunglassHut: boolean;
  tuesdayOff: boolean;
  sundayChurch: boolean;
  notes: string;
};

const defaultScenario: Scenario = {
  scenarioName: 'Default transition plan',
  censusConfirmed: true,
  dcsPlan: 'A',
  useAltCensusStart: false,
  censusStart: '2026-07-09',
  censusEnd: '2026-10-01',
  censusThuHours: 4,
  censusFriHours: 4,
  censusSatHours: 4,
  censusSunHours: 4,
  sundayCensus: true,
  avanceMonWed: true,
  avance08AfterCensus: true,
  avanceFteSalary: 65000,
  avanceFteFraction: 0.8,
  censusHourlyRate: 31.19,
  sunglassHutRate: 32,
  sunglassHutHours: 20,
  bccsFortnight: 1000,
  includeBccs: false,
  includeSunglassHut: false,
  tuesdayOff: true,
  sundayChurch: true,
  notes: ''
};

const badgeStyle = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide';

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0
  }).format(value);
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short'
  });
}

function differenceInWeeks(start: Date, end: Date) {
  const diff = Math.max(0, end.getTime() - start.getTime());
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24 * 7)));
}

function parseDate(value: string) {
  const parts = value.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

const fixedDates: Record<string, { label: string; badge: string }> = {
  '2026-06-10': { label: 'Avance', badge: 'bg-sky-600/20 text-sky-200' },
  '2026-06-11': { label: 'DCS', badge: 'bg-amber-600/20 text-amber-200' },
  '2026-06-12': { label: 'DCS', badge: 'bg-amber-600/20 text-amber-200' },
  '2026-06-15': { label: 'Avance', badge: 'bg-sky-600/20 text-sky-200' },
  '2026-06-16': { label: 'OFF', badge: 'bg-slate-600/20 text-slate-200' },
  '2026-06-17': { label: 'Avance', badge: 'bg-sky-600/20 text-sky-200' },
  '2026-06-18': { label: 'DCS', badge: 'bg-amber-600/20 text-amber-200' },
  '2026-06-19': { label: 'DCS', badge: 'bg-amber-600/20 text-amber-200' },
  '2026-06-21': { label: 'Church', badge: 'bg-indigo-600/20 text-indigo-200' },
  '2026-06-22': { label: 'Avance', badge: 'bg-sky-600/20 text-sky-200' },
  '2026-06-23': { label: 'OFF', badge: 'bg-slate-600/20 text-slate-200' },
  '2026-06-24': { label: 'Avance', badge: 'bg-sky-600/20 text-sky-200' },
  '2026-06-25': { label: 'DCS', badge: 'bg-amber-600/20 text-amber-200' },
  '2026-06-26': { label: 'DCS', badge: 'bg-amber-600/20 text-amber-200' },
  '2026-06-28': { label: 'Church', badge: 'bg-indigo-600/20 text-indigo-200' },
  '2026-06-29': { label: 'Avance', badge: 'bg-sky-600/20 text-sky-200' },
  '2026-06-30': { label: 'OFF', badge: 'bg-slate-600/20 text-slate-200' },
  '2026-07-01': { label: 'Avance', badge: 'bg-sky-600/20 text-sky-200' },
  '2026-07-02': { label: 'DCS', badge: 'bg-amber-600/20 text-amber-200' },
  '2026-07-03': { label: 'DCS (Plan A end)', badge: 'bg-amber-600/20 text-amber-200' },
  '2026-07-05': { label: 'Church', badge: 'bg-indigo-600/20 text-indigo-200' },
  '2026-07-06': { label: 'Avance (Andy in town)', badge: 'bg-sky-600/20 text-sky-200' },
  '2026-07-07': { label: 'OFF / possible Avance', badge: 'bg-slate-600/20 text-slate-200' },
  '2026-07-08': { label: 'Avance (Andy in town)', badge: 'bg-sky-600/20 text-sky-200' },
  '2026-07-09': { label: 'Census start / possible Avance', badge: 'bg-emerald-600/20 text-emerald-200' },
  '2026-07-10': { label: 'Census / DCS', badge: 'bg-emerald-600/20 text-emerald-200' },
  '2026-07-11': { label: 'Census', badge: 'bg-emerald-600/20 text-emerald-200' },
  '2026-07-12': { label: 'Church / census PM', badge: 'bg-indigo-600/20 text-indigo-200' },
  '2026-07-16': { label: 'DCS', badge: 'bg-amber-600/20 text-amber-200' },
  '2026-07-17': { label: 'DCS last day (Plan B)', badge: 'bg-amber-600/20 text-amber-200' },
  '2026-07-20': { label: 'Avance 0.8 starts', badge: 'bg-sky-600/20 text-sky-200' },
  '2026-10-01': { label: 'Census final day', badge: 'bg-emerald-600/20 text-emerald-200' },
  '2026-10-02': { label: 'Avance transition / admin', badge: 'bg-slate-600/20 text-slate-200' }
};

function computeScenario(scenario: Scenario) {
  const weeklyFte = scenario.avanceFteSalary / 52;
  const avance08Weekly = weeklyFte * scenario.avanceFteFraction;
  const avanceMwWeekly = weeklyFte * 0.5;
  const censusWeekly =
    scenario.censusThuHours +
    scenario.censusFriHours +
    scenario.censusSatHours +
    (scenario.sundayCensus ? scenario.censusSunHours : 0);
  const censusPay = censusWeekly * scenario.censusHourlyRate;
  const sunglassWeekly = scenario.includeSunglassHut ? scenario.sunglassHutRate * scenario.sunglassHutHours : 0;
  const bccsWeekly = scenario.includeBccs ? scenario.bccsFortnight / 2 : 0;
  const coreAvanceWeekly = scenario.avanceMonWed ? avanceMwWeekly : avance08Weekly;
  const totalWeekly = coreAvanceWeekly + censusPay + sunglassWeekly + bccsWeekly;
  const weeks = differenceInWeeks(parseDate(scenario.censusStart), parseDate(scenario.censusEnd));
  const total12Week = totalWeekly * Math.min(12, weeks);
  const breakEvenCensusHours = Math.max(0, (avance08Weekly - avanceMwWeekly) / scenario.censusHourlyRate);

  return {
    weeklyFte,
    avance08Weekly,
    avanceMwWeekly,
    censusPay,
    sunglassWeekly,
    bccsWeekly,
    coreAvanceWeekly,
    totalWeekly,
    total12Week,
    diffFrom08: totalWeekly - avance08Weekly,
    breakEvenCensusHours,
    weeks
  };
}

function buildTimeline(scenario: Scenario) {
  const startDate = new Date(2026, 5, 10);
  const endDate = new Date(2026, 9, 2);
  const censusStart = scenario.useAltCensusStart ? new Date(2026, 7, 12) : new Date(2026, 6, 9);
  const censusEnd = parseDate(scenario.censusEnd);
  const days: Array<{ date: Date; label: string; badge: string }> = [];

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const key = dateKey(date);
    const fixed = fixedDates[key];
    if (fixed) {
      days.push({ date: new Date(date), label: fixed.label, badge: fixed.badge });
      continue;
    }

    const weekday = date.getDay();
    const isSunday = weekday === 0;
    const isMonday = weekday === 1;
    const isTuesday = weekday === 2;
    const isWednesday = weekday === 3;
    const isThursday = weekday === 4;
    const isFriday = weekday === 5;
    const isSaturday = weekday === 6;
    const afterCensus = date > censusEnd;

    if (scenario.censusConfirmed && date >= censusStart && date <= censusEnd) {
      if (isMonday || isWednesday) {
        days.push({ date: new Date(date), label: 'Avance', badge: 'bg-sky-600/20 text-sky-200' });
        continue;
      }
      if (isTuesday) {
        days.push({ date: new Date(date), label: 'OFF', badge: 'bg-slate-600/20 text-slate-200' });
        continue;
      }
      if (isThursday || isFriday || isSaturday) {
        days.push({ date: new Date(date), label: 'Census', badge: 'bg-emerald-600/20 text-emerald-200' });
        continue;
      }
      if (isSunday) {
        days.push({ date: new Date(date), label: 'Church / possible Census', badge: 'bg-indigo-600/20 text-indigo-200' });
        continue;
      }
    }

    if (!scenario.censusConfirmed && date >= new Date(2026, 6, 9) && date <= new Date(2026, 6, 17)) {
      if (isThursday || isFriday) {
        days.push({ date: new Date(date), label: 'DCS', badge: 'bg-amber-600/20 text-amber-200' });
        continue;
      }
    }

    if (!scenario.censusConfirmed && date >= new Date(2026, 6, 20) && date <= new Date(2026, 9, 2)) {
      if (isMonday || isWednesday || isThursday || isFriday) {
        days.push({ date: new Date(date), label: 'Avance 0.8', badge: 'bg-sky-600/20 text-sky-200' });
        continue;
      }
      if (isTuesday) {
        days.push({ date: new Date(date), label: 'OFF', badge: 'bg-slate-600/20 text-slate-200' });
        continue;
      }
      if (isSunday) {
        days.push({ date: new Date(date), label: 'Church', badge: 'bg-indigo-600/20 text-indigo-200' });
        continue;
      }
    }

    if (afterCensus && scenario.censusConfirmed) {
      days.push({ date: new Date(date), label: 'Transition / Avance 0.8', badge: 'bg-slate-600/20 text-slate-200' });
      continue;
    }

    if (isMonday || isWednesday) {
      days.push({ date: new Date(date), label: 'Avance', badge: 'bg-sky-600/20 text-sky-200' });
      continue;
    }
    if (isTuesday) {
      days.push({ date: new Date(date), label: 'OFF', badge: 'bg-slate-600/20 text-slate-200' });
      continue;
    }
    if (isThursday || isFriday) {
      days.push({ date: new Date(date), label: 'DCS / Census', badge: 'bg-amber-600/20 text-amber-200' });
      continue;
    }
    if (isSunday) {
      days.push({ date: new Date(date), label: 'Church', badge: 'bg-indigo-600/20 text-indigo-200' });
      continue;
    }
    days.push({ date: new Date(date), label: 'Rest / family', badge: 'bg-slate-600/20 text-slate-200' });
  }

  return days;
}

export default function Home() {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'calculator' | 'decisions' | 'notes'>('dashboard');
  const [importError, setImportError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('dcs-census-scenario');
      if (saved) {
        setScenario(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load scenario', error);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem('dcs-census-scenario', JSON.stringify(scenario));
  }, [scenario, loaded]);

  const stats = useMemo(() => computeScenario(scenario), [scenario]);
  const timeline = useMemo(() => buildTimeline(scenario), [scenario]);

  const planCards = [
    {
      title: 'Plan A: Census confirmed',
      active: scenario.censusConfirmed,
      summary: 'DCS ends 3 July, keep Avance Mon/Wed, start Census 9 July',
      badge: 'bg-emerald-600/20 text-emerald-200'
    },
    {
      title: 'Plan B: No Census',
      active: !scenario.censusConfirmed,
      summary: 'DCS ends 17 July, begin Avance 0.8 from 20 July',
      badge: 'bg-amber-600/20 text-amber-200'
    },
    {
      title: 'Avance 0.8',
      active: !scenario.avanceMonWed,
      summary: 'Full 0.8 pattern, roughly $1,000/week',
      badge: 'bg-sky-600/20 text-sky-200'
    },
    {
      title: 'Avance Mon/Wed + Census',
      active: scenario.avanceMonWed && scenario.censusConfirmed,
      summary: 'Balance Avance and Census for mixed income',
      badge: 'bg-cyan-600/20 text-cyan-200'
    },
    {
      title: 'DCS until 3 July',
      active: scenario.dcsPlan === 'A',
      summary: 'Keep DCS only through 3 July if Census is confirmed',
      badge: 'bg-amber-600/20 text-amber-200'
    },
    {
      title: 'DCS until 17 July',
      active: scenario.dcsPlan === 'B',
      summary: 'Protect DCS work until 17 July if Census does not start',
      badge: 'bg-amber-600/20 text-amber-200'
    },
    {
      title: 'BCCS bus driving',
      active: scenario.includeBccs,
      summary: 'Optional bus fallback, may clash with full Avance',
      badge: 'bg-violet-600/20 text-violet-200'
    },
    {
      title: 'Sunglass Hut backup',
      active: scenario.includeSunglassHut,
      summary: 'Casual retail option at ~ $32/hr',
      badge: 'bg-fuchsia-600/20 text-fuchsia-200'
    }
  ];

  const warnings = [
    scenario.tuesdayOff ? null : 'Tuesday is not protected — consider holding it free for admin and recovery.',
    scenario.sundayChurch ? null : 'Sunday morning is not protected for church.',
    scenario.includeBccs && !scenario.avanceMonWed ? 'BCCS may clash with Avance 0.8 afternoon finish times.' : null,
    scenario.sundayCensus && scenario.sundayChurch ? 'Sunday afternoon Census can work, but keep morning church protected.' : null,
    scenario.censusConfirmed && scenario.censusThuHours + scenario.censusFriHours + scenario.censusSatHours + (scenario.sundayCensus ? scenario.censusSunHours : 0) > 28
      ? 'Census hours are high; watch weekly rest and fatigue.'
      : null
  ].filter(Boolean) as string[];

  function handleField<K extends keyof Scenario>(key: K, value: Scenario[K]) {
    setScenario((prev) => ({ ...prev, [key]: value }));
  }

  function handleExport() {
    const data = JSON.stringify(scenario, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dcs-census-avance-scenario.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    setImportError('');
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        setScenario({ ...defaultScenario, ...parsed });
      } catch (error) {
        setImportError('Invalid JSON or unsupported file.');
      }
    };
    reader.readAsText(file);
  }

  function handleReset() {
    setScenario(defaultScenario);
  }

  const summary = scenario.avanceMonWed
    ? `Avance Mon/Wed plus ${scenario.censusThuHours + scenario.censusFriHours + scenario.censusSatHours + (scenario.sundayCensus ? scenario.censusSunHours : 0)} census hours gives about ${formatMoney(stats.totalWeekly)}/week.`
    : `Avance 0.8 alone is about ${formatMoney(stats.avance08Weekly)}/week.`;

  return (
    <main className="min-h-screen py-8 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300/70">DCS / Census / Avance Work Planner</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Practical transition planning for Josh</h1>
              <p className="mt-3 max-w-2xl text-slate-300">Compare DCS finish dates, Census work, Avance options, backup roles, rest and weekly income. Save scenarios in localStorage and export as JSON.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
              <button
                type="button"
                onClick={handleExport}
                className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-500"
              >
                Export plan JSON
              </button>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-slate-800/90 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
                Import scenario
                <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>
          {importError ? <p className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{importError}</p> : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {['dashboard', 'timeline', 'calculator', 'decisions', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? 'bg-sky-500 text-slate-950' : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'}`}
              >
                {tab === 'dashboard' ? 'Dashboard' : tab === 'timeline' ? 'Timeline' : tab === 'calculator' ? 'Pay & options' : tab === 'decisions' ? 'Decisions / energy' : 'Messages / checklist'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Active scenario</p>
                    <h2 className="mt-2 text-2xl font-semibold">{scenario.scenarioName}</h2>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                    {scenario.censusConfirmed ? 'Census confirmed expected' : 'Census not confirmed yet'}
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/80 p-5">
                    <p className="text-sm text-slate-400">Next big decision</p>
                    <p className="mt-2 text-xl font-semibold text-white">Confirm Census dates and weekly hours</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-5">
                    <p className="text-sm text-slate-400">Next date</p>
                    <p className="mt-2 text-xl font-semibold text-white">{scenario.censusConfirmed ? formatShortDate(parseDate(scenario.censusStart)) : 'TBA'}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-900/80 p-5">
                    <p className="text-sm text-slate-400">Weekly estimate</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(stats.totalWeekly)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-5">
                    <p className="text-sm text-slate-400">12-week outlook</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(stats.total12Week)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-5">
                    <p className="text-sm text-slate-400">Income difference</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(stats.diffFrom08)}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {planCards.map((card) => (
                  <div key={card.title} className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5 shadow-glow">
                    <div className={`mb-3 ${card.badge} ${badgeStyle}`}>{card.active ? 'Active' : 'Option'}</div>
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{card.summary}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Warnings & clashes</h2>
                {warnings.length ? (
                  <ul className="mt-4 space-y-3 text-sm text-slate-300">
                    {warnings.map((warning) => (
                      <li key={warning} className="rounded-2xl border border-rose-500/10 bg-rose-500/10 p-4">{warning}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">No major conflicts detected with current settings.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Quick summary</h2>
                <p className="mt-4 text-slate-300">{summary}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/80 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Break-even Census hours</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{stats.breakEvenCensusHours.toFixed(1)} hrs/week</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sunday Census</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{scenario.sundayCensus ? 'Included' : 'Excluded'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Upcoming key dates</h2>
                <ul className="mt-4 space-y-3 text-slate-300">
                  <li>Current DCS path: {scenario.dcsPlan === 'A' ? 'Ends 3 July' : 'Ends 17 July'}</li>
                  <li>Candidate Census start: {formatShortDate(parseDate(scenario.censusStart))}</li>
                  <li>Census final day: {formatShortDate(parseDate(scenario.censusEnd))}</li>
                  <li>Avance 0.8 transition: {scenario.censusConfirmed ? 'From 5 October' : 'From 20 July'}</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'timeline' && (
          <section className="mt-8 space-y-6">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
              <h2 className="text-xl font-semibold text-white">Dated timeline</h2>
              <p className="mt-3 text-slate-300">A clear view from 10 June to 2 October with plan labels, church, off days and work blocks.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {timeline.slice(0, 9).map((day) => (
                  <div key={dateKey(day.date)} className="rounded-3xl bg-slate-900/90 p-4">
                    <div className="text-sm text-slate-400">{formatShortDate(day.date)}</div>
                    <div className="mt-2 text-base font-semibold text-white">{day.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {timeline.slice(9, 18).map((day) => (
                  <div key={dateKey(day.date)} className="rounded-3xl bg-slate-900/90 p-4">
                    <div className="text-sm text-slate-400">{formatShortDate(day.date)}</div>
                    <div className="mt-2 text-base font-semibold text-white">{day.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {timeline.slice(18, 27).map((day) => (
                  <div key={dateKey(day.date)} className="rounded-3xl bg-slate-900/90 p-4">
                    <div className="text-sm text-slate-400">{formatShortDate(day.date)}</div>
                    <div className="mt-2 text-base font-semibold text-white">{day.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80">
                <div className="grid grid-cols-4 gap-0 border-b border-slate-800 px-4 py-3 text-sm text-slate-400 sm:grid-cols-6">
                  <span>Date</span>
                  <span>Day</span>
                  <span>Plan</span>
                  <span>Status</span>
                  <span className="hidden sm:inline">Badge</span>
                  <span className="hidden lg:inline">Notes</span>
                </div>
                <div className="max-h-[460px] overflow-y-auto">
                  {timeline.map((day) => (
                    <div key={dateKey(day.date)} className="grid grid-cols-4 gap-0 border-t border-slate-800 px-4 py-3 text-sm sm:grid-cols-6">
                      <span>{formatShortDate(day.date)}</span>
                      <span>{day.date.toLocaleDateString('en-AU', { weekday: 'short' })}</span>
                      <span>{day.label}</span>
                      <span>{day.badge.split(' ')[0] === 'bg-sky-600/20' ? 'Work' : ''}</span>
                      <span className="hidden sm:inline">{day.badge.includes('emerald') ? 'Census' : day.badge.includes('amber') ? 'DCS' : day.badge.includes('indigo') ? 'Church' : ''}</span>
                      <span className="hidden lg:inline">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'calculator' && (
          <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_0.7fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Pay comparison calculator</h2>
                <p className="mt-3 text-slate-300">Adjust salary, hours and backup income to compare weekly and 12-week totals.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Avance full salary', key: 'avanceFteSalary', suffix: '', type: 'number' },
                    { label: 'Avance fraction', key: 'avanceFteFraction', suffix: '', type: 'number' },
                    { label: 'Census hourly rate', key: 'censusHourlyRate', suffix: '', type: 'number' },
                    { label: 'Census Thu hours', key: 'censusThuHours', suffix: '', type: 'number' },
                    { label: 'Census Fri hours', key: 'censusFriHours', suffix: '', type: 'number' },
                    { label: 'Census Sat hours', key: 'censusSatHours', suffix: '', type: 'number' },
                    { label: 'Census Sun hours', key: 'censusSunHours', suffix: '', type: 'number' },
                    { label: 'Sunglass Hut rate', key: 'sunglassHutRate', suffix: '', type: 'number' },
                    { label: 'Sunglass Hut hours', key: 'sunglassHutHours', suffix: '', type: 'number' },
                    { label: 'BCCS fortnightly', key: 'bccsFortnight', suffix: '', type: 'number' }
                  ].map((field) => (
                    <label key={field.key} className="block rounded-3xl bg-slate-900/90 p-4">
                      <span className="text-sm text-slate-400">{field.label}</span>
                      <input
                        type="number"
                        value={scenario[field.key as keyof Scenario] as number}
                        min={0}
                        step={field.key === 'avanceFteFraction' ? 0.1 : 1}
                        onChange={(event) => handleField(field.key as any, Number(event.target.value))}
                        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-500"
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="inline-flex items-center gap-3 rounded-3xl bg-slate-900/90 p-4">
                    <input
                      type="checkbox"
                      checked={scenario.sundayCensus}
                      onChange={(event) => handleField('sundayCensus', event.target.checked)}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-sky-500"
                    />
                    <span className="text-sm text-slate-300">Include Sunday afternoon Census</span>
                  </label>
                  <label className="inline-flex items-center gap-3 rounded-3xl bg-slate-900/90 p-4">
                    <input
                      type="checkbox"
                      checked={scenario.includeBccs}
                      onChange={(event) => handleField('includeBccs', event.target.checked)}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-violet-500"
                    />
                    <span className="text-sm text-slate-300">Include BCCS bus driving</span>
                  </label>
                  <label className="inline-flex items-center gap-3 rounded-3xl bg-slate-900/90 p-4">
                    <input
                      type="checkbox"
                      checked={scenario.includeSunglassHut}
                      onChange={(event) => handleField('includeSunglassHut', event.target.checked)}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-fuchsia-500"
                    />
                    <span className="text-sm text-slate-300">Include Sunglass Hut backup</span>
                  </label>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Scenario controls</h2>
                <div className="mt-5 grid gap-4">
                  <label className="block rounded-3xl bg-slate-900/90 p-4">
                    <span className="text-sm text-slate-400">Scenario name</span>
                    <input
                      type="text"
                      value={scenario.scenarioName}
                      onChange={(event) => handleField('scenarioName', event.target.value)}
                      className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="inline-flex items-center gap-3 rounded-3xl bg-slate-900/90 p-4">
                      <input
                        type="checkbox"
                        checked={scenario.censusConfirmed}
                        onChange={(event) => handleField('censusConfirmed', event.target.checked)}
                        className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-emerald-500"
                      />
                      <span className="text-sm text-slate-300">Census confirmed</span>
                    </label>
                    <label className="inline-flex items-center gap-3 rounded-3xl bg-slate-900/90 p-4">
                      <input
                        type="checkbox"
                        checked={scenario.avanceMonWed}
                        onChange={(event) => handleField('avanceMonWed', event.target.checked)}
                        className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-sky-500"
                      />
                      <span className="text-sm text-slate-300">Keep Avance Mon/Wed</span>
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block rounded-3xl bg-slate-900/90 p-4">
                      <span className="text-sm text-slate-400">Census start date</span>
                      <input
                        type="date"
                        value={scenario.censusStart}
                        onChange={(event) => handleField('censusStart', event.target.value)}
                        className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                      />
                    </label>
                    <label className="block rounded-3xl bg-slate-900/90 p-4">
                      <span className="text-sm text-slate-400">Census end date</span>
                      <input
                        type="date"
                        value={scenario.censusEnd}
                        onChange={(event) => handleField('censusEnd', event.target.value)}
                        className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                      />
                    </label>
                  </div>
                  <label className="inline-flex items-center gap-3 rounded-3xl bg-slate-900/90 p-4">
                    <input
                      type="checkbox"
                      checked={scenario.avance08AfterCensus}
                      onChange={(event) => handleField('avance08AfterCensus', event.target.checked)}
                      className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-cyan-500"
                    />
                    <span className="text-sm text-slate-300">Begin Avance 0.8 after Census</span>
                  </label>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={handleReset} className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700">
                    Reset defaults
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Pay summary</h2>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-slate-900/90 p-5">
                    <p className="text-sm text-slate-400">Avance 0.8 weekly</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatMoney(stats.avance08Weekly)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-5">
                    <p className="text-sm text-slate-400">Avance Mon/Wed weekly</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatMoney(stats.avanceMwWeekly)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-5">
                    <p className="text-sm text-slate-400">Census weekly (current hours)</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatMoney(stats.censusPay)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-5">
                    <p className="text-sm text-slate-400">Combined weekly</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatMoney(stats.totalWeekly)}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-5">
                    <p className="text-sm text-slate-400">12-week total</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatMoney(stats.total12Week)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Pay insights</h2>
                <p className="mt-4 text-slate-300">If Avance Mon/Wed plus Census is active, the break-even point is about {stats.breakEvenCensusHours.toFixed(1)} Census hours per week to match Avance 0.8.</p>
                <p className="mt-4 text-slate-300">Including BCCS adds {formatMoney(stats.bccsWeekly)}/week. Sunglass Hut adds {formatMoney(stats.sunglassWeekly)}/week.</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'decisions' && (
          <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_0.7fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Decision tree</h2>
                <div className="mt-5 space-y-5 text-slate-300">
                  <div>
                    <p className="font-semibold text-white">Step 1: Wait for Census offer confirmation</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                      <li>Confirm start and end dates.</li>
                      <li>Confirm likely weekly hours and Sunday availability.</li>
                      <li>Protect Tuesday and church morning by default.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-white">If Census confirmed</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                      <li>Finish DCS on Friday 3 July.</li>
                      <li>Keep Avance on Mondays and Wednesdays.</li>
                      <li>Do Census Thursday, Friday, Saturday and possible Sunday afternoons.</li>
                      <li>Plan to transition to Avance 0.8 after 1 October.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-white">If Census not confirmed</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                      <li>Keep DCS until Friday 17 July.</li>
                      <li>Start Avance 0.8 on Monday 20 July.</li>
                      <li>Protect Tuesday for admin, appointments or recovery.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-white">If Avance becomes unsustainable</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                      <li>Reduce Avance days if possible.</li>
                      <li>Use Census, Sunglass Hut or BCCS as bridge options.</li>
                      <li>Keep focus on energy, family and clear next actions.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Energy & wellbeing view</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[
                    { title: 'Income', value: 'Strong for Avance 0.8; boosted with Census' },
                    { title: 'Career growth', value: 'Avance has IT value; Census gives seasonal community strength' },
                    { title: 'Movement / community', value: 'Census is better; Sunglass Hut is social; BCCS is local' },
                    { title: 'Screen time', value: 'Avance is higher; Census is lower' },
                    { title: 'Social contact', value: 'Census and Sunglass Hut are higher; Avance is more office based' },
                    { title: 'Nervous system cost', value: 'Watch long weeks and Sunday afternoons' },
                    { title: 'Flexibility', value: 'Tuesday off and protected church mornings are essential' },
                    { title: 'Stability', value: 'Avance 0.8 is most stable; Census is fixed-term' },
                    { title: 'Family sustainability', value: 'Protect rest days and keep routines simple' }
                  ].map((item) => (
                    <div key={item.title} className="rounded-3xl bg-slate-900/90 p-4">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{item.title}</p>
                      <p className="mt-3 text-sm text-slate-300">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Clash detector</h2>
                <ul className="mt-4 list-disc space-y-3 pl-5 text-slate-300">
                  <li>Tuesday should stay off unless manually overridden.</li>
                  <li>Sunday morning remains church; Sunday afternoon can be Census if needed.</li>
                  <li>Thursday 9 July is a key date for Census start and Avance planning.</li>
                  <li>BCCS afternoon runs may clash with Avance finish times.</li>
                  <li>Seven-day stretch of work increases fatigue risk.</li>
                  <li>Census ending 1 October means a new plan should be lined up before that date.</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Quick checklist</h2>
                <div className="mt-4 space-y-5 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold text-white">Before deciding</p>
                    <ul className="mt-2 list-inside list-disc space-y-2">
                      <li>Wait for Census offer.</li>
                      <li>Confirm Census start, end and hours.</li>
                      <li>Confirm Sunday availability and DCS last day.</li>
                      <li>Confirm Avance days with Andy.</li>
                      <li>Confirm family impact with Kristy.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-white">If Census confirmed</p>
                    <ul className="mt-2 list-inside list-disc space-y-2">
                      <li>Tell DCS final date 3 July.</li>
                      <li>Tell Andy before booking flights.</li>
                      <li>Block Tuesdays and Sunday mornings.</li>
                      <li>Prepare Census paperwork and devices.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-white">If Census not confirmed</p>
                    <ul className="mt-2 list-inside list-disc space-y-2">
                      <li>Confirm DCS final day 17 July.</li>
                      <li>Start Avance 0.8 on 20 July.</li>
                      <li>Protect Tuesdays.</li>
                      <li>Monitor energy and screen fatigue.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'notes' && (
          <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_0.7fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Message drafts</h2>
                <div className="mt-5 space-y-5 text-slate-300">
                  {[
                    {
                      title: 'To DCS if Census confirmed',
                      body: 'Hi [Name], I’m writing to confirm that my final working day at DCS will be Friday 3 July 2026. Thank you for the opportunity to work with the school. I’ll do what I can to hand over clearly before I finish. Kind regards, Josh'
                    },
                    {
                      title: 'To Andy if Census confirmed',
                      body: 'Hi Andy, Census work is likely going ahead, so my plan is to finish DCS on Friday 3 July and keep Avance on Mondays and Wednesdays during the Census period. Census would mostly be Thursday, Friday, Saturday and possibly Sunday afternoons. From early October, once Census finishes, I’d like to talk about moving into the 0.8 Avance pattern if that still suits. Let me know if that works before you book flights.'
                    },
                    {
                      title: 'To Andy if no Census',
                      body: 'Hi Andy, Census hasn’t come through, so my plan is to finish DCS on Friday 17 July and then move into the 0.8 Avance pattern from Monday 20 July, if that still works for you.'
                    },
                    {
                      title: 'To Census',
                      body: 'Hi Tanya, thanks for the opportunity. Could you please confirm the expected start date, end date, typical weekly hours for my local area, and whether Thursday/Friday/Saturday plus Sunday afternoons would be suitable availability?'
                    },
                    {
                      title: 'To BCCS',
                      body: 'Hi Jono, thanks for confirming. I’m interested, but I’d need to work out whether it can fit around my Avance IT work. Would BCCS be looking for someone Monday–Friday only, or would there be any possibility of job-sharing some days? Also, would the school cover or reimburse the LR licence, Bus Driver Authority, medical/police check, and required training costs?'
                    }
                  ].map((item) => (
                    <div key={item.title} className="rounded-3xl bg-slate-900/90 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(item.body)}
                          className="rounded-2xl bg-sky-600 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-500"
                        >
                          Copy text
                        </button>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap rounded-3xl bg-slate-800/90 p-4 text-sm text-slate-200">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Trainer notes</h2>
                <textarea
                  value={scenario.notes}
                  onChange={(event) => handleField('notes', event.target.value)}
                  rows={8}
                  placeholder="Write a short note you can keep with this scenario."
                  className="mt-5 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-4 text-slate-100 outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Import / export</h2>
                <p className="mt-4 text-slate-300">Use the export button to save this scenario. Import JSON to restore saved settings or compare alternative plans.</p>
                <div className="mt-5 flex flex-col gap-3">
                  <button type="button" onClick={handleExport} className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-500">Export current scenario</button>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700">
                    Import scenario JSON
                    <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
                  </label>
                  <button type="button" onClick={handleReset} className="rounded-2xl bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-600">Reset current scenario</button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-glow">
                <h2 className="text-xl font-semibold text-white">Exports available</h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-300">
                  <li>JSON export for saved scenario data</li>
                  <li>Browser print using your device print dialog</li>
                  <li>Copy message drafts for email or chat</li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
