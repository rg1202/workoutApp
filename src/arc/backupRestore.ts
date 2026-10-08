import { isBackupKey, type ArcBackup } from './dataBackup';

export function parseBackup(source: string): ArcBackup {
  const value: unknown = JSON.parse(source);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid backup file');
  const obj = value as Record<string, unknown>;
  if (obj.format !== 'arc-local-backup' || obj.version !== 1) throw new Error('Unsupported backup version');
  // Explicit version gate: future formats require a reviewed migration, not implicit coercion.
  if (Object.prototype.hasOwnProperty.call(obj, 'schemaVersion') && obj.schemaVersion !== 1)
    throw new Error('Unsupported backup schema; migration required');
  if (typeof obj.exportedAt !== 'string' || !Number.isFinite(Date.parse(obj.exportedAt))) throw new Error('Invalid backup date');
  if (!obj.data || typeof obj.data !== 'object' || Array.isArray(obj.data)) throw new Error('Invalid backup entries');
  // Reject unsupported future storage-key versions rather than treating them as compatible.
  const supportedVersions: Record<string, number> = {
    'workoutapp.goals': 2,
    'workoutapp.planned-activities': 1,
    'workoutapp.history': 2,
    'workoutapp.programs': 3,
    'workoutapp.active-session': 3,
    'workoutapp.checkins': 1,
    'workoutapp.body-metrics': 1,
    'workoutapp.injuries': 1,
    'arc.units': 1,
    'arc.state-history': 1
  };
  for (const key of Object.keys(obj.data as Record<string, unknown>)) {
    const match = /^(.*)\.v(\d+)$/.exec(key);
    if (match && Object.hasOwn(supportedVersions, match[1]) &&
        Number(match[2]) > supportedVersions[match[1]]) {
      throw new Error('Unsupported storage schema for '+key+'; migration required');
    }
  }
  for (const [key, entry] of Object.entries(obj.data)) {
    if (!isBackupKey(key) || typeof entry !== 'string') throw new Error('Invalid backup entry');
    if (key === 'workoutapp.sidebar-collapsed.v1') {
      if (entry !== '0' && entry !== '1') throw new Error('Invalid sidebar setting');
      continue;
    }
    const decoded: unknown = JSON.parse(entry);
    const object = (item: unknown): item is Record<string, unknown> =>
      item !== null && typeof item === 'object' && !Array.isArray(item);
    const records = (predicate: (item: Record<string, unknown>) => boolean) =>
      Array.isArray(decoded) && decoded.every(item => object(item) && predicate(item));
    if (key === 'workoutapp.checkins.v1' &&
      !records(item => typeof item.date === 'string')) {
      throw new Error('Invalid check-ins in backup');
    }
    if (key === 'workoutapp.body-metrics.v1' &&
      !records(item => typeof item.id === 'string' && typeof item.date === 'string')) {
      throw new Error('Invalid body metrics in backup');
    }
    if (key === 'workoutapp.injuries.v1' &&
      !records(item => typeof item.id === 'string' && typeof item.name === 'string' &&
        ['Active', 'Improving', 'Resolved'].includes(String(item.status)))) {
      throw new Error('Invalid injury records in backup');
    }
    if (key === 'arc.state-history.v1' &&
      !records(item => typeof item.id === 'string' && typeof item.date === 'string' &&
        typeof item.recordedAt === 'string' && object(item.ratings))) {
      throw new Error('Invalid state history in backup');
    }
    if (key === 'arc.units.v1' &&
      (!object(decoded) || !['US', 'Metric'].includes(String(decoded.preset)))) {
      throw new Error('Invalid unit preferences in backup');
    }
    if (key === 'workoutapp.history.v2') {
      if (!Array.isArray(decoded) || !decoded.every(session =>
        session !== null && typeof session === 'object' && !Array.isArray(session) &&
        typeof session.id === 'string' && typeof session.name === 'string' &&
        Array.isArray(session.sets)
      )) throw new Error('Invalid session history in backup');
    }
    if (key === 'workoutapp.planned-activities.v1') {
      if (!Array.isArray(decoded) || !decoded.every(plan =>
        plan !== null && typeof plan === 'object' && !Array.isArray(plan) &&
        typeof plan.id === 'string' && typeof plan.date === 'string' &&
        typeof plan.title === 'string' &&
        ['Planned', 'Completed', 'Skipped'].includes(plan.status)
      )) throw new Error('Invalid planned activities in backup');
    }
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
    if (key && isBackupKey(key)) {
      const value = storage.getItem(key);
      if (value !== null) previous.set(key, value);
    }
  }
  // Refuse destructive restore when an existing key cannot be read reliably.
  for (const [key, value] of previous) {
    if (storage.getItem(key) !== value) throw new Error('Storage changed during restore preparation; retry.');
  }
  const touched = new Set([...previous.keys(), ...Object.keys(verified.data)]);
  try {
    for (const key of touched) {
      if (Object.hasOwn(verified.data, key)) storage.setItem(key, verified.data[key]);
      else storage.removeItem(key);
    }
    // A storage adapter can acknowledge a write without persisting it.
    // Verify the full result before reporting a successful restore.
    for (const key of touched) {
      const expected = Object.hasOwn(verified.data, key) ? verified.data[key] : null;
      if (storage.getItem(key) !== expected) {
        throw new Error('Restore verification failed');
      }
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
    // A successful API call does not guarantee rollback actually persisted.
    if (!rollbackFailed) {
      for (const key of touched) {
        try {
          if (storage.getItem(key) !== (previous.get(key) ?? null)) rollbackFailed = true;
        } catch { rollbackFailed = true; }
      }
    }
    throw new Error(rollbackFailed
      ? 'Restore failed and rollback was incomplete. Do not reload; recover from a separate backup.'
      : 'Restore failed; original data restored');
  }
  return Object.keys(verified.data).length;
}

/** Human-readable, non-sensitive summary shown before destructive restore. */
export function previewBackup(backup: ArcBackup, storage: Storage = localStorage) {
  const verified = parseBackup(JSON.stringify(backup));
  const keys = Object.keys(verified.data);
  const existing = keys.filter(key => storage.getItem(key) !== null).length;
  const currentKeys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && isBackupKey(key)) currentKeys.push(key);
  }
  const removed = currentKeys.filter(key => !Object.prototype.hasOwnProperty.call(verified.data, key)).length;
  const count = (key: string) => {
    const raw = verified.data[key];
    if (!raw) return 0;
    try { const value: unknown = JSON.parse(raw); return Array.isArray(value) ? value.length : 0; }
    catch { return 0; }
  };
  return {
    exportedAt: verified.exportedAt,
    records: keys.length,
    replacing: existing,
    removing: removed,
    goals: count('workoutapp.goals.v2'),
    sessions: count('workoutapp.history.v2'),
    plannedActivities: count('workoutapp.planned-activities.v1')
  };
}
