import React, { Component } from 'react'
import {Grid, Form, FormGroup, FormControl, ControlLabel, HelpBlock} from 'patternfly-react'


class HostStep extends Component{
  constructor(props){
    super(props)
    this.state = {
      hosts: this.props.glusterModel.hosts,
      hostValidation: [false,false,false],
    }
    this.props.callback({isValid: this.state.hostValidation.every((isValid)=> isValid)});
  }

  onHostChanged = (hostID,event) => {
    let hostValue = event.target.value;
    this.setState((prevState)=>{
      prevState.hosts[hostID] = hostValue;
      prevState.hostValidation[hostID] = this.validateHost(hostValue);
      let state = {
        hosts: prevState.hosts,
        hostValidation: prevState.hostValidation,
      };

      const isValid = state.hostValidation.every((isValid)=> isValid);
      this.props.callback({hosts:state.hosts, isValid: isValid});
      return state;
    })
  }

  validateHost = (hostValue) => {
    if (hostValue.length > 0){
      return true
    }
    else{
      return false
    }
  }

  getHostValidationState = (index) => {
    if (this.props.showValidation){
      if(this.state.hostValidation[index]){
        return null
      }
      return 'error'
    }
    return null
  }


  render(){
    let hostInputs = [];
    let hostCount = this.state.hosts.length;
    for (let index = 0; index < hostCount; index++){
      let isArbiterHost = index == hostCount - 1;
      hostInputs.push(
        <FormGroup key={index} validationState={this.getHostValidationState(index)}>
          <ControlLabel>Host {index+1}</ControlLabel>
          <FormControl id={"host-"+index} type="text" placeholder="Host nework address"
            value={this.state.hosts[index]} onChange={(event)=>{this.onHostChanged(index,event)}}
          />
            {isArbiterHost && <HelpBlock>This host will be used as the arbiter if arbiter is configured.</HelpBlock>}
        </FormGroup>
      );
    }
    return (
      <Grid fluid className="wizard-step-container">
        <Grid.Row>
          <Grid.Col>
              {hostInputs}
              <Form inline>
            </Form>
          </Grid.Col>
        </Grid.Row>
      </Grid>
    );
  }
}

HostStep.title = "exported title"

export default HostStep
