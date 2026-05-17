import api from '../lib/api';

const p = (period: string) => ({ params: { period } });

export const getStatsSummary   = (period = 'month'): Promise<unknown> => api.get('/stats/summary', p(period)).then(({ data }) => data);
export const getXpHistory      = (period = 'month'): Promise<unknown> => api.get('/stats/xp-history', p(period)).then(({ data }) => data);
export const getActivityRadar  = (): Promise<unknown>                  => api.get('/stats/radar').then(({ data }) => data);
export const getFinanceTrend   = (): Promise<unknown[]>                => api.get('/stats/finance-trend').then(({ data }) => data);
export const getHabitHeatmap   = (): Promise<unknown[]>                => api.get('/stats/heatmap').then(({ data }) => data);
export const getSleepScatter   = (period = 'month'): Promise<unknown[]> => api.get('/stats/sleep', p(period)).then(({ data }) => data);
export const getGymProgression = (period = 'month'): Promise<unknown[]> => api.get('/stats/gym', p(period)).then(({ data }) => data);
export const getPredictions    = (): Promise<unknown>                  => api.get('/stats/predictions').then(({ data }) => data);
