import type { Task, UserSettings, PendingSyncOperation } from '../types';
import { LS_KEYS } from './constants';

// ============================================
// LocalStorage helpers
// ============================================

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSetItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage write failed:', e);
  }
}

// ============================================
// Tasks cache
// ============================================

export function getCachedTasks(): Task[] {
  return safeGetItem<Task[]>(LS_KEYS.TASKS_CACHE, []);
}

export function setCachedTasks(tasks: Task[]): void {
  safeSetItem(LS_KEYS.TASKS_CACHE, tasks);
}

// ============================================
// Settings cache
// ============================================

export function getCachedSettings(): UserSettings | null {
  return safeGetItem<UserSettings | null>(LS_KEYS.SETTINGS_CACHE, null);
}

export function setCachedSettings(settings: UserSettings): void {
  safeSetItem(LS_KEYS.SETTINGS_CACHE, settings);
}

// ============================================
// Filters (local only)
// ============================================

export function getSavedFilters() {
  return safeGetItem(LS_KEYS.FILTERS, null);
}

export function saveFilters(filters: unknown): void {
  safeSetItem(LS_KEYS.FILTERS, filters);
}

// ============================================
// Theme
// ============================================

export function getSavedTheme(): 'light' | 'dark' | 'system' {
  return safeGetItem<'light' | 'dark' | 'system'>(LS_KEYS.THEME, 'system');
}

export function saveTheme(theme: 'light' | 'dark' | 'system'): void {
  safeSetItem(LS_KEYS.THEME, theme);
}

// ============================================
// Pending sync queue
// ============================================

export function getPendingOps(): PendingSyncOperation[] {
  return safeGetItem<PendingSyncOperation[]>(LS_KEYS.PENDING_SYNC, []);
}

export function addPendingOp(op: PendingSyncOperation): void {
  const ops = getPendingOps();
  ops.push(op);
  safeSetItem(LS_KEYS.PENDING_SYNC, ops);
}

export function clearPendingOps(): void {
  safeSetItem(LS_KEYS.PENDING_SYNC, []);
}

// ============================================
// Seed check
// ============================================

export function hasBeenSeeded(): boolean {
  return safeGetItem<boolean>(LS_KEYS.SEEDED, false);
}

export function markAsSeeded(): void {
  safeSetItem(LS_KEYS.SEEDED, true);
}
