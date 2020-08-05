import React from "react";
import {Layout} from 'antd';
import Header from "./header/Header";
import Sidebar from "./sidebar/Sidebar";
import Breadcrumbs from "./breadcrumbs/Breadcrumbs";
import ConfigureCameraModal from "./modals/ConfigureCameraModal";
import VideoModal from "./modals/VideoModal";
import ConfigureAlertingGroupModal from "./modals/ConfigureAlertingGroupModal";
import PictureModal from "./modals/PictureModal";

export default ({children}) => (
  <Layout>
    <Header/>
    <Layout>
      <Sidebar/>
      <Layout style={{padding: '0 24px 24px'}}>
        <Breadcrumbs/>
        {children}
      </Layout>
      <ConfigureCameraModal/>
      <VideoModal/>
      <PictureModal/>
      <ConfigureAlertingGroupModal/>
    </Layout>
  </Layout>
);