import React, { Component } from 'react'
import {Grid, Form, FormGroup, FormControl, ControlLabel, HelpBlock} from 'patternfly-react'
import {DropdownButton, MenuItem} from 'react-bootstrap'
import { notEmpty } from '../common/validators'

class VolumeStep extends Component{
  constructor(props){
    super(props)
    this.state = {
      volumes: this.props.glusterModel.volumes,
      volumeValidation: [false,false,false],
    }
    if (this.state.volumes.length < 1){
      this.state.volumes.push({
        name: "",
        type: "replicate",
        is_arbiter: false,
        brick_dir: ""
      });
    }
    this.props.callback({isValid: this.state.volumeValidation.every((isValid)=> isValid)});
  }
  onVolumeChange = (index, volume) =>{
    console.debug("onVolumeChange:",volume);
    // this.props.callback({volume})
  }

  render(){
    let volumeInputs = [];
    let volumeCount = this.state.volumes.length;
    for (let index = 0; index < volumeCount; index++){
      console.debug("volume row pushed");
      let callback = ({volume})=>this.console.log(volume);

      callback({volume: "wow"})
      volumeInputs.push(
        <VolumeInput key={index} callback={callback}/>
      );
    }
    console.log(volumeInputs);

    return (
      <Grid fluid className="wizard-step-container">
        <Grid.Row>
          <Grid.Col>
            <Form inline>
              {volumeInputs}

            </Form>
          </Grid.Col>
        </Grid.Row>
      </Grid>
    );
  }
}

class VolumeInput extends Component {
  constructor(props){
    super(props);
    this.state = {
      name: {value:"",validation:false,validationState:null},
      type: {value:"replica",validation:false,validationState:null},
      isArbiter: {value:false,validation:false,validationState:null},
      brickDir: {value:"",validation:false,validationState:null}
    }
    this.validators = {
      name:  (value) => notEmpty(value),
      type: (value) => true,
      isArbiter: (value) => true,
      brickDir: (value) => notEmpty(value)
    }

  }


  onChange = (key, event) => {
    console.debug("onChangeVolumeRow")
    this.setState((prevState)=>{
      let input = prevState[key];
      input.value = event.target.value;
      return { [key]: input };
    });
  }
  onBlur = (key, event) => {
    console.debug("onBlurVolumeRow")
    this.setState((prevState)=>{
      let input =  prevState[key];
      input.value = event.target.value;
      input.validation = this.validators[key](input.value);
      this.props.callback({[key]: input});
      return { [key]: input };
    });
  }


  render(){

    return (
      <FormGroup validationState={this.state.validationState}>
        <ControlLabel>Volume {index+1}</ControlLabel>
        <FormControl type="text"
          value={this.state.name.value}
          onChange={(event)=>{this.onChange("name",event)}}
          onBlur={(event)=>{this.onBlur("name",event)}}
        />
        </FormGroup>
      );
  }
}


export default VolumeStep
