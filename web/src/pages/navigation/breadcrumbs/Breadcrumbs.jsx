import React from 'react';
import PropTypes from 'prop-types';
import {Breadcrumb} from "antd";
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import {NavLink} from "react-router-dom";
import './Breadcrumbs.less';
import {ALERTING_ADMIN_PATH, CAMERA_ADMIN_PATH} from "../../../configuration/paths";

const routes = [
  { path: CAMERA_ADMIN_PATH, breadcrumb: 'Camera Settings' },
  { path: ALERTING_ADMIN_PATH, breadcrumb: 'Alerting Settings' },
];

const Breadcrumbs = ({breadcrumbs}) => (
    <Breadcrumb style={{margin: '16px 0'}}>
        {
            breadcrumbs.map((breadcrumb) => (
                <Breadcrumb.Item key={breadcrumb.key}>
                    <NavLink exact to={breadcrumb.match.url}>{breadcrumb.breadcrumb}</NavLink>
                </Breadcrumb.Item>
            ))
        }
    </Breadcrumb>
);

Breadcrumbs.propTypes = {
    breadcrumbs: PropTypes.array.isRequired,
};

export default withBreadcrumbs(routes)(Breadcrumbs);
