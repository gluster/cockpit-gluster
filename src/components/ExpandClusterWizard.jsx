import PropTypes from 'prop-types';
import React, { Component } from 'react';
import GeneralWizard from './common/GeneralWizard'
import HostsStep from './WizardSteps/HostsStep'

class ExpandClusterWizard extends Component {
  constructor(props){
    super(props)
    this.state = {
      glusterModel: {
        hosts:["","",""]
      },
      show: true,
      loading: false,
      isBackDisabled: false,
      isNextDisabled: false,
      activeStepIndex: 0
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
      this.setState({activeStepIndex: index})
    }
    this.finish = () => {
      console.debug("Final");
    }
    this.onCancel = (event) => {
      if (event){
        console.debug(event);
      }
      // console.debug("Cancel");
    }
    this.onBack = (e) => {
      e.preventDefault();
      this.setState((prevState)=>{
        return {activeStepIndex: prevState.activeStepIndex - 1}
      });
    }
    this.onNext = (e) => {
      e.preventDefault();
      console.debug("Next");
      this.setState((prevState)=>{
        return {activeStepIndex: prevState.activeStepIndex + 1}
      });
    }
    this.handleHostsStep = ({hosts, isValid}) => {
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

  render(){

    return (
      <GeneralWizard
        title={this.title}
        show={this.state.show}
        onNext={(e)=> {this.setState({activeStepIndex: this.state.activeStepIndex + 1})}}
        onBack={(e)=> {this.setState({activeStepIndex: this.state.activeStepIndex - 1})}}
        onCancel={this.onCancel}
        onFinal={this.finish}
        onClose={this.close}
        handleStepChange={this.handleStepChange}
        activeStepIndex={this.state.activeStepIndex}
        >
        <HostsStep
          stepName="Hosts 1"
          callback={this.handleHostsStep}
          glusterModel={this.state.glusterModel}/>
      </GeneralWizard>
    );
  }
}


export default ExpandClusterWizard;
