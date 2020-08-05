import * as actionTypes from '../actions/actionTypes';
import {DISPLAY_PICTURE} from "../actions/actionTypes";

const DEFAULT_STATE = {
  modal: {},
};

const DEFAULT_CAMERA_CONFIG = {
  zones: [
    {polygon: []}
  ],
  video_storage: 'cloud',
  disk_full_action: 'rolling'
};

const pageReducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case '@@router/LOCATION_CHANGE': {
      return DEFAULT_STATE;
    }
    case actionTypes.CONFIGURE_PENDING_CAMERA:
    case actionTypes.CONFIGURE_CAMERA: {
      return {
        ...state,
        modal: {
          id: 'configure-camera',
          selectedZone: 0,
          data: {
            ...DEFAULT_CAMERA_CONFIG,
            ...action.payload
          },
          isNew: action.type === actionTypes.CONFIGURE_PENDING_CAMERA,
        }
      }
    }
    case actionTypes.DISPLAY_VIDEO: {
      return {
        ...state,
        modal: {
          id: 'video-modal',
          data: action.payload,
        }
      }
    }
    case actionTypes.DISPLAY_PICTURE: {
      return {
        ...state,
        modal: {
          id: 'picture-modal',
          data: action.payload,
        }
      }
    }
    case actionTypes.UPDATE_MODAL_DATA: {
      return {
        ...state,
        modal: {
          ...state.modal,
          data: action.payload,
        }
      }
    }
    case actionTypes.ADD_ALERTING_GROUP:
    case actionTypes.CONFIGURE_ALERTING_GROUP: {
      return {
        ...state,
        modal: {
          id: 'configure-alerting-group-modal',
          data: action.payload,
          isNew: action.type === actionTypes.ADD_ALERTING_GROUP,
        }
      }
    }
    case actionTypes.CONFIGURE_MODAL_SAVE_CONFIG_SUCCESS:
    case actionTypes.ALERTING_GROUP_SAVE_CONFIG_SUCCESS:
    case actionTypes.CLOSE_MODAL: {
      return {
        ...state,
        modal: DEFAULT_STATE.modal,
      }
    }
    default: {
      return state;
    }
  }
};

export default pageReducer;
