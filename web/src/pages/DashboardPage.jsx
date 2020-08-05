import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import * as d3 from 'd3';
import {incidentsSelector} from "../redux/selectors/dashboard";
import {Button, Col, Drawer, Pagination, Row, Statistic} from 'antd';
import {Timeline, TimelineItem} from 'vertical-timeline-component-for-react';
import Map from "./components/Map";
import {makeAction} from "../redux/actions/makeAction";
import {
  CAMERAS_FETCH,
  DISPLAY_PICTURE,
  DISPLAY_VIDEO,
  INCIDENTS_CHANGE_ACTIVE_ITEM, INCIDENTS_CHANGE_PAGE, INCIDENTS_CHANGE_PAGE_SIZE,
  INCIDENTS_FETCH
} from "../redux/actions/actionTypes";
import {camerasSelector} from "../redux/selectors/config";
import moment from "moment";
import _ from 'lodash';
import {getTimeDiffAndPrettyText} from "../services/dates";

class DashboardPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: null
    };
    this.handlePointClick = this.handlePointClick.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);
    this.handleDrawerClose = this.handleDrawerClose.bind(this)
    this.popover = this.popover.bind(this)
    this.authorize = this.authorize.bind(this)
    this.refreshIncidents = this.refreshIncidents.bind(this)
  }

  authorize(pass) {
    if (!!this.props.incidents.activeItem && this.props.incidents.activeItem.dashboard_pass === pass) {
      this.setState({authorized: true});
      this.props.fetchIncidents();
    }
  }

  handlePointClick(d) {
    if (!d.dashboard_pass) {
      this.props.changeActiveItem(d);
      this.setState({authorized: true});
      this.props.fetchIncidents();
    } else {
      this.props.changeActiveItem(d);
      this.setState({authorized: false});
    }
    d3.event.stopPropagation();
  }

  refreshIncidents() {
    if (this.props.incidents.activeItem) {
      this.props.fetchIncidents();
    }
  }

  popover(d) {
    return `<p>${d.camera_id}</p>`;
  }

  handleMapClick() {
    this.props.changeActiveItem(null);
  }

  handleDrawerClose() {
    this.props.changeActiveItem(null);
  }

  componentDidMount() {
    this.props.fetchCameras();
  }

  render() {
    return (
      <div>
        <Map
          id="dashboardMap"
          onPointClick={this.handlePointClick}
          onMapClick={this.handleMapClick}
          points={this.props.cameras}
          popover={this.popover}
        />
        <Drawer
          title="Camera details"
          placement="right"
          closable
          onClose={this.handleDrawerClose}
          visible={!!this.props.incidents.activeItem}
          width={600}
        >
          {
            !!this.props.incidents.activeItem && !this.state.authorized && <>
              <h3>Password needed!</h3>
              <input onChange={e => this.authorize(e.target.value)} placeholder="password"/>
            </>
          }
          {
            !!this.props.incidents.activeItem && this.state.authorized &&
            <>
              <div className="description">
                <img width="100%" height="20%"
                     src={this.props.incidents.activeItem.frame_url}
                     alt="station"/>
                <h2>{this.props.incidents.activeItem.camera_id}</h2>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic title="Incidents" value={this.props.incidents.count}/>
                  </Col>
                  <Col span={8}>
                    <Statistic title="Latitude" value={this.props.incidents.activeItem.latitude} precision={7}/>
                  </Col>
                  <Col span={8}>
                    <Statistic title="Longitude" value={this.props.incidents.activeItem.longitude} precision={7}/>
                  </Col>
                </Row>
                <Button onClick={this.refreshIncidents}>Refresh</Button>
              </div>
              <div className="incidents">
                <Pagination
                  current={this.props.incidents.page}
                  pageSize={this.props.incidents.pageSize}
                  showSizeChanger
                  onChange={page => this.props.changePage(page)}
                  pageSizeOptions={["10", "25", "50", "100"]}
                  onShowSizeChange={(current, size) => this.props.changePageSize(+size)}
                  total={this.props.incidents.count}
                />
                <Timeline lineColor={'#ddd'}>
                  {
                    (this.props.incidents.results || []).map(incident => (
                      <TimelineItem
                        key={incident.incident_id}
                        dateText={moment(incident.timestamp).format('DD.MM h:mm')}
                        style={{color: '#96e891'}}
                        dateInnerStyle={{background: '#96e891', color: '#000'}}
                      >
                        <h3>Detection in zone {incident.zone.name}</h3>
                        <h4>A {_.includes(incident.zone.detection_types, 'car') ? 'car' : 'person'} was detected in
                          the marked area</h4>
                        {
                          !!_.get(incident.data, 'positive_frames') &&
                            <h4>Confidence: {(incident.data.positive_frames / (incident.data.negative_frames + incident.data.positive_frames) * (_.min([incident.data.positive_frames, 10]) / 10) * 100).toFixed(0)} % </h4>
                        }
                        {
                          !!_.get(incident.data, 'max_detected') &&
                            <h4>Most {_.includes(incident.zone.detection_types, 'car') ? 'cars' : 'people'} detected: {incident.data.max_detected}</h4>
                        }
                        {
                          !!_.get(incident.data, 'plate_data.plate') &&
                          <h4>Detected license plate: {_.get(incident.data, 'plate_data.plate').toUpperCase()}</h4>
                        }
                        {
                          !!_.get(incident.data, 'last_detection_timestamp') && !!_.get(incident.data, 'start_timestamp') &&
                            <h4>Incident duration: {getTimeDiffAndPrettyText(new Date(incident.data.start_timestamp), new Date(incident.data.last_detection_timestamp)).friendlyNiceText}</h4>
                        }
                        {
                          !!incident.data['preview_url'] &&
                          <Button size="small" type="link"
                                  onClick={() => this.props.displayPicture(incident.data['preview_url'])}>Preview</Button>
                        }
                        {
                          !!incident.data['video_url'] &&
                          <Button size="small" type="link"
                                  onClick={() => this.props.displayVideo(incident.data['video_url'])}>See video</Button>
                        }
                        {
                          !!_.get(incident.data, 'plate_data.frame') &&
                          <Button size="small" type="link"
                                  onClick={() => this.props.displayPicture(_.get(incident.data, 'plate_data.frame'))}>See
                            license plate</Button>
                        }
                      </TimelineItem>
                    ))
                  }
                </Timeline>
              </div>
            </>
          }
        </Drawer>
      </div>
    );
  }
}

DashboardPage.propTypes = {
  cameras: PropTypes.array.isRequired,
  incidents: PropTypes.object.isRequired,
  fetchCameras: PropTypes.func.isRequired,
  fetchIncidents: PropTypes.func.isRequired,
  displayVideo: PropTypes.func.isRequired,
  displayPicture: PropTypes.func.isRequired,
  changeActiveItem: PropTypes.func.isRequired,
  changePage: PropTypes.func.isRequired,
  changePageSize: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  incidents: incidentsSelector(state),
  cameras: camerasSelector(state),
});

const mapDispatchToProps = {
  fetchCameras: makeAction(CAMERAS_FETCH),
  fetchIncidents: makeAction(INCIDENTS_FETCH),
  displayVideo: makeAction(DISPLAY_VIDEO),
  displayPicture: makeAction(DISPLAY_PICTURE),
  changeActiveItem: makeAction(INCIDENTS_CHANGE_ACTIVE_ITEM),
  changePage: makeAction(INCIDENTS_CHANGE_PAGE),
  changePageSize: makeAction(INCIDENTS_CHANGE_PAGE_SIZE),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardPage);
