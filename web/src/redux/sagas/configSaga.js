import {all, put, takeLatest, takeEvery} from 'redux-saga/effects';
import request, {DELETE, GET, POST, PUT} from '../../services/requests';
import * as actionTypes from '../actions/actionTypes';
import {API_URL} from '../../configuration/config';

function* fetchCameras() {
  try {
    const response = yield request(GET, API_URL + 'cameras/');
    yield put({type: actionTypes.CAMERAS_FETCH_SUCCESS, payload: response.data.results});
  } catch (error) {
    console.error(error);
    yield put({type: actionTypes.CAMERAS_FETCH_FAILED, error});
  }
}

function* fetchPendingCameras() {
  try {
    const response = yield request(GET, API_URL + 'pendingcameras/');
    yield put({type: actionTypes.PENDING_CAMERAS_FETCH_SUCCESS, payload: response.data.results});
  } catch (error) {
    console.error(error);
    yield put({type: actionTypes.PENDING_CAMERAS_FETCH_FAILED, error});
  }
}

function* saveCameraConfig(action) {
  try {
    const payload = {
      ...action.payload.data,
      zones: action.payload.data.zones.filter(zone => zone.polygon.length > 0).map(zone => ({...zone, camera: action.payload.data.camera_id})),
    };

    if(action.payload.isNew) {
      yield request(POST, API_URL + `cameras/`, payload);
    } else {
      yield request(PUT, API_URL + `cameras/${payload.camera_id}/`, payload);
    }
    yield put({type: actionTypes.CONFIGURE_MODAL_SAVE_CONFIG_SUCCESS});
  } catch (error) {
    console.error(error);
    yield put({type: actionTypes.CONFIGURE_MODAL_SAVE_CONFIG_FAILED, error});
  }
}

function* deleteCameras(action) {
  try {
    yield request(DELETE, API_URL + `cameras/${action.payload.camera_id}/`);
    yield put({type: actionTypes.DELETE_CAMERA_SUCCESS});
  } catch (error) {
    console.error(error);
    yield put({type: actionTypes.DELETE_CAMERA_FAILED, error});
  }
}

function* deletePendingCameras(action) {
  try {
    yield request(DELETE, API_URL + `pendingcameras/${action.payload.camera_id}/`);
    yield put({type: actionTypes.DELETE_PENDING_CAMERA_SUCCESS});
  } catch (error) {
    console.error(error);
    yield put({type: actionTypes.DELETE_PENDING_CAMERA_FAILED, error});
  }
}

export default function* configSaga() {
  yield all([
    yield takeLatest([actionTypes.CAMERAS_FETCH, actionTypes.CONFIGURE_MODAL_SAVE_CONFIG_SUCCESS, actionTypes.DELETE_CAMERA_SUCCESS], fetchCameras),
    yield takeLatest([actionTypes.PENDING_CAMERAS_FETCH, actionTypes.DELETE_PENDING_CAMERA_SUCCESS,
      actionTypes.CONFIGURE_MODAL_SAVE_CONFIG_SUCCESS], fetchPendingCameras),
    yield takeLatest(actionTypes.CONFIGURE_MODAL_SAVE_CONFIG, saveCameraConfig),
    yield takeEvery(actionTypes.DELETE_PENDING_CAMERA, deletePendingCameras),
    yield takeEvery(actionTypes.DELETE_CAMERA, deleteCameras),
  ]);
}
