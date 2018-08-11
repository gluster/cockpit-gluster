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
      let callback = (volume)=>{this.onVolumeChange(index,volume)};
      volumeInputs.push(
        <VolumeInput key={index}  index={index} callback={callback}/>
      );
    }

    return (
      <Grid fluid className="wizard-step-container">
        <Grid.Row>
          <Grid.Col>
              {volumeInputs}
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
      values:{
        name: {value:"",validation:false,validationState:null},
        type: {value:"replica",validation:false,validationState:null},
        isArbiter: {value:false,validation:false,validationState:null},
        brickDir: {value:"",validation:false,validationState:null}
      }
    }

    this.validators = {
      name:  (value) => notEmpty(value),
      type: (value) => true,
      isArbiter: (value) => true,
      brickDir: (value) => notEmpty(value)
    }
    for(let key in this.state.values){
      this.state.values[key].validation = this.validators[key](this.state.values[key].value);
    }
  }

  onChange = (key, event) => {
    let value = event.target.value;
    console.debug("onChangeVolumeRow",event)
    this.setState((prevState)=>{
      let values = prevState.values;
      let input = values[key];
      input.value = value;
      return { [key]: input };
    });
  }

  onBlur = (key, event) => {
    let value = event.target.value;
    console.debug("onBlurVolumeRow")
    this.setState((prevState)=>{
      let values = prevState.values;
      let input = values[key];
      input.value = value;
      input.validation = this.validators[key](input.value);
      input.validationState = input.validation ? null : 'error';
      console.debug(this.validators[key])
      this.props.callback({[key]: input});
      return { [key]: input };
    });
  }

  render(){

    return (
      <Grid fluid>
          <Grid.Row>
            <Grid.Col>
              <Form>
                <FormGroup validationState={this.state.values["name"].validationState}>
                  <ControlLabel>Volume {this.props.index+1}</ControlLabel>
                  <FormControl type="text"
                    value={this.state.values["name"].value}
                    onChange={(event)=>{this.onChange("name",event)}}
                    onBlur={(event)=>{this.onBlur("name",event)}}
                  />
                </FormGroup>
              </Form>
            </Grid.Col>
            <Grid.Col>
              <ControlLabel>Type</ControlLabel>
                <DropDown onClick={(event)=>{this.onChange("type",event)}}/>
            </Grid.Col>
          </Grid.Row>
      </Grid>
      );
  }
}


class DropDown extends Component{
  constructor(props){
    super(props)
    this.state ={
      activeItem : 0,
    }
  }

  onSelect = (eventKey,event) =>{
    console.debug("eventKey:", eventKey)
  }
  render(){
    let options = this.props.options;
    let menuItems = [];
    let examples = [
      {name: "Replica", value:"replica"},
      {name: "Distribute", value:"distribute"},
    ]
    options = examples;
    for(let index = 0; index < options.length; index++){
      let option = options[index]
      menuItems.push(
        <li value={option.value} key={option.value} onClick={this.props.onClick}>
            <a>
              {option.name}
            </a>
        </li>
      );
    }
    return(
        <div className="btn-group bootstrap-select dropdown form-control">
          <button className="btn btn-default dropdown-toggle" type="button"
            data-toggle="dropdown" aria-expanded="false">
            <span className="pull-left">{options[this.state.activeItem].name}</span>
            <span className="caret" />
          </button>
          <ul className="dropdown-menu">{menuItems}</ul>
        </div>
    );
  }
}


export default VolumeStep
