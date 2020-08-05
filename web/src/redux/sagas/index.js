import {all} from 'redux-saga/effects';
import configSaga from './configSaga';
import dashboardSaga from './dashboardSaga';
import alertingSaga from './alertingSaga';


export default function* index() {
    yield all([
      configSaga(),
      dashboardSaga(),
      alertingSaga(),
    ]);
}