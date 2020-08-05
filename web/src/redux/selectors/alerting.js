import {createSelector} from 'reselect';

export const alertingBranch = state => state.alerting;

export const alertingGroups = createSelector(
  alertingBranch,
  alerting => alerting.groups
);