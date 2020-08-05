import localStore from 'store';

export const get = (key, defaultValue) => localStore.get(key, defaultValue);

export const set = (key, value) => localStore.set(key, value);

export const remove = (key) => localStore.remove(key);
