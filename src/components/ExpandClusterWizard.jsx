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
        volumes: []
      },
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
      console.debug("Final");
    }
    this.onCancel = (event) => {
      if (event){
        console.debug(event);
      }
      console.debug("Cancel");
    }
    this.onBack = (e) => {
      e.preventDefault();
      this.setState((prevState)=>{
        return {activeStepIndex: prevState.activeStepIndex - 1, showValidation: "false"}
      });
    }
    this.onNext = (e) => {
      e.preventDefault();
      console.debug("Next");
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
      if (isValid){
        this.setState((prevState)=>{
          prevState.glusterModel.hosts = hosts;
          return { isNextDisabled: false, glusterModel: prevState.glusterModel};
        })
      }
      else{
        this.setState({isNextDisabled:true});
      }
    }
  }

  handleVolumeStep = ({volumes, isValid}) => {
    console.debug("handleVolumeStep");
  }

  render(){
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
