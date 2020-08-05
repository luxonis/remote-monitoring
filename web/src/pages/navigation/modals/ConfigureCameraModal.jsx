import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {Collapse, Input, Modal, Radio, Select, Tabs} from "antd";
import {modalSelector} from "../../../redux/selectors/page";
import {makeAction} from "../../../redux/actions/makeAction";
import {CLOSE_MODAL, CONFIGURE_MODAL_SAVE_CONFIG, UPDATE_MODAL_DATA} from "../../../redux/actions/actionTypes";
import SelectableImage from "./SelectableImage";
import Map from "../../components/Map";


const ConfigureCameraModal = ({modal: {id, data, isNew}, closeModal, updateModalData, saveConfig}) => {
  const [width, setWidth] = React.useState(700);
  const [authorized, setAuthorized] = React.useState(false);
  const [activePane, setActivePane] = React.useState('area');
  if (id !== 'configure-camera') {
    if(authorized) {
      setAuthorized(false);
    }
    return null;
  } else {
    if(!authorized && !!data && !data.dashboard_pass) {
      setAuthorized(true);
    }
  }

  const hasPosition = data.longitude && data.latitude;
  const hasZones = data.zones && data.zones[0] && data.zones[0].polygon && data.zones[0].polygon.length > 2;
  const isValid = hasPosition && hasZones;

  if(!authorized) {
    return (
      <Modal
        title="Type password"
        visible
        width={400}
        okButtonProps={{hidden: true}}
        onCancel={() => {
          closeModal();
        }}
      >
        <h3>Provide a password</h3>
        <input onChange={e => {
          if(e.target.value === data.dashboard_pass) {
            setAuthorized(true)
          }
        }}/>
      </Modal>
    )
  }
  return (
    <Modal
      title={`Configure "${data.camera_id}" camera`}
      visible
      width={width}
      onOk={() => saveConfig({data, isNew})}
      onCancel={() => closeModal()}
      okButtonProps={{disabled: !isValid}}
    >
      <Collapse activeKey={activePane} onChange={setActivePane} accordion>
        <Collapse.Panel header="Area configuration" key="area">
          <Input addonBefore="Dashboard pass" value={data.dashboard_pass} onChange={e => updateModalData({...data, dashboard_pass: e.target.value})} style={{width: 400}}/>
          <div>
            <span>Video storage:</span>
            <Select placeholder="Video storage" style={{width: 600}} value={data.video_storage} onChange={video_storage => updateModalData({...data, video_storage})}>
              <Select.Option value="cloud">Cloud</Select.Option>
              <Select.Option value="local">Local</Select.Option>
              <Select.Option value="full">Full</Select.Option>
            </Select>
          </div>
          <div>
            <span>Disk full action:</span>
            <Select placeholder="Video storage" style={{width: 600}} value={data.disk_full_action} onChange={disk_full_action => updateModalData({...data, disk_full_action})}>
              <Select.Option value="cloud">Store videos in cloud</Select.Option>
              <Select.Option value="rolling">Remove oldest videos</Select.Option>
              <Select.Option value="no_video">Stop recording videos (report incidents without video)</Select.Option>
            </Select>
          </div>
          <p>Please select desired detection area</p>
          <SelectableImage
            zones={data.zones}
            src={data.frame_url}
            onLoad={img => setWidth(img.width + 80)}
            onChange={zones => updateModalData({...data, zones})}
          />
        </Collapse.Panel>
        <Collapse.Panel key="map" header={'Camera position'}>
          <Map
            id="configure-camera-map"
            onMapClick={event => updateModalData({...data, latitude: event.latlng.lat, longitude: event.latlng.lng})}
            points={hasPosition ? [{...data, color: 'green'}] : []}
          />
        </Collapse.Panel>
      </Collapse>
    </Modal>
  );
};

ConfigureCameraModal.propTypes = {
  modal: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
  saveConfig: PropTypes.func.isRequired,
  updateModalData: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  modal: modalSelector(state)
});

const mapDispatchToProps = {
  saveConfig: makeAction(CONFIGURE_MODAL_SAVE_CONFIG),
  updateModalData: makeAction(UPDATE_MODAL_DATA),
  closeModal: makeAction(CLOSE_MODAL)
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(ConfigureCameraModal));
