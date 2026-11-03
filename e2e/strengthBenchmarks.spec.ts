import {test,expect} from '@playwright/test';
import {estimatedOneRepMax,strengthBenchmark,trainingBlockProgress} from '../src/arc/strengthBenchmarks';
import type {SessionRecord} from '../src/storage';
const session=(id:string,completedAt:string,weight:number,reps:number):SessionRecord=>({
  id,name:'Strength',completedAt,sets:[{exerciseId:'squat',exerciseName:'Squat',set:{
    weight,reps,rir:2,kind:'Working',completedAt
  }}]
});
test('benchmarks compare first and latest sessions chronologically',()=>{
  const history=[session('b','2026-11-02T10:00:00Z',120,5),session('a','2026-10-02T10:00:00Z',100,5)];
  const result=strengthBenchmark(history,'squat');
  expect(result?.sessions).toBe(2);
  expect(result?.baselineEstimatedOneRepMax).toBeCloseTo(116.7,1);
  expect(result?.latestEstimatedOneRepMax).toBe(140);
  expect(result?.changePercent).toBeGreaterThan(0);
  expect(strengthBenchmark(history,'bench')).toBeNull();
});
test('estimates exclude unreliable high-rep and invalid sets',()=>{
  expect(estimatedOneRepMax(100,15)).toBeNull();
  expect(estimatedOneRepMax(0,5)).toBeNull();
  expect(estimatedOneRepMax(100,1)).toBeCloseTo(103.3,1);
});
test('training blocks evaluate targets from actual logged sessions',()=>{
  const history=[session('b','2026-11-02T10:00:00Z',120,5)];
  const progress=trainingBlockProgress({
    id:'block-1',startDate:'2026-10-01',endDate:'2026-12-01',
    objective:'Improve squat strength',targetExerciseId:'squat',
    targetEstimatedOneRepMax:135,assessmentDates:[]
  },history);
  expect(progress.targetReached).toBe(true);
  expect(progress.benchmark?.latestWorkingVolume).toBe(600);
});
