import {createSelector} from 'reselect';

export const dashboardBranch = state => state.dashboard;

export const incidentsSelector = createSelector(
  dashboardBranch,
  dashboard => dashboard.incidents
);
