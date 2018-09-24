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
    this.deploymentStreamTextArea = React.createRef();
  }

  componentDidUpdate = (prevProps, prevState) => {
    if(prevProps.deploymentStream !== this.props.deploymentStream){
      if(this.deploymentStreamTextArea.current){
        this.deploymentStreamTextArea.current.scrollTop = this.deploymentStreamTextArea.current.scrollHeight;
      }
      else{
        console.warn("no Ref for deploymentStream!")
      }
    }
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
      let hostVars = {};
      hostVars.gluster_infra_volume_groups = [];
      hostVars.gluster_infra_mount_devices = [];
      let processedDevs = {}; // VG and VDO is processed once per device processedVG implies processedVDO
      let hostBricks = bricks[hostIndex];
      let hostCacheConfig = cacheConfig[hostIndex];

      for (let brick of hostBricks){
        let devName = brick.device.split("/").pop();
        let pvName = brick.device; //changes if vdo
        let vgName = `vg_${devName}`;
        let thinpoolName = `thinpool_${vgName}`;
        let lvName = `gluster_lv_${brick.volName}`;
        let isDevProcessed = Object.keys(processedDevs).indexOf(devName) > -1;
        let isThinpoolCreated = false;
        if(isDevProcessed){
          isThinpoolCreated = processedDevs[devName]['thinpool'];
        }
        let isVDO = brick.vdo == true && brick.vdoSize;
        //TODO: cache more than one device.
        if(hostCacheConfig.cache && hostVars.gluster_infra_cache_vars == undefined){
          hostVars.gluster_infra_cache_vars = [{
            vgname: vgName,
            cachedisk: hostCacheConfig.ssd,
            cachelvname: `cachelv_${thinpoolName}`,
            cachethinpoolname: thinpoolName,
            cachelvsize: `${hostCacheConfig.size - (hostCacheConfig.size/10)}G`,
            cachemetalvsize: `${hostCacheConfig.size/10}G`,
            cachemetalvname: `cache_${thinpoolName}`,
            cachemode: hostCacheConfig.mode
          }];
        }
        if(isVDO){
          let vdoName = `vdo_${devName}`
          pvName = `/dev/mapper/${vdoName}`;
          if(hostVars.gluster_infra_vdo == undefined){
            hostVars.gluster_infra_vdo = [];
            hostVars.gluster_infra_vdo_blockmapcachesize = "128M";
            hostVars.gluster_infra_vdo_slabsize = (brick.vdoSize <= 1000) ? "2G": "32G";
            hostVars.gluster_infra_vdo_readcachesize = "20M";
            hostVars.gluster_infra_vdo_readcache = "enabled";
            hostVars.gluster_infra_vdo_writepolicy = "auto";
            hostVars.gluster_infra_vdo_emulate512 = "on";
          }

          if(!isDevProcessed){
            hostVars.gluster_infra_vdo.push({
              name: vdoName,
              device: brick.device,
              logicalsize: `${brick.vdoSize}G`
            });
          }
        }

        if(!isDevProcessed){
          //create vg
          hostVars.gluster_infra_volume_groups.push({
            vgname: vgName,
            pvname: pvName
          });
        }

        if(brick.thinPool && !isThinpoolCreated){
          if(hostVars.gluster_infra_thinpools == undefined){
            hostVars.gluster_infra_thinpools = [];
          }
          hostVars.gluster_infra_thinpools.push({
            vgname: vgName,
            thinpoolname: thinpoolName
          });
          isThinpoolCreated = true;
        }

        if(brick.thinPool){
          if(hostVars.gluster_infra_lv_logicalvols == undefined){
            hostVars.gluster_infra_lv_logicalvols = [];
          }
          hostVars.gluster_infra_lv_logicalvols.push({
            vgname: vgName,
            thinpool: thinpoolName,
            lvname: lvName,
            lvsize: `${brick.size}G`
          });
        }
        if(!brick.thinPool){
          if(hostVars.gluster_infra_thick_lvs == undefined){
            hostVars.gluster_infra_thick_lvs = [];
          }
          hostVars.gluster_infra_thick_lvs.push({
            vgname: vgName,
            lvname: lvName,
            size: `${brick.size}G`
          });
        }
        hostVars.gluster_infra_mount_devices.push({
          path: brick.mountPoint,
          lvname: lvName,
          vgname: vgName
        });
        processedDevs[devName] = {thinpool: isThinpoolCreated}
      }
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
    const SSH_OPTS = '-o StrictHostKeyChecking=no'

    localVars.ansible_ssh_common_args = SSH_OPTS;
    groupVars.ansible_ssh_common_args = SSH_OPTS;

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
    let deploymentDone = this.props.deploymentState == "failed" || this.props.deploymentState == "done";
    let showOutput = this.props.isDeploymentStarted || (deploymentDone && !this.props.isRetry);

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
          {!showOutput && !this.state.isEditing && !this.props.isDeploymentStarted &&
            <button className="btn btn-default"
                onClick={this.handleEdit}>
                <span className="pficon pficon-edit">&nbsp;</span>
                Edit
            </button>
          }
          {!showOutput && !this.props.isDeploymentStarted && <button className="btn btn-default"
              onClick={this.handleReload}>
              <span className="fa fa-refresh">&nbsp;</span>
              Reload
            </button>}
        </div>
    </div>
    { !showOutput &&
      <textarea className="wizard-preview"
        value={this.state.inventory}
        onChange={this.handleTextChange}
        readOnly={!this.state.isEditing}
      />
    }
    { showOutput &&
      <textarea className="wizard-preview"
        value={this.props.deploymentStream}
        readOnly={true}
        ref={this.deploymentStreamTextArea}
      />
    }
</div>

          </Col>
        </Row>
      </Grid>
    );
  }
}




export default ReviewStep
