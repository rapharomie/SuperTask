# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then production build
- `npm run lint` — ESLint over the repo
- `npm run preview` — preview the production build

There is no test runner configured.

## Stack

React 19 + TypeScript + Vite 8 + Tailwind v4 (via `@tailwindcss/vite`) + Supabase (optional). UI is in **Portuguese (pt-BR)** — both labels and several domain enum values (`'pendente'`, `'em_andamento'`, `'concluída'`, `'cancelada'`).

## Architecture

### Local-first with optional Supabase sync

The app must work with **no backend**. `src/lib/supabase.ts` reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from env; when either is missing, `supabase` is `null` and `isSupabaseConfigured()` returns false. Every Supabase call site in `useTasks`/`useSettings` is gated by this check and silently falls back to a `localStorage` cache (`src/utils/sync.ts`, keys in `LS_KEYS`). When adding any persistence code, always guard with `isSupabaseConfigured() && supabase` and keep the local path working.

On first run with no cached/remote tasks, `useTasks` seeds `SAMPLE_TASKS` from `constants.ts` and sets the `supertask-seeded` flag.

### Priority scoring model

Tasks are scored across **10 dimensions** defined in `src/utils/constants.ts` (`DIMENSIONS`). Each dimension is 0–10. Some are **inverted** (`inverted: true`) — for those, a *higher* numeric value means the task is *easier/cheaper* (e.g. `tempoExecucao: 10` = "less than 30 minutes"). The 0–10 → semantic label mapping lives in each dimension's `descriptions` object. When adding/changing dimensions, update both the type union in `src/types/index.ts` (`DimensionKey`), the `DIMENSIONS` array, the DB schema columns (`dim_*`), and the mapping in `rowToTask`/`taskToRow` (`src/utils/helpers.ts`).

There are **two priority-score computations** and they intentionally differ:
- **DB**: `priority_score` is a `GENERATED ALWAYS` column that sums all 10 `dim_*` columns (0–100 only if every dim is filled).
- **App**: `calculatePriorityScore` in `src/utils/scoring.ts` sums only the dimensions in `settings.activeDimensions` and **normalizes to 0–100** based on how many are active. `useTasks` recalculates this on every load and whenever active dimensions change, overwriting whatever the DB returned. Sorting/UI always uses the app-computed value.

### Data model and mapping

App-side types are camelCase (`Task`, `dimensions.impactoFinanceiro`); DB rows are snake_case (`TaskRow`, `dim_impacto_financeiro`). The boundary is `rowToTask` / `taskToRow` in `src/utils/helpers.ts` — anything that talks to Supabase must go through these. The `updateTask` mutation in `useTasks.ts` builds its own partial row inline rather than calling `taskToRow`; keep both in sync when adding fields.

### Soft delete + trash

`deletedAt: string | null` on each task drives soft delete. `useTasks` derives `tasks` (active), `trashTasks` (deleted within 30 days), and `allTasks`. Permanent purge is manual (`emptyTrash`, `permanentDeleteTask`) plus an optional `purge_old_trash()` Postgres function (commented pg_cron schedule in the migration).

### Settings

`user_settings` is a key/value table (`setting_key` + `setting_value JSONB`) — one row per setting per user, not a single JSON blob. `useSettings` reads/writes the four keys `tags`, `classifications`, `tag_colors`, `active_dimensions` and mirrors everything to `localStorage`.

### Multi-user / RLS

The schema has full RLS policies keyed on `auth.uid()` and an `on_auth_user_created` trigger that seeds per-user default settings — but the app currently uses only the anon key and has no auth UI. Treat the app as single-user-by-deployment for now; the RLS scaffolding is intentional groundwork.

### UI shell

`App.tsx` is the single composition root. It owns: theme (`dark` class on `<html>`, persisted via `getSavedTheme`/`saveTheme`), sidebar collapsed state, current view (`kanban` | `lista` | `cards`), and modal flags for `TaskForm` / `SettingsPanel` / `TrashView`. Keyboard shortcuts (`n`, `1`/`2`/`3`, `/`, `Esc`) are wired in an effect that early-returns when focus is in a form element.

`TaskForm` is remounted via a `formKey` counter on each open so the internal form state resets — preserve this pattern when touching the form open/close flow.

`handleBreakIntoSubtasks` in `App.tsx` creates N independent task cards from a parent + list of step strings (it does *not* create a hierarchical relationship — there is no parent_id in the schema).

## Environment

Copy `.env.example` → `.env` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` to enable sync. Schema lives in `supabase/migrations/001_initial_schema.sql` — apply it manually in the Supabase SQL editor (no migration runner is wired up).
