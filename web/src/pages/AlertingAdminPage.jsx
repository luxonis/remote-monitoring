import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {makeAction} from "../redux/actions/makeAction";
import {
  ADD_ALERTING_GROUP,
  ALERTING_GROUPS_FETCH,
  CAMERAS_FETCH,
  CONFIGURE_ALERTING_GROUP,
  DELETE_ALERTING_GROUP
} from "../redux/actions/actionTypes";
import {alertingGroups} from "../redux/selectors/alerting";
import {Button, Card, Divider, Icon, Table} from "antd";

class AlertingAdminPage extends React.PureComponent {
  componentDidMount() {
    this.props.fetchAlertingGroups();
    this.props.fetchCameras();
  }

  render() {
    const columns = [
      {
        title: 'Group ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Zones',
        dataIndex: 'zones',
        key: 'zones',
        render: (text, record) => (
          <span>{text.length}</span>
        )
      },
      {
        title: 'SMS',
        dataIndex: 'sms_config',
        key: 'sms_config',
        render: (text = {}, record) => (
          <span>
            {
              text.enabled
                ? <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a"/>
                : <Icon type="close-circle" theme="twoTone" twoToneColor="#eb2f96"/>
            }
          </span>
        )
      },
      {
        title: 'Email',
        dataIndex: 'email_config',
        key: 'email_config',
        render: (text = {}, record) => (
          <span>
            {
              text.enabled
                ? <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a"/>
                : <Icon type="close-circle" theme="twoTone" twoToneColor="#eb2f96"/>
            }
          </span>
        )
      },
      {
        title: 'Webhook',
        dataIndex: 'webhook_config',
        key: 'webhook_config',
        render: (text = {}, record) => (
          <span>
            {
              text.enabled
                ? <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a"/>
                : <Icon type="close-circle" theme="twoTone" twoToneColor="#eb2f96"/>
            }
          </span>
        )
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <span>
            <Button onClick={() => this.props.configureAlertingGroup(record)}>Configure</Button>
            <Divider type="vertical"/>
            <Button onClick={() => this.props.deleteAlertingGroup(record)}>Delete</Button>
          </span>
        ),
      },
    ];

    return (
      <div>
        <Card>
          <Card.Meta title="Alerting groups"/>
          <Button type="primary" onClick={() => this.props.addAlertingGroup()}>Add Group</Button>
          <Table rowKey="id" dataSource={this.props.groups} columns={columns}/>
        </Card>
      </div>
    );
  }
}

AlertingAdminPage.propTypes = {
  groups: PropTypes.array.isRequired,
  fetchAlertingGroups: PropTypes.func.isRequired,
  deleteAlertingGroup: PropTypes.func.isRequired,
  configureAlertingGroup: PropTypes.func.isRequired,
  addAlertingGroup: PropTypes.func.isRequired,
  fetchCameras: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  groups: alertingGroups(state),
});

const mapDispatchToProps = {
  fetchAlertingGroups: makeAction(ALERTING_GROUPS_FETCH),
  deleteAlertingGroup: makeAction(DELETE_ALERTING_GROUP),
  configureAlertingGroup: makeAction(CONFIGURE_ALERTING_GROUP),
  addAlertingGroup: makeAction(ADD_ALERTING_GROUP),
  fetchCameras: makeAction(CAMERAS_FETCH),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertingAdminPage);
