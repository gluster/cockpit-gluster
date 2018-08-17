import PropTypes from 'prop-types';
import React, { Component } from 'react';
import GeneralWizard from './common/GeneralWizard'
import HostStep from './WizardSteps/HostStep'
import VolumeStep from './WizardSteps/VolumeStep'
import BrickStep from './WizardSteps/BrickStep'

class ExpandClusterWizard extends Component {
  constructor(props){
    super(props)
    this.state = {
      glusterModel: {
        hosts:["1","2","3"],
        volumes: [
          {
            name: "hah",
            type: "replicate",
            isArbiter: false,
            brickDir: "/gluster_bricks/hah"
          }
        ],
        bricks: [],
        raidConfig:{
          hostIndex: 0,
          raid_type:"jbod",
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
      activeStepIndex: 2
    }
    this.title="Expand Cluster";
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
  handleStepChange = (index) => {
    this.setState((prevState)=>{
      if(!(this.state.isNextDisabled || this.state.isBackDisabled)){
        return {activeStepIndex: index}
      }
    })
  }
  finish = () => {
    //console.debug("Final");
  }
  onCancel = (event) => {
    if (event){
      //console.debug(event);
    }
    //console.debug("Cancel");
  }
  onBack = (e) => {
    this.setState((prevState)=>{
      return {activeStepIndex: prevState.activeStepIndex - 1, showValidation: "false"}
    });
  }
  onNext = (e) => {
    //console.debug("Next");
    this.setState((prevState)=>{
      if (prevState.isNextDisabled){
        return {showValidation: true}
      }
      else{
        return {activeStepIndex: prevState.activeStepIndex + 1, showValidation: false }
      }
    });
  }
  handleHostStep = ({hosts, isValid}) => {
    // console.debug("EC.hostChanged,hosts,isValid:",hosts,isValid)
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
    console.debug("handleVolumeStep");
    this.setState((prevState)=>{
      let newState = {};
      if (volumes){
        newState.glusterModel = prevState.glusterModel;
        newState.glusterModel.volumes = volumes;
      }
      return newState
    });
  }
  handleBrickStep = ({raidConfig, bricks, isValid}) => {
    console.debug("EC.handleBrickStep:");
    this.setState((prevState)=>{
      let newState = {};
      if (bricks){
        console.debug("^ bricks:", bricks)
        newState.glusterModel = prevState.glusterModel;
        newState.glusterModel.bricks = bricks;
      }
      if (raidConfig){
        console.debug("EC.handleBrickStep.raidConfig",raidConfig);
        newState.glusterModel = prevState.glusterModel;
        newState.glusterModel.raidConfig = raidConfig;
      }
      return newState
    });
  }

  render(){
    console.debug("EC.render hosts",this.state.glusterModel.hosts);
    console.debug("EC.render volumes",this.state.glusterModel.volumes);
    console.debug("EC.render bricks",this.state.glusterModel.bricks);
    console.debug("EC.render raidConfig",this.state.glusterModel.raidConfig);
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

      </GeneralWizard>
    );
  }
}


export default ExpandClusterWizard;
