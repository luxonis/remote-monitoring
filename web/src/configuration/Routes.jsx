import React from 'react';
import {INDEX_PATH, CAMERA_ADMIN_PATH, DASHBOARD_PATH, ALERTING_ADMIN_PATH} from "./paths";
import IndexPage from "../pages/IndexPage";
import Navigation from '../pages/navigation';
import {Route, Switch} from "react-router-dom";
import CameraAdminPage from "../pages/CameraAdminPage";
import DashboardPage from "../pages/DashboardPage";
import AlertingAdminPage from "../pages/AlertingAdminPage";

const Routes = () => (
    <Navigation>
        <Switch>
            <Route exact path={INDEX_PATH} component={IndexPage}/>
            <Route exact path={CAMERA_ADMIN_PATH} component={CameraAdminPage}/>
            <Route exact path={ALERTING_ADMIN_PATH} component={AlertingAdminPage}/>
            <Route exact path={DASHBOARD_PATH} component={DashboardPage}/>
        </Switch>
    </Navigation>
);

Routes.propTypes = {};

export default Routes;
