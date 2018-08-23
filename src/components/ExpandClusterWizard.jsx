import PropTypes from 'prop-types';
import React, { Component } from 'react';
import GeneralWizard from './common/GeneralWizard'
import HostStep from './WizardSteps/HostStep'
import VolumeStep from './WizardSteps/VolumeStep'
import BrickStep from './WizardSteps/BrickStep'
import ReviewStep from './WizardSteps/ReviewStep'



class ExpandClusterWizard extends Component {
  constructor(props){
    super(props)
    //TODO: push glusterModel out to seperate file and handle different defaults
    this.state = {
      glusterModel: {
        hosts:["","",""],
        volumes: [
          {
            name: "engine",
            type: "replicate",
            isArbiter: false,
            brickDir: "/gluster_bricks/engine/engine"
          },
          {
            name: "data",
            type: "replicate",
            isArbiter: false,
            brickDir: "/gluster_bricks/data/data"
          }
        ],
        bricks: [],
        cacheConfig: [

        ],
        raidConfig:{
          hostIndex: 0,
          raid_type:"JBOD",
          stripe_size:256,
          disk_count:12
        }
      },
      volumeStepValid:true,
      show: true,
      loading: false,
      isBackDisabled: false,
      isNextDisabled: false,
      showValidation: false,
      activeStepIndex: 0,
      isDeploymentStarted: false,
      deploymentPromise: null

    }
    this.title="Expand Cluster";
    this.defaultCacheMode = {
          cache: false,
          ssd: "/dev/sdc",
          size: 20,
          mode: "writethrough"
    }
    this.getDefaultBrickValue = {
      volName: (volume) => {return volume.name},
      device: (volume) => "/dev/sdb",
      size: (volume) =>  100,
      //HACK: waiting for multiple thicklv support from gluster-ansible
      //TODO: honor actual thicklv requests
      //WARNING: For now, the first vol is always thick. Regardless of this value
      thinPool: (volume) => !(volume.name.indexOf('engine') > -1),
      mountPoint: (volume) => {
        let mountPointSplit = volume.brickDir.split('/');
        mountPointSplit.pop();
        let mountPoint = mountPointSplit.join('/')
        return mountPoint
      },
      vdo: (volume) => false,
      vdoSize: (volume) => 200
    }
  }

  close = () => {
    this.setState({ show: false});
  }
  open = () => {
    this.setState({ show: true});
  }
  exit = () =>{
    //TODO: add confirmation
    this.close();
  }
  toggle = () => {
    this.setState((prevState)=>{
      return { show: !prevState.show }
    });
  }
  show = () => {
    this.setState((prevState)=>{
      return { show: true }
    });
  }
  handleStepChange = (index) => {
    this.setState((prevState)=>{
      let newState = { activeStepIndex: index}
      // handle exits
      //TODO: handleTransition
      this.handleExit(prevState.activeStepIndex,index);
      if((this.state.isNextDisabled || this.state.isBackDisabled)){
        newState.activeStepIndex = prevState.activeStepIndex;
        newState.showValidation = true;
      }
      return newState;
    });
  }
  setStreamer = (streamer) => {
    this.setState({deploymentStreamer: streamer});
  }
  finish = (event) => {
    this.setState((prevState)=>{
      let process = cockpit.spawn(
        ["/usr/bin/ansible-playbook",
         "/etc/ansible/hc_wizard.yml",
         "-i /etc/ansible/hc_wizard_inventory.yml"
         ]
       );
      if(prevState.deploymentStreamer !== undefined){
        process.done((data)=>{console.log(data)}).fail((data)=>{console.log(data)}).stream(prevState.deploymentStreamer);
      }
      return { isDeploymentStarted: true, deploymentPromise: process }
    })
  }
  onCancel = (e) =>{
    this.setState((prevState)=>{
      this.state.deploymentPromise.close();
      return { isDeploymentStarted: true, deploymentPromise: process }
    })
    this.props.onCancel();
  }

  onBack = (e) => {
    this.handleStepChange(this.state.activeStepIndex-1)
  }
  onNext = (e) => {
    //console.debug("Next");
    this.handleStepChange(this.state.activeStepIndex+1)
  }
  handleHostStep = ({hosts, isValid}) => {
    ////console.debug("EC.hostChanged,hosts,isValid:",hosts,isValid)
    this.setState((prevState)=>{
      let newState = {};
      if (hosts){
        newState.glusterModel = prevState.glusterModel;
        newState.glusterModel.hosts = hosts;
      }
      newState.isNextDisabled = !isValid;
      newState.volumeStepValid = isValid;
      return newState
    });
  }

  handleVolumeStep = ({volumes, isValid}) => {
   //console.debug("handleVolumeStep");
    this.setState((prevState)=>{
      let newState = {};
      if (volumes){
        newState.glusterModel = prevState.glusterModel;
        newState.glusterModel.volumes = volumes;
      }
      return newState
    });
  }
  handleBrickStep = ({raidConfig, bricks, cacheConfig, isValid}) => {
   //console.debug("EC.handleBrickStep:");
    this.setState((prevState)=>{
      let newState = {};
      if (bricks){
       //console.debug("^ bricks:", bricks)
        newState.glusterModel = prevState.glusterModel;
        newState.glusterModel.bricks = bricks;
      }
      if (raidConfig){
       //console.debug("EC.handleBrickStep.raidConfig",raidConfig);
        newState.glusterModel = prevState.glusterModel;
        newState.glusterModel.raidConfig = raidConfig;
      }
      if (cacheConfig){
       //console.debug("EC.handleBrickStep.cacheConfig",cacheConfig);
        newState.glusterModel = prevState.glusterModel;
        newState.glusterModel.cacheConfig = cacheConfig;
      }
      return newState
    });
  }
  handleExit = (prevIndex,index) => {
    switch (prevIndex){
      case 0:
        this.hostExit();
      break;
      case 1:
        this.volumeExit();
      break;
    }
  }
  hostExit = () => {
    console.debug("EC.hostExit")
    this.setState((prevState)=>{
      let newState ={}
      newState.glusterModel = prevState.glusterModel;
      while(newState.glusterModel.cacheConfig.length < prevState.glusterModel.hosts.length){
        newState.glusterModel.cacheConfig.push(Object.assign({},this.defaultCacheMode));
      }
      console.debug("EC.hostExit cacheConfig",newState.glusterModel.cacheConfig)
      return newState;
    });
  }
  volumeExit = () => {
    console.debug("EC.volumeExit")
    this.setState((prevState)=>{
      let newState = {};
      let hosts = prevState.glusterModel.hosts;
      let volumes = prevState.glusterModel.volumes;
      newState.glusterModel = this.state.glusterModel;
      newState.glusterModel.bricks = []
      while (newState.glusterModel.bricks.length < hosts.length){
        let hostBricks = [];
        for(let volumeIndex = 0; volumeIndex < volumes.length;volumeIndex++){
          let volumeBrick = {};
          for (let key in this.getDefaultBrickValue){
            volumeBrick[key] = this.getDefaultBrickValue[key](volumes[volumeIndex]);
          }
          hostBricks.push(volumeBrick);
        }
        newState.glusterModel.bricks.push(hostBricks);
      }
      console.debug("EC.volumeExit bricks",newState.glusterModel.bricks)
      return newState;
    });
  }

  render(){
   // console.debug("EC.render",JSON.stringify(this.state.glusterModel));
    return (
      <GeneralWizard
        title={this.title}
        show={this.state.show}
        onNext={this.onNext}
        onBack={this.onBack}
        onCancel={this.onCancel}
        onFinal={this.finish}
        onClose={this.close}
        handleStepChange={this.handleStepChange}
        activeStepIndex={this.state.activeStepIndex}
        finalText="Deploy"
        >
        <HostStep
          stepName="Hosts"
          callback={this.handleHostStep}
          glusterModel={this.state.glusterModel}
          showValidation={this.state.showValidation}
        />
        <VolumeStep
          stepName="Volumes"
          callback={this.handleVolumeStep}
          glusterModel={this.state.glusterModel}
          showValidation={this.state.showValidation}
        />
      <BrickStep
        stepName="Bricks"
        callback={this.handleBrickStep}
        glusterModel={this.state.glusterModel}
        showValidation={this.state.showValidation}
      />
      <ReviewStep
        stepName="Preview"
        glusterModel={this.state.glusterModel}
        isDeploymentStarted={this.state.isDeploymentStarted}
        deploymentPromise={this.state.deploymentPromise}
        setStreamer={this.setStreamer}
      />

      </GeneralWizard>
    );
  }
}


export default ExpandClusterWizard;
