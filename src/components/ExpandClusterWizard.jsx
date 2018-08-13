import PropTypes from 'prop-types';
import React, { Component } from 'react';
import GeneralWizard from './common/GeneralWizard'
import HostStep from './WizardSteps/HostStep'
import VolumeStep from './WizardSteps/VolumeStep'

class ExpandClusterWizard extends Component {
  constructor(props){
    super(props)
    this.state = {
      glusterModel: {
        hosts:["","",""],
        volumes: [
          {
            name: "",
            type: "replicate",
            isArbiter: false,
            brickDir: ""
          }
        ]
      },
      volumeStepValid:true,
      show: true,
      loading: false,
      isBackDisabled: false,
      isNextDisabled: false,
      showValidation: false,
      activeStepIndex: 1
    }
    this.title="Expand Cluster";
    this.close = () => {
      this.setState({ show: false});
    }
    this.open = () => {
      this.setState({ show: true});
    }
    this.exit = () =>{
      //TODO: add confirmation
      this.close();
    }
    this.toggle = () => {
      this.setState((prevState)=>{
        return { show: !prevState.show }
      });
    }
    this.handleStepChange = (index) => {
      this.setState((prevState)=>{
        if(!(this.state.isNextDisabled || this.state.isBackDisabled)){
          return {activeStepIndex: index}
        }
      })
    }
    this.finish = () => {
      //console.debug("Final");
    }
    this.onCancel = (event) => {
      if (event){
        //console.debug(event);
      }
      //console.debug("Cancel");
    }
    this.onBack = (e) => {
      this.setState((prevState)=>{
        return {activeStepIndex: prevState.activeStepIndex - 1, showValidation: "false"}
      });
    }
    this.onNext = (e) => {
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
    this.handleHostStep = ({hosts, isValid}) => {
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

  render(){
    console.debug("EC.gm.hosts",this.state.glusterModel.hosts);
    console.debug("EC.gm.volumes",this.state.glusterModel.volumes);
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

      </GeneralWizard>
    );
  }
}


export default ExpandClusterWizard;
