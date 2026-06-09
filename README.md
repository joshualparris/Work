# DCS / Census / Avance Work Planner

A practical decision planning app for Josh Parris. This app compares DCS finish dates, Avance IT options, Census hours, and fallback roles like Sunglass Hut and BCCS bus driving.

## What this app does

- Shows Plan A and Plan B paths
- Builds a timeline from 10 June 2026 to 2 October 2026
- Compares weekly and 12-week income scenarios
- Detects schedule clashes and energy risk
- Stores a scenario in localStorage
- Exports and imports scenario JSON
- Includes editable message drafts and checklist items

## Run locally

From `C:\dev\CensusDcsAvance\DCSCensusAvance`:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Editing scenarios

- Use the pay calculator tab to update Avance salary, Census hours, BCCS and Sunglass Hut values.
- Toggle Census confirmed / not confirmed.
- Toggle Avance Mon/Wed and whether Avance 0.8 starts after Census.
- Toggle alternate Census start to switch the date to 12 August.
- Use export/import JSON to save and restore custom scenarios.

## Comparing pay

- The app calculates Avance 0.8 income, Avance Mon/Wed income, Census weekly income, and combined totals.
- It also shows a break-even Census hour target.

## Export / print

- Use the export button to download scenario JSON.
- Use the browser print dialog to print the current page.

## GitHub push

```bash
git init
git add .
git commit -m "Create DCS Census Avance Work Planner app"
git remote add origin https://github.com/joshualparris/Work
git push -u origin main
```

## Vercel deploy

- Link `https://github.com/joshualparris/Work` in Vercel.
- Set the root directory to `DCSCensusAvance`.
- Use `npm install` and `npm run build`.
- No backend or external API keys are required.
