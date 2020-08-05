import {all, put, takeLatest, select} from 'redux-saga/effects';
import request, {GET} from '../../services/requests';
import * as actionTypes from '../actions/actionTypes';
import {API_URL} from '../../configuration/config';
import _ from 'lodash';
import {incidentsSelector} from "../selectors/dashboard";

function* fetchIncidents() {
  try {
    const {activeItem, page, pageSize} = yield select(incidentsSelector);
    const zones = _.get(activeItem, 'zones', []).map(item => item.id);
    const response = yield request(
      GET,
      API_URL + 'incidents/',
      null,
      {
        params: {
          "zone__in": zones.join(','),
          "limit": pageSize,
          "offset": (page - 1) * +pageSize,
        }
      }
    );
    yield put({type: actionTypes.INCIDENTS_FETCH_SUCCESS, payload: response.data});
  } catch (error) {
    console.error(error);
    yield put({type: actionTypes.INCIDENTS_FETCH_FAILED, error});
  }
}

export default function* dashboardSaga() {
  yield all([
    yield takeLatest([actionTypes.INCIDENTS_FETCH, actionTypes.INCIDENTS_CHANGE_PAGE_SIZE, actionTypes.INCIDENTS_CHANGE_PAGE], fetchIncidents),
  ]);
}
