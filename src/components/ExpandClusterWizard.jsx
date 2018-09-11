import PropTypes from 'prop-types';
import React, { Component } from 'react';
import GeneralWizard from './common/GeneralWizard'
import HostStep from './WizardSteps/HostStep'
import VolumeStep from './WizardSteps/VolumeStep'
import BrickStep from './WizardSteps/BrickStep'
import ReviewStep from './WizardSteps/ReviewStep'

import { defaultGlusterModel, runGlusterAnsible, INVENTORY } from '../lib/gluster-ansible'



class ExpandClusterWizard extends Component {
  constructor(props){
    super(props)
    //TODO: push glusterModel out to seperate file and handle different defaults
    this.state = {
      glusterModel: JSON.parse(JSON.stringify(defaultGlusterModel)),
      volumeStepValid:true,
      show: true,
      loading: false,
      isBackDisabled: false,
      isNextDisabled: false,
      showValidation: false,
      activeStepIndex: 0,
      isDeploymentStarted: false,
      deploymentPromise: null,
      deploymentStream: "",

    }
    if (this.props.type == "createVolume"){
      console.debug("EC.createVolume gM.hosts",this.state.glusterModel.hosts);
      this.state.glusterModel.hosts = this.props.peers.slice(0,3).map((host)=>host.name);
      this.state.glusterModel.volumes = [{
                  name: "",
                  type: "replicate",
                  isArbiter: false,
                  brickDir: ""
                }]
    }
    else{
      console.debug("EC.expandCluster gM.hosts",this.state.glusterModel.hosts);
      this.state.glusterModel.volumes = [{
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
                }];
    }
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
  deploymentStreamer = (data) => {
    console.debug("EC.dS.stream", data)
    this.setState((prevState)=>{
      return { deploymentStream: prevState.deploymentStream+data}
    });
  }
  deploymentDone = (data,msg) => {
    console.debug("EC.dS.done", data,msg)
    this.setState((prevState)=>{
      return { isDeploymentStarted: false, deploymentStream: prevState.deploymentStream+data}
    });
  };
  deploymentFail = (ex,data) => {
    console.debug("EC.dS.fail", data,ex)
    this.setState((prevState)=>{
      return { isDeploymentStarted: false, deploymentStream: prevState.deploymentStream+data}
    });
  }
  deploy = (event) => {
    this.setState((prevState)=>{
      if (!prevState.isDeploymentStarted){
        let depPromise = runGlusterAnsible(
          INVENTORY,
          this.deploymentStreamer,
          this.deploymentDone,
          this.deploymentFail
        );
        return { isDeploymentStarted: true, deploymentPromise: depPromise }
      }
    });
  }
  stopDeployment = (e) =>{
    this.setState((prevState)=>{
      if (prevState.isDeploymentStarted){
        this.state.deploymentPromise.close();
        return { isDeploymentStarted: false }
      }
    })
  }
  onCancel = (e) =>{
    this.setState((prevState)=>{
      if (prevState.isDeploymentStarted){
        this.state.deploymentPromise.close();
        return { isDeploymentStarted: false }
      }
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
   let finalMethod = this.deploy;
   let isNextDisabled = this.state.isDeploymentStarted;
   let finalText = this.state.isDeploymentStarted ? "Retry" : "Deploy";
    return (
      <GeneralWizard
        title={this.title}
        show={this.state.show}
        onNext={this.onNext}
        onBack={this.onBack}
        onCancel={this.onCancel}
        onFinal={finalMethod}
        onClose={this.close}
        handleStepChange={this.handleStepChange}
        activeStepIndex={this.state.activeStepIndex}
        finalText={finalText}
        isNextDisabled={isNextDisabled}
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
        deploymentStream={this.state.deploymentStream}
      />

      </GeneralWizard>
    );
  }
}


export default ExpandClusterWizard;
