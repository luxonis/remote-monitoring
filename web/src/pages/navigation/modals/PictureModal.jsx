import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Modal} from "antd";
import {modalSelector} from "../../../redux/selectors/page";
import {makeAction} from "../../../redux/actions/makeAction";
import {CLOSE_MODAL} from "../../../redux/actions/actionTypes";

const PictureModal = ({modal: {id, data}, closeModal}) => (
  <Modal
    title={null}
    visible={id === 'picture-modal'}
    footer={null}
    closable={false}
    wrapClassName="picture-modal"
    centered
    onCancel={() => closeModal()}
  >
    <img src={data}/>
  </Modal>
);

PictureModal.propTypes = {
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
)(React.memo(PictureModal));
