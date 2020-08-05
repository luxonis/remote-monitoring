import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import {Provider} from 'react-redux'
import {applyMiddleware, createStore} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import rootReducer from './redux/reducers';
import rootSaga from './redux/sagas';
import {createBrowserHistory} from 'history';
import {ConnectedRouter, routerMiddleware} from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import Routes from "./configuration/Routes";
import 'leaflet/dist/leaflet.css';
import './styles/index.less';

const history = createBrowserHistory();
const sagaMiddleware = createSagaMiddleware();

export const store = createStore(
    rootReducer(history),
    composeWithDevTools(
        applyMiddleware(
            routerMiddleware(history),
            sagaMiddleware,
        )
    )
);

sagaMiddleware.run(rootSaga);

ReactDOM.render(
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <Routes/>
            </ConnectedRouter>
        </Provider>
    , document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
