import * as actionTypes from '../actions/actionTypes';

const DEFAULT_STATE = {
  pending: [],
  cameras: [],
};

const configReducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case '@@router/LOCATION_CHANGE': {
      return DEFAULT_STATE
    }
    case actionTypes.PENDING_CAMERAS_FETCH_SUCCESS: {
      return {
        ...state,
        pending: action.payload,
      }
    }
    case actionTypes.CAMERAS_FETCH_SUCCESS: {
      return {
        ...state,
        cameras: action.payload,
      }
    }
    default: {
      return state;
    }
  }
};

export default configReducer;
