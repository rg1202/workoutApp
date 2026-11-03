import { test, expect } from '@playwright/test';
import { emptyStrengthDraft, isStrengthDraft, strengthDraftKey } from '../src/arc/strengthWorkoutDraft';

const selection = {planId:'program:alpha:1:day-a',programId:'alpha',week:1,dayId:'day-a'};
test('draft keys isolate different planned workouts',()=>{
 expect(strengthDraftKey(selection.planId)).not.toBe(strengthDraftKey('program:alpha:1:day-b'));
 expect(strengthDraftKey(selection.planId)).toContain(encodeURIComponent(selection.planId));
});
test('new draft has no logged sets and retains planned identity',()=>{
 const draft=emptyStrengthDraft(selection);
 expect(draft.planId).toBe(selection.planId);
 expect(draft.logs).toEqual({});
 expect(isStrengthDraft(draft,selection.planId)).toBe(true);
 expect(isStrengthDraft(draft,'different')).toBe(false);
});
test('invalid or cleared drafts cannot be resumed',()=>{
 expect(isStrengthDraft(null,selection.planId)).toBe(false);
 expect(isStrengthDraft({planId:selection.planId,logs:{}},selection.planId)).toBe(false);
});

test('paused workout draft remains valid and retains its sets for resumption',()=>{
 const draft={...emptyStrengthDraft(selection),status:'Paused' as const,logs:{squat:[{weight:135,reps:5,rir:2,completedAt:'2026-11-02T18:00:00Z'}]}};
 expect(isStrengthDraft(draft,selection.planId)).toBe(true);
 expect(draft.logs.squat).toHaveLength(1);
 expect(draft.status).toBe('Paused');
});
