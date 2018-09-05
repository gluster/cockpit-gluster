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
import { notEmpty } from '../../lib/validators'
import Dropdown from '../common/Dropdown'
import yaml from 'js-yaml';
const INVENTORY = `/etc/ansible/hc_wizard_inventory.yml`;

class ReviewStep extends Component {
  constructor(props){
    super(props)
    this.state = {
      isEditing: false,
      inventory: this.generateInventory(this.props.glusterModel),
    }
    this.writeFile(this.state.inventory, INVENTORY);
  }




  handleEmpty = (po) => {
    return JSON.stringify(po) == '{}' ? "" : po;
  }
  uniqueStringsArray = (arr) => {
      var u = {}, a = [];
      for(var i = 0, l = arr.length; i < l; ++i){
          if(!u.hasOwnProperty(arr[i])) {
              a.push(arr[i]);
              u[arr[i]] = 1;
          }
      }
      return a;
  }
  generateInventory = (glusterModel) =>{
    let groups = {};
    let { hosts, volumes, bricks, raidConfig, cacheConfig } = glusterModel;
    groups.hc_nodes = {};
    groups.hc_nodes.hosts = {};
    groups.local = { hosts: {localhost: null}};
    let groupVars = {}
    let localVars = {}
    groupVars.gluster_infra_stripe_unit_size = raidConfig.stripe_size;
    groupVars.gluster_infra_disktype = raidConfig.raid_type;
    groupVars.gluster_infra_diskcount = raidConfig.disk_count;


    for (let hostIndex = 0; hostIndex < hosts.length;hostIndex++){
      let hostVars = {}
      let hostBricks = bricks[hostIndex]
      let hostPVs = []
      for (let brick of hostBricks){
        let brickPV = brick.device;
        console.debug("RS.generateInventory.brick vdo vdoSize", brick.vdo,brick.vdoSize)
        if(brick.vdo == true && brick.vdoSize){
          let deviceName = brick.device.split("/").pop();
          let vdoName = `vdo_${deviceName}`
          brickPV = `/dev/${vdoName}`;
          if(hostVars.gluster_infra_vdo == undefined){
            hostVars.gluster_infra_vdo = [];
            hostVars.gluster_infra_vdo_blockmapcachesize = "128M";
            hostVars.gluster_infra_vdo_slabsize = (brick.vdoSize <= 1000) ? "2G": "32G";
            hostVars.gluster_infra_vdo_readcachesize = "20M";
            hostVars.gluster_infra_vdo_readcache = "enabled";
            hostVars.gluster_infra_vdo_writepolicy = "auto";
            hostVars.gluster_infra_vdo_emulate512 = "on";
          }
          if(hostPVs.indexOf(brickPV) == -1){
            hostVars.gluster_infra_vdo.push({
              name: vdoName,
              device: brick.device,
              logicalsize: `${brick.vdoSize}G`
            });
          }
        }
        hostPVs.push(brickPV);
      }
      hostVars.gluster_infra_pvs = this.uniqueStringsArray(hostPVs);
      //HACK while looking for relevant gluster-ansible funcitonality
      hostVars.gluster_infra_lv_logicalvols = hostBricks
        .slice(1,hostBricks.length)
        .map((brick)=>{
          return {
            lvname: `gluster_lv_${brick.volName}`,
            lvsize: `${brick.size}G`
          };
        });
        hostVars.gluster_infra_mount_devices = hostBricks.map((brick)=>{
        return {
          path: brick.mountPoint,
          lv: `gluster_lv_${brick.volName}`
        }
      });
      hostVars.gluster_infra_thick_lvs = hostBricks
      .slice(0,1)
      .map((brick)=>{
        return {
          name: `gluster_lv_${brick.volName}`,
          size: `${brick.size}G`
        };
      });
      groups.hc_nodes.hosts[hosts[hostIndex]] = hostVars;
    }

    localVars.gluster_features_hci_volumes = [];
    for(let volumeIndex = 0; volumeIndex < volumes.length;volumeIndex++){
      let volume = volumes[volumeIndex];
      localVars.gluster_features_hci_volumes.push({
        volname: volume.name,
        brick: volume.brickDir,
        arbiter: volume.isArbiter,
        master: "localhost"
      });
    }
    groups.hc_nodes.vars = groupVars;
    groups.local.vars = localVars;

    return yaml.safeDump(groups)

  }
  handleEdit = (event) => {
    this.setState({isEditing:true});
  }
  handleReload = () => {
    this.readInventory(INVENTORY).then((content,tag)=>{
      this.setState({inventory:content})
    })
  }

  readInventory = (path) => {
    let file = cockpit.file(path)
    return file.read().done((content,tag)=>{
      if(content== null){
        console.warn(`File: ${path} does not exist`)
      }
    }).fail((error)=>{

      console.warn(`File: ${path} not written`,error)
    }).always((tag) => {
      file.close()
    });
  }



  writeFile = (inventory, path) =>{
    let file = cockpit.file(path)
    return file.replace(inventory).done((content,tag)=>{
      if(content== null){
        console.warn(`File: ${path} does not exist`)
      }
    }).fail((error)=>{

      console.warn(`File: ${path} not written`,error)
    }).always((tag) => {
      file.close()
    });
  }
  handleSave = () => {
    this.setState((prevState)=>{
      this.writeFile(prevState.inventory, INVENTORY);
      return {isEditing:false}
    });
  }

  handleTextChange = (event) => {
    this.setState({inventory: event.target.value});
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
            Generated ansible inventory : {this.props.configFilePath}
        </span>
        {this.props.isDeploymentStarted && <span>[Running Play]</span>}
        <div className="pull-right">
          {this.state.isEditing && !this.props.isDeploymentStarted &&
            <button className="btn btn-default"
              onClick={()=>this.handleSave()}>
              <span className="pficon pficon-save">&nbsp;</span>
              Save
            </button>
          }
          {!this.state.isEditing && !this.props.isDeploymentStarted &&
            <button className="btn btn-default"
                onClick={this.handleEdit}>
                <span className="pficon pficon-edit">&nbsp;</span>
                Edit
            </button>
          }
          {!this.props.isDeploymentStarted && <button className="btn btn-default"
              onClick={this.handleReload}>
              <span className="fa fa-refresh">&nbsp;</span>
              Reload
            </button>}
        </div>
    </div>
    {!this.props.isDeploymentStarted && <textarea className="wizard-preview"
        value={this.state.inventory} onChange={this.handleTextChange} readOnly={!this.state.isEditing}>
    </textarea>}
    {this.props.isDeploymentStarted && <textarea className="wizard-preview"
        value={this.props.deploymentStream}  readOnly={true}>
    </textarea>}
</div>

          </Col>
        </Row>
      </Grid>
    );
  }
}




export default ReviewStep
