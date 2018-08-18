import React, { Component } from 'react'
import {Grid,Row,Col, Form, FormGroup, FormControl, ControlLabel, HelpBlock, Checkbox} from 'patternfly-react'
import { notEmpty } from '../common/validators'
import Dropdown from '../common/Dropdown'


class ReviewStep extends Component {
  constructor(props){
    super(props)
  }

  render(){
    return (
      <Grid fluid>
        <Row>
          <Col>{'{ "hosts":'}{JSON.stringify(this.props.glusterModel.hosts)},</Col>
        </Row>
        <Row>
          <Col>"volumes": {JSON.stringify(this.props.glusterModel.volumes)},</Col>
        </Row>
        <Row>
          <Col>"bricks": {JSON.stringify(this.props.glusterModel.bricks)}{"}"}</Col>
        </Row>
        <hr/>
        <Row>
          <Col>{JSON.stringify(this.props.glusterModel)}</Col>
        </Row>
      </Grid>
    );
  }
}




export default ReviewStep
