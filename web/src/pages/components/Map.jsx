import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from "d3";
import L from "leaflet";

class Map extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handlePointClick = this.handlePointClick.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);
  }

  handlePointClick(...props) {
    this.props.onPointClick(...props);
    d3.event.stopPropagation();
  }

  handleMapClick(...props) {
    this.props.onMapClick(...props);
  }

  updatePoints() {
    d3.select("#" + this.props.id)
      .select("svg")
      .selectAll("circle")
      .remove();
    d3.select("#" + this.props.id)
      .select("svg")
      .selectAll("circle")
      .data(this.props.points)
      .enter()
      .append("circle")
      .attr("cx", d => this.map.latLngToLayerPoint([d.latitude, d.longitude]).x)
      .attr("cy", d => this.map.latLngToLayerPoint([d.latitude, d.longitude]).y)
      .attr("r", 14)
      .style("fill", d => d.color)
      .attr("stroke", d => d.color)
      .attr("stroke-width", 3)
      .attr("fill-opacity", .4)
      .on("click", this.handlePointClick)
      .on('mouseover', d => {
        if(this.props.popover) {
          L.popup({closeButton: false, className: "map-popup"})
           .setLatLng([d.latitude, d.longitude])
           .setContent(this.props.popover(d))
           .openOn(this.map);
        }
      });
  }

  componentDidMount() {
    this.map = L.map(this.props.id)
      .setView(this.props.position, this.props.zoom)
      .on("click", this.handleMapClick);
    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 10,
      }).addTo(this.map);
    L.svg().addTo(this.map);

    this.updatePoints();

    let update = function() {
      d3.selectAll("circle")
        .attr("cx", d => this.map.latLngToLayerPoint([d.latitude, d.longitude]).x)
        .attr("cy", d => this.map.latLngToLayerPoint([d.latitude, d.longitude]).y)
    };

    update = update.bind(this);

    this.map.on("moveend", update)

  }

  componentDidUpdate() {
    this.updatePoints()
  }

  render() {
    return (
      <div id={this.props.id}/>
    );
  }
}

Map.defaultProps = {
  points: [],
  zoom: 6,
  position: [38.847263, -104.862051],
  onPointClick: () => {},
  onMapClick: () => {},
};

Map.propTypes = {
  id: PropTypes.string.isRequired,
  points: PropTypes.array,
  zoom: PropTypes.number,
  position: PropTypes.arrayOf(PropTypes.number),
  onPointClick: PropTypes.func,
  onMapClick: PropTypes.func,
  popover: PropTypes.func,
};

export default Map;
