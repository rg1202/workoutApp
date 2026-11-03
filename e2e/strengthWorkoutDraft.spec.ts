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
