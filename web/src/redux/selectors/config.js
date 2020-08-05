import {createSelector} from 'reselect';

export const configBranch = state => state.config;

export const pendingSelector = createSelector(
  configBranch,
  store => store.pending
);

export const camerasSelector = createSelector(
  configBranch,
  store => store.cameras
);

export const configSelector = createSelector(
  configBranch,
  store => store.config
);
