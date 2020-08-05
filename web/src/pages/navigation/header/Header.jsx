import React from 'react';
import './Header.less';
import {Layout} from "antd";
import logo from "./logo.png";

const Header = () => (
    <Layout.Header className="header" style={{height: 100, padding: 0, display: 'flex', alignItems: 'center'}}>
        <div className="nav__logo">
            <img src={logo} height={100} width={300} alt="brand logo"/>
        </div>
    </Layout.Header>
);

Header.propTypes = {};

export default Header;
