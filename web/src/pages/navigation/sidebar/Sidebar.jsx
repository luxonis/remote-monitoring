import React from 'react';
import PropTypes from 'prop-types';
import {Icon, Layout, Menu} from "antd";
import {NavLink} from 'react-router-dom'
import {INDEX_PATH, CAMERA_ADMIN_PATH, DASHBOARD_PATH, ALERTING_ADMIN_PATH} from "../../../configuration/paths";
import {connect} from "react-redux";
import {currentLocation} from "../../../redux/selectors/router";

const resolveOpenedSubmenus = path => {
    switch(path) {
        case ALERTING_ADMIN_PATH:
        case CAMERA_ADMIN_PATH:
            return ['settings'];
        default:
            return [];
    }
};

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openKeys: resolveOpenedSubmenus(props.location)
        }
    }

    componentDidUpdate(prevProps) {
        if(this.props.location !== prevProps.location) {
            this.setState({
                openKeys: resolveOpenedSubmenus(this.props.location),
            })
        }
    }
    render() {
        return (
            <Layout.Sider width={300} style={{background: '#fff', minHeight: 'calc(100vh - 100px)'}}>
                <Menu
                    mode="inline"
                    style={{height: '100%', borderRight: 0}}
                    selectedKeys={[this.props.location]}
                    openKeys={this.state.openKeys}
                >
                    <Menu.Item key={INDEX_PATH}>
                        <NavLink exact to={INDEX_PATH}>
                            <Icon type="home"/>
                            Home
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item key={DASHBOARD_PATH}>
                        <NavLink exact to={DASHBOARD_PATH}>
                            <Icon type="dashboard"/>
                            Dashboard
                        </NavLink>
                    </Menu.Item>
                    <Menu.SubMenu
                        key="settings"
                        title={<span><Icon type="tool" />Settings</span>}
                        onTitleClick={() => this.setState({
                            openKeys: this.state.openKeys.includes("settings")
                                ? this.state.openKeys.filter(item => item !== "settings")
                                : this.state.openKeys.concat("settings")
                        })}
                    >
                        <Menu.Item key={CAMERA_ADMIN_PATH}>
                            <NavLink exact to={CAMERA_ADMIN_PATH}>
                                <Icon type="video-camera"/>
                                Camera Settings
                            </NavLink>
                        </Menu.Item>
                        <Menu.Item key={ALERTING_ADMIN_PATH}>
                            <NavLink exact to={ALERTING_ADMIN_PATH}>
                                <Icon type="notification"/>
                                Alerting Settings
                            </NavLink>
                        </Menu.Item>
                    </Menu.SubMenu>
                </Menu>
            </Layout.Sider>
        );
    }
}


Sidebar.propTypes = {
    location: PropTypes.string.isRequired,
};

export default connect(
    state => ({
        location: currentLocation(state)
    })
)(Sidebar);
