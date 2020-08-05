import {all, put, takeLatest, takeEvery} from 'redux-saga/effects';
import request, {DELETE, GET, POST, PUT} from '../../services/requests';
import * as actionTypes from '../actions/actionTypes';
import {API_URL} from '../../configuration/config';

function* fetchAlertingGroups() {
  try {
    const response = yield request(GET, API_URL + 'alertinggroups/');
    yield put({type: actionTypes.ALERTING_GROUPS_FETCH_SUCCESS, payload: response.data.results});
  } catch (error) {
    yield console.error(error);
    yield put({type: actionTypes.ALERTING_GROUPS_FETCH_FAILED, error});
  }
}

function* saveAlertingGroupConfig(action) {
  try {
    if(action.payload.isNew) {
      yield request(POST, API_URL + `alertinggroups/`, action.payload.data);
    } else {
      yield request(PUT, API_URL + `alertinggroups/${action.payload.data.id}/`, action.payload.data);
    }
    yield put({type: actionTypes.ALERTING_GROUP_SAVE_CONFIG_SUCCESS});
  } catch (error) {
    console.error(error);
    yield put({type: actionTypes.ALERTING_GROUP_SAVE_CONFIG_FAILED, error});
  }
}

function* deleteAlertingGroups(action) {
  try {
    yield request(DELETE, API_URL + `alertinggroups/${action.payload.id}/`);
    yield put({type: actionTypes.DELETE_ALERTING_GROUP_SUCCESS});
  } catch (error) {
    console.error(error);
    yield put({type: actionTypes.DELETE_ALERTING_GROUP_FAILED, error});
  }
}

export default function* alertingSaga() {
  yield all([
    yield takeLatest([actionTypes.ALERTING_GROUPS_FETCH, actionTypes.ALERTING_GROUP_SAVE_CONFIG_SUCCESS, actionTypes.DELETE_ALERTING_GROUP_SUCCESS], fetchAlertingGroups),
    yield takeEvery(actionTypes.DELETE_ALERTING_GROUP, deleteAlertingGroups),
    yield takeEvery(actionTypes.ALERTING_GROUP_SAVE_CONFIG, saveAlertingGroupConfig),
  ]);
}
