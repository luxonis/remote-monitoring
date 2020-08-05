import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox} from "antd";
import _ from 'lodash';

const CheckboxCameraZones = ({camera, data, onChange}) => {
  const currentZones = camera.zones.map(zone => zone.id);
  const selectedZones = camera.zones.filter(zone => _.includes(data.zones, zone.id));
  const otherZones = (data.zones || []).filter(zone => !_.includes(currentZones, zone));
  const groupChecked = selectedZones.length === currentZones.length;

  return (
    <>
      <div>
        <Checkbox
          checked={groupChecked}
          indeterminate={selectedZones.length > 0 && currentZones.length > selectedZones.length}
          onChange={() => onChange({...data, zones: groupChecked ? otherZones : otherZones.concat(currentZones)})}
        >
          {camera.camera_id}
        </Checkbox>
      </div>
      <div style={{paddingLeft: 30}}>
        <Checkbox.Group
          value={selectedZones.map(zone => zone.id)}
          options={camera.zones.map((zone, key) => ({label: zone.name || `Zone ${key + 1}`, value: zone.id}))}
          onChange={zones => onChange({...data, zones: otherZones.concat(zones)})}
        />
      </div>
    </>
  );
};

CheckboxCameraZones.propTypes = {
  camera: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(CheckboxCameraZones);
