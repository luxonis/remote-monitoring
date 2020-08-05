import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Modal} from "antd";
import {modalSelector} from "../../../redux/selectors/page";
import {makeAction} from "../../../redux/actions/makeAction";
import {CLOSE_MODAL} from "../../../redux/actions/actionTypes";

const VideoModal = ({modal: {id, data}, closeModal}) => (
  <Modal
    title={null}
    visible={id === 'video-modal'}
    footer={null}
    closable={false}
    wrapClassName="video-modal"
    centered
    onCancel={() => closeModal()}
  >
    <video width="600" height="600" controls key={data}>
      <source src={data} type="video/webm"/>
      Your browser does not support the video tag.
    </video>
  </Modal>
);

VideoModal.propTypes = {
  modal: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  modal: modalSelector(state),
});

const mapDispatchToProps = {
  closeModal: makeAction(CLOSE_MODAL)
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(VideoModal));
