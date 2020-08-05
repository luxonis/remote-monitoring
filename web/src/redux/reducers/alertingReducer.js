import * as actionTypes from '../actions/actionTypes';

const DEFAULT_STATE = {
  groups: [],
};

const alertingReducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case '@@router/LOCATION_CHANGE': {
      return DEFAULT_STATE;
    }
    case actionTypes.ALERTING_GROUPS_FETCH_SUCCESS: {
      return {
        ...state,
        groups: action.payload,
      }
    }
    default: {
      return state;
    }
  }
};

export default alertingReducer;
