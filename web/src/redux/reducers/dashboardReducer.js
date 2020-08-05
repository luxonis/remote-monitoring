import * as actionTypes from '../actions/actionTypes';

const DEFAULT_STATE = {
  incidents: {
    activeItem: null,
    results: [],
    page: 1,
    pageSize: 10,
  }
};

const dashboardReducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case '@@router/LOCATION_CHANGE': {
      return DEFAULT_STATE;
    }
    case actionTypes.INCIDENTS_FETCH: {
      return {
        ...state,
        incidents: {
          ...state.incidents,
          results: DEFAULT_STATE.incidents.results,
        },
      }
    }
    case actionTypes.INCIDENTS_CHANGE_ACTIVE_ITEM: {
      return {
        ...state,
        incidents: {
          ...state.incidents,
          activeItem: action.payload,
        },
      }
    }
    case actionTypes.INCIDENTS_CHANGE_PAGE_SIZE: {
      return {
        ...state,
        incidents: {
          ...state.incidents,
          page: 1,
          pageSize: action.payload,
        },
      }
    }
    case actionTypes.INCIDENTS_CHANGE_PAGE: {
      return {
        ...state,
        incidents: {
          ...state.incidents,
          page: action.payload,
        },
      }
    }
    case actionTypes.INCIDENTS_FETCH_SUCCESS: {
      return {
        ...state,
        incidents: {
          ...state.incidents,
          results: action.payload.results,
          count: action.payload.count,
        },
      }
    }
    default: {
      return state;
    }
  }
};

export default dashboardReducer;
