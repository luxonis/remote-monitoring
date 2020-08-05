import React from 'react';
import PropTypes from 'prop-types';
import {Button, Input, List, Select, Tabs} from "antd";
import _ from 'lodash';

class SelectableImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeZone: 0,
    };
    this.canvasRef = React.createRef();
    this.onCanvasClick = this.onCanvasClick.bind(this);
    this.deletePoint = this.deletePoint.bind(this);
    this.onTabsEdit = this.onTabsEdit.bind(this);
    this.onActiveZoneChange = this.onActiveZoneChange.bind(this);
  }

  load() {
    this.img = new Image();
    this.img.src = this.props.src;
    this.img.onload = () => {
      if (this.canvasRef.current) {
        this.canvasRef.current.width = this.img.width;
        this.canvasRef.current.height = this.img.height;
        this.draw();
        this.props.onLoad(this.img);
      }
    };
  }

  getPolygon() {
    return _.get(this.props, `zones[${this.state.activeZone}].polygon`, [])
  }

  draw() {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.drawImage(this.img, 0, 0);
    const polygon = this.getPolygon();
    if (polygon.length > 2) {
      ctx.beginPath();
      ctx.moveTo(polygon[0].x, polygon[0].y);
      polygon.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,0,225,0.4)';
      ctx.fill();
    }
    ctx.font = "bold 30px Courier";
    ctx.fillStyle = "red";
    polygon.forEach((point, key) => ctx.fillText(key + 1, point.x, point.y));
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate() {
    this.draw()
  }

  changeZone(index, changeFn) {
    return this.props.zones.map(
      (zone, key) => key !== index ? zone : {...zone, ...changeFn(zone)}
    )
  }

  onCanvasClick(event) {
    const rect = this.canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.props.onChange(this.changeZone(this.state.activeZone, zone => ({polygon: zone.polygon.concat({x, y})})));
  }

  deletePoint(removeIndex) {
    this.props.onChange(this.changeZone(this.state.activeZone, zone => ({polygon: zone.polygon.filter((_, index) => index !== removeIndex)})));
  }

  onTabsEdit(data, action) {
    if (action === 'remove') {
      this.props.onChange(this.props.zones.filter((_, index) => index !== +data));
    } else if (action === 'add') {
      this.props.onChange(this.props.zones.concat({polygon: []}));
    }
  }

  onActiveZoneChange(zone) {
    this.setState({activeZone: +zone})
  }

  render() {
    return <>
      <canvas
        ref={this.canvasRef}
        onClick={this.onCanvasClick}
      />
      <h3>Areas:</h3>
      <Tabs
        onChange={this.onActiveZoneChange}
        activeKey={this.state.activeZone + ""}
        type="editable-card"
        onEdit={this.onTabsEdit}
      >
        {
          this.props.zones.map((zone, key) => (
            <Tabs.TabPane tab={zone.name || "Zone " + (key + 1)} key={key}>
              <Input addonBefore="Name" value={zone.name} onChange={e => this.props.onChange(this.changeZone(key, () => ({name: e.target.value})))} style={{width: 400}}/>
              <div>
                <span>Detection types: </span>
                <Select placeholder="Detection type" style={{width: 400}} value={zone.detection_types} onChange={detection_type => this.props.onChange(this.changeZone(key, () => ({detection_types: [detection_type]})))}>
                  <Select.Option value="person">Person</Select.Option>
                  <Select.Option value="car">Car</Select.Option>
                </Select>
              </div>
              <div>
                <span>Alerting mode</span>
                <Select placeholder="Alerting mode" style={{width: 400}} value={zone.alerting_mode} onChange={alerting_mode => this.props.onChange(this.changeZone(key, () => ({alerting_mode})))}>
                  <Select.Option value="full">Full</Select.Option>
                  <Select.Option value="none">None</Select.Option>
                  <Select.Option value="boundary">Boundary</Select.Option>
                </Select>
              </div>
              {
                zone.alerting_mode === 'boundary' &&
                  <Input addonBefore="Start/End time in seconds" value={zone.alerting_mode_offset} onChange={e => this.props.onChange(this.changeZone(key, () => ({alerting_mode_offset: e.target.value})))} style={{width: 400}}/>
              }
              <p>Points</p>
              <List
                dataSource={zone.polygon}
                renderItem={(item, index) => (
                  <List.Item
                    actions={[
                      <Button type="danger" key="list-delete" onClick={() => this.deletePoint(index)}>delete</Button>,
                    ]}
                  >
                    Point {index + 1} [x: {item.x}, y: {item.y}]
                  </List.Item>
                )}
              />
            </Tabs.TabPane>
          ))
        }
      </Tabs>
    </>
  }
}

SelectableImage.propTypes = {
  zones: PropTypes.array.isRequired,
  src: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
};

export default React.memo(SelectableImage);
