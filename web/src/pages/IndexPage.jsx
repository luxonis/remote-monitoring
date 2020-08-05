import React from 'react';
// import {connect} from 'react-redux';
import {Card, Col, Icon, Row} from "antd";
import CameraConfigImg from "./index/camera-config.png";
import DashboardImg from "./index/dashboard-map.jpg";
import AlertingConfigImg from "./index/alerting-config.jpg";
import {withRouter} from "react-router";
import {ALERTING_ADMIN_PATH, CAMERA_ADMIN_PATH, DASHBOARD_PATH} from "../configuration/paths";

class IndexPage extends React.PureComponent {
  render() {
    return (
      <Row gutter={20}>
        <Col span={8}>
          <Card
            id="dashboardCard"
            hoverable
            cover={
              <img alt="dashboardImg" src={DashboardImg}/>
            }
            onClick={() => this.props.history.push(DASHBOARD_PATH)}
          >
            <Card.Meta
              avatar={<Icon type="dashboard"/>}
              title="Dashboard"
              description="Display all configured cameras"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            id="cameraSettingsCard"
            hoverable
            cover={
              <img alt="cameraConfigImg" src={CameraConfigImg}/>
            }
            onClick={() => this.props.history.push(CAMERA_ADMIN_PATH)}
          >
            <Card.Meta
              avatar={<Icon type="eye"/>}
              title="Camera Settings"
              description="Setup remote site cameras"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            id="alertingSettingsCard"
            hoverable
            cover={
              <img alt="alertingConfigImg" src={AlertingConfigImg}/>
            }
            onClick={() => this.props.history.push(ALERTING_ADMIN_PATH)}
          >
            <Card.Meta
              avatar={<Icon type="notification"/>}
              title="Alerting Settings"
              description="Configure notifications for cameras"
            />
          </Card>
        </Col>
      </Row>
    );
  }
}

IndexPage.propTypes = {};

// const mapStateToProps = () => ({});
//
// const mapDispatchToProps = {};

// export default connect(
//     mapStateToProps,
//     mapDispatchToProps
// )(IndexPage);
export default withRouter(IndexPage)