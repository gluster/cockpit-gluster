import PropTypes from 'prop-types';
import React, { Component } from 'react';
import GeneralWizard from './common/GeneralWizard'
import HostsStep from './WizardSteps/HostsStep'

class ExpandClusterWizard extends Component {
  constructor(props){
    super(props)
    this.state = {
      show: true,
      loading: false,
      isBackDisabled: false,
      isNextDisabled: false,
      activeStepIndex: 2
    }
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
    this.onFinal = () => {
      console.log("Final");
    }
    this.onCancel = () => {
      console.log("Cancel");
    }
    this.onBack = () => {
      console.log("Back");
    }
  }

  render(){

    return (
      <GeneralWizard
        show={this.state.show}
        onBack={this.onBack}
        onCancel={this.onCancel}
        onFinal={this.onFinal}
        activeStepIndex={this.props.activeStepIndex}
        isBackDisabled={this.state.isBackDisabled}
        isNextDisabled={this.state.isNextDisabled}
        >
        <HostsStep/>
      </GeneralWizard>
    );
  }
}


export default ExpandClusterWizard;
