import React, { Component } from 'react'
import {Grid, Form, FormGroup, FormControl, ControlLabel, HelpBlock} from 'patternfly-react'


class HostStep extends Component{
  constructor(props){
    super(props)
    this.state = {
      hostValidation: this.props.glusterModel.hosts.map((host)=>this.validateHost(host)),
    }
    this.props.callback({isValid: this.state.hostValidation.every((isValid)=> isValid)});
  }

  onHostChanged = (hostIndex,event) => {
    //console.debug("HS.onHC triggered!")
    let hostValue = event.target.value;
    this.setState((prevState)=>{
      let newHosts=this.props.glusterModel.hosts.slice()
      //console.debug("HS.onHC newHosts", newHosts)
      newHosts[hostIndex] = hostValue;
      prevState.hostValidation[hostIndex] = this.validateHost(hostValue);
      let state = {
        hostValidation: prevState.hostValidation,
      };

      const isValid = state.hostValidation.every((isValid)=> isValid);
      this.props.callback({hosts: newHosts, isValid: isValid});
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
    //console.debug("inSideHS, gm.hosts:",this.props.glusterModel.hosts)
    let hostInputs = [];
    let hostCount = this.props.glusterModel.hosts.length;
    //console.debug(hostCount)
    for (let index = 0; index < hostCount; index++){
      let isArbiterHost = index == hostCount - 1;
      hostInputs.push(
        <FormGroup key={index} validationState={this.getHostValidationState(index)}>
          <ControlLabel>Host {index+1}</ControlLabel>
          <FormControl id={"host-"+index} type="text" placeholder="Host nework address"
            value={this.props.glusterModel.hosts[index]} onChange={(event)=>{this.onHostChanged(index,event)}}
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
