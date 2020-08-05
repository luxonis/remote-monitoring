import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Checkbox, Col, Input, Modal, Row, Select} from "antd";
import {modalSelector} from "../../../redux/selectors/page";
import {makeAction} from "../../../redux/actions/makeAction";
import {ALERTING_GROUP_SAVE_CONFIG, CLOSE_MODAL, UPDATE_MODAL_DATA} from "../../../redux/actions/actionTypes";
import AlertingModalRecipients from "./AlertingModalRecipients";
import {camerasSelector} from "../../../redux/selectors/config";
import CheckboxCameraZones from "./CheckboxCameraZones";

const ConfigureAlertingGroupModal = ({cameras, modal: {id, data = {}, isNew}, closeModal, updateModalData, saveConfig}) => {
  const isValid = !!data.name && (data.zones || []).length > 0;

  return (
    <Modal
      visible={id === 'configure-alerting-group-modal'}
      wrapClassName="configure-alerting-group-modal"
      onCancel={() => closeModal()}
      title={`${isNew ? 'Add' : 'Configure'} alerting group`}
      width={800}
      onOk={() => saveConfig({data, isNew})}
      okButtonProps={{disabled: !isValid}}
    >
      <Input value={data.name} addonBefore="Name" onChange={event => updateModalData({...data, name: event.target.value})}/>
      <Select placeholder="Alerting Type" style={{width: 400}} value={data.alert_type} onChange={alerting_mode => updateModalData({...data, alert_type: alerting_mode})}>
        <Select.Option value="every">Every incident</Select.Option>
        <Select.Option value="daily">Daily summary</Select.Option>
      </Select>
      <Row gutter={20}>
        <Col span={12}>
          <AlertingModalRecipients
            label="Email Configuration"
            config={data.email_config || {}}
            onChange={newConfig => updateModalData({...data, email_config: newConfig})}
          />
          <AlertingModalRecipients
            label="SMS Configuration"
            config={data.sms_config || {}}
            onChange={newConfig => updateModalData({...data, sms_config: newConfig})}
          />
          <AlertingModalRecipients
            label="Webhook Configuration"
            config={data.webhook_config || {}}
            onChange={newConfig => updateModalData({...data, webhook_config: newConfig})}
          />
        </Col>
        <Col span={12}>
          <h3>Choose zones</h3>
          {
            cameras.map((camera, key) => <CheckboxCameraZones key={key} camera={camera} data={data} onChange={updateModalData}/>)
          }
        </Col>
      </Row>
    </Modal>
  );
}

ConfigureAlertingGroupModal.propTypes = {
  cameras: PropTypes.array.isRequired,
  modal: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
  updateModalData: PropTypes.func.isRequired,
  saveConfig: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  modal: modalSelector(state),
  cameras: camerasSelector(state),
});

const mapDispatchToProps = {
  closeModal: makeAction(CLOSE_MODAL),
  updateModalData: makeAction(UPDATE_MODAL_DATA),
  saveConfig: makeAction(ALERTING_GROUP_SAVE_CONFIG)
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(ConfigureAlertingGroupModal));
