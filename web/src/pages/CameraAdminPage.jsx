import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {makeAction} from "../redux/actions/makeAction";
import {
  ALERTING_GROUPS_FETCH,
  CAMERAS_FETCH,
  CONFIGURE_CAMERA, CONFIGURE_PENDING_CAMERA, DELETE_CAMERA,
  DELETE_PENDING_CAMERA,
  PENDING_CAMERAS_FETCH
} from "../redux/actions/actionTypes";
import {camerasSelector, pendingSelector} from "../redux/selectors/config";
import {Button, Card, Divider, Table} from "antd";
import moment from "moment";

class CameraAdminPage extends React.PureComponent {
  componentDidMount() {
    this.props.fetchPendingCameras();
    this.props.fetchCameras();
    this.props.fetchAlertingGroups();
  }

  render() {
    const cameraColumns = [
      {
        title: 'Camera ID',
        dataIndex: 'camera_id',
        key: 'camera_id',
      },
      {
        title: 'Last modified',
        dataIndex: 'modified_at',
        key: 'modified_at',
        render: (text, record) => (
          <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>
        )
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <span>
            <Button onClick={() => this.props.configureCamera(record)}>Configure</Button>
            <Divider type="vertical"/>
            <Button onClick={() => this.props.deleteCamera(record)}>Delete</Button>
          </span>
        ),
      },
    ];
    const pendingColumns = [
      {
        title: 'Camera ID',
        dataIndex: 'camera_id',
        key: 'camera_id',
      },
      {
        title: 'Reported',
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (text, record) => (
          <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>
        )
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <span>
            <Button onClick={() => this.props.configurePendingCamera(record)}>Configure</Button>
            <Divider type="vertical"/>
            <Button onClick={() => this.props.deletePendingCamera(record)}>Delete</Button>
          </span>
        ),
      },
    ];

    return (
      <div>
        <Card>
          <Card.Meta title="Configured cameras"/>
          <Table rowKey="camera_id" dataSource={this.props.cameras} columns={cameraColumns}/>
        </Card>
        <Card>
          <Card.Meta title="Cameras pending configuration"/>
          <Table rowKey="camera_id" dataSource={this.props.pending} columns={pendingColumns}/>
        </Card>
      </div>
    );
  }
}

CameraAdminPage.propTypes = {
  fetchPendingCameras: PropTypes.func.isRequired,
  fetchCameras: PropTypes.func.isRequired,
  configureCamera: PropTypes.func.isRequired,
  configurePendingCamera: PropTypes.func.isRequired,
  deletePendingCamera: PropTypes.func.isRequired,
  deleteCamera: PropTypes.func.isRequired,
  fetchAlertingGroups: PropTypes.func.isRequired,
  pending: PropTypes.array.isRequired,
  cameras: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  pending: pendingSelector(state),
  cameras: camerasSelector(state),
});

const mapDispatchToProps = {
  fetchAlertingGroups: makeAction(ALERTING_GROUPS_FETCH),
  fetchPendingCameras: makeAction(PENDING_CAMERAS_FETCH),
  fetchCameras: makeAction(CAMERAS_FETCH),
  configureCamera: makeAction(CONFIGURE_CAMERA),
  configurePendingCamera: makeAction(CONFIGURE_PENDING_CAMERA),
  deletePendingCamera: makeAction(DELETE_PENDING_CAMERA),
  deleteCamera: makeAction(DELETE_CAMERA),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CameraAdminPage);
