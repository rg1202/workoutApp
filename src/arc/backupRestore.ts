import type { ArcBackup } from './dataBackup';

export function parseBackup(source: string): ArcBackup {
  const value: unknown = JSON.parse(source);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid backup file');
  const obj = value as Record<string, unknown>;
  if (obj.format !== 'arc-local-backup' || obj.version !== 1) throw new Error('Unsupported backup version');
  if (typeof obj.exportedAt !== 'string' || !Number.isFinite(Date.parse(obj.exportedAt))) throw new Error('Invalid backup date');
  if (!obj.data || typeof obj.data !== 'object' || Array.isArray(obj.data)) throw new Error('Invalid backup entries');
  for (const [key, entry] of Object.entries(obj.data)) {
    if (!(key.startsWith('arc.') || key.startsWith('workoutapp.')) || typeof entry !== 'string') throw new Error('Invalid backup entry');
    if (key === 'workoutapp.sidebar-collapsed.v1') {
      if (entry !== '0' && entry !== '1') throw new Error('Invalid sidebar setting');
      continue;
    }
    const decoded: unknown = JSON.parse(entry);
    if (key === 'workoutapp.goals.v2') {
      if (!Array.isArray(decoded) || !decoded.every(goal =>
        goal !== null && typeof goal === 'object' && !Array.isArray(goal) &&
        typeof goal.id === 'string' && goal.id.length > 0 &&
        typeof goal.name === 'string' && goal.name.trim().length > 0 &&
        ['Active', 'Completed', 'Paused'].includes(goal.status) &&
        typeof goal.type === 'string'
      )) throw new Error('Invalid goals in backup');
    }
  }
  return obj as ArcBackup;
}

export function restoreBackup(backup: ArcBackup, storage: Storage = localStorage): number {
  const verified = parseBackup(JSON.stringify(backup));
  const previous = new Map<string, string>();
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && (key.startsWith('arc.') || key.startsWith('workoutapp.'))) {
      const value = storage.getItem(key);
      if (value !== null) previous.set(key, value);
    }
  }
  const touched = new Set([...previous.keys(), ...Object.keys(verified.data)]);
  try {
    for (const key of touched) {
      if (Object.hasOwn(verified.data, key)) storage.setItem(key, verified.data[key]);
      else storage.removeItem(key);
    }
  } catch {
    let rollbackFailed = false;
    for (const key of touched) {
      try {
        if (previous.has(key)) storage.setItem(key, previous.get(key)!);
        else storage.removeItem(key);
      } catch {
        rollbackFailed = true;
      }
    }
    throw new Error(rollbackFailed
      ? 'Restore failed and rollback was incomplete. Do not reload; recover from a separate backup.'
      : 'Restore failed; original data restored');
  }
  return Object.keys(verified.data).length;
}
