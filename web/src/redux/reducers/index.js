import {combineReducers} from "redux";
import { connectRouter } from 'connected-react-router';
import dashboard from './dashboardReducer';
import config from './configReducer';
import page from './pageReducer';
import alerting from './alertingReducer';

export default history => combineReducers({
    dashboard,
    config,
    page,
    alerting,
    router: connectRouter(history),
});
