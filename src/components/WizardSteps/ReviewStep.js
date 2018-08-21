import React, { Component } from 'react'
import {
  Grid,
  Row,
  Col,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock,
  Checkbox
  } from 'patternfly-react'
import { notEmpty } from '../common/validators'
import Dropdown from '../common/Dropdown'
import yaml from 'js-yaml';

class ReviewStep extends Component {
  constructor(props){
    super(props)
    this.state = {
      isEditing: false,
      inventory: ""
    }
  }

  nullIfEmpty = (po) => {
    return JSON.stringify(po) == '{}' ? null : po;
  }
  generateInventory = (glusterModel) =>{
    let groups = {};
    let { hosts, volumes, bricks, raidConfig, cacheConfig } = glusterModel;
    groups.hc_nodes.hosts = {};
    let groupVars ={}
    for (let hostIndex = 0; hostIndex < hosts.length;hostIndex++){
      let hostVars = {}

        groups.hc_nodes[hosts[hostIndex]] = nullIfEmpty(hostVars)
    }
    groups.hc_nodes.vars = nullIfEmpty(groupVars);

    return yaml.safeDump

  }
  handleEdit = (event) => {
    this.setState({isEditing:true});
  }
  handleSave = (event) => {
    this.setState({isEditing:false});
  }
  handleTextChange = (event) => {
    this.setState({inventory: event.target.value})
  }
  render(){
    return (
      <Grid fluid>
        <Row>
          <Col sm={12}>
            <div className="panel panel-default">
    <div className="panel-heading">
        <span className="pficon-settings"></span>
        <span>
            Generated Gdeploy configuration : {this.props.configFilePath}
        </span>
        <div className="pull-right">
          {this.state.isEditing &&
            <button className="btn btn-default"
              onClick={this.handleSave}>
              <span className="pficon pficon-save">&nbsp;</span>
              Save
            </button>
          }
          {!this.state.isEditing &&
            <button className="btn btn-default"
                onClick={this.handleEdit}>
                <span className="pficon pficon-edit">&nbsp;</span>
                Edit
            </button>
          }
            <button className="btn btn-default"
              onClick={this.handleReload}>
              <span className="fa fa-refresh">&nbsp;</span>
              Reload
            </button>
        </div>
    </div>
    <textarea className="wizard-preview"
        value={JSON.stringify(this.props.glusterModel)} onChange={this.handleTextChange} readOnly={!this.state.isEditing}>
    </textarea>
</div>

          </Col>
        </Row>
      </Grid>
    );
  }
}




export default ReviewStep
