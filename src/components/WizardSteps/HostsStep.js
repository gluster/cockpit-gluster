import React, { Component } from 'react'
import {Grid, Form, FormGroup, FormControl, ControlLabel, WizardStep} from 'patternfly-react'


class HostsStep extends Component{
  constructor(props){
    super(props)
    this.state = {
      hosts: {}
    }
    this.onChange = (event) => {
      let hostID = event.target.id;
      let hostValue = event.target.value;
      this.setState((prevState)=>{
        prevState.hosts[hostID] = hostValue;
        return { hosts: prevState.hosts }
      })
    }
  }

  render(){
    console.debug("Rendering HostsStep")
    return (
      <Grid fluid className="wizard-step-container">
        <Grid.Row>
          <Grid.Col>
            <Form>
              <FormGroup>
                <ControlLabel>Host 1</ControlLabel>
                <FormControl id={"host0"} type="text" value={this.state.hosts["host0"]}onChange={this.onChange}/>
              </FormGroup>
              <FormGroup>
                <ControlLabel>Host 2</ControlLabel>
                <FormControl id={"host1"} type="text" value={this.state.hosts["host1"]}onChange={this.onChange}/>
              </FormGroup>
              <FormGroup>
                <ControlLabel>Host 3</ControlLabel>
                <FormControl id={"host2"} type="text" value={this.state.hosts["host2"]}onChange={this.onChange}/>
              </FormGroup>
            </Form>
          </Grid.Col>
        </Grid.Row>
      </Grid>
    );
  }
}

HostsStep.title = "exported title"

export default HostsStep
