import React, { Component } from 'react'
import {Grid, Form, FormGroup, FormControl, ControlLabel, HelpBlock} from 'patternfly-react'


class HostsStep extends Component{
  constructor(props){
    super(props)
    this.state = {
      hosts: this.props.glusterModel.hosts,
      hostValidation: [null,null,null],
      isValidationStarted: false
    }
    this.onChange = (index,event) => {
      let hostID = index;
      let hostValue = event.target.value;
      console.debug(hostValue);
      this.setState((prevState)=>{
        prevState.hosts[hostID] = hostValue;
        prevState.hostValidation[hostID] = this.validateHost(hostValue);
        let state = {
          hosts: prevState.hosts,
          hostValidation: prevState.hostValidation,
          isValidationStarted: true
        };
        const isValid = state.isValidationStarted && state.hostValidation.every((value)=> value == null);
        this.props.callback({hosts:state.hosts, isValid: isValid});
        return state;
      })
    }
  }
  validateHost = (hostValue) => {
    console.debug(hostValue.length);
    if (hostValue.length > 0){
      return null
    }
    else{
      return 'error'
    }
  }



  render(){
    let hostInputs = [];
    let hostCount = hostCount
    for (let index = 0; index < this.state.hosts.length; index++){
      let isArbiterHost = index == hostCount - 1;
      hostInputs.push(
        <FormGroup key={index} validationState={this.state.hostValidation[index]}>
          <ControlLabel>Host {index+1}</ControlLabel>
          <FormControl id={"host-"+index} type="text" placeholder="Host nework address"
            value={this.state.hosts[index]}onChange={(event)=>{this.onChange(index,event)}}/>
            {isArbiterHost && <HelpBlock>This host will be used as the arbiter if arbiter is configured.</HelpBlock>}
        </FormGroup>
      );
    }
    console.debug("Rendering HostsStep")
    console.debug("state.hostValidation:",this.state.hostValidation)
    return (
      <Grid fluid className="wizard-step-container">
        <Grid.Row>
          <Grid.Col>
            <Form>
              {hostInputs}
            </Form>
          </Grid.Col>
        </Grid.Row>
      </Grid>
    );
  }
}

HostsStep.title = "exported title"

export default HostsStep
