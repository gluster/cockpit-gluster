import React, { Component } from 'react'
import {Grid, Form, FormGroup, FormControl, ControlLabel, HelpBlock, Checkbox} from 'patternfly-react'
import { notEmpty } from '../common/validators'

class VolumeStep extends Component{
  constructor(props){
    super(props)
    this.state = {
      // volumes: Object.assign({}, this.props.glusterModel.volumes),
      volumes: this.props.glusterModel.volumes.slice(), //.slice() for hard copy
      volumeValidation: this.props.glusterModel.volumes.map((x)=>false),
    }
    this.typeOptions = [
      {name: "Replica", value:"replica"},
      {name: "Distribute", value:"distribute"}
    ]
    this.props.callback({isValid: this.state.volumeValidation.every((isValid)=> isValid)});
    //console.debug("VolumeStepConstructor: volumes", this.state.volumes);
  }
  onVolumeChanged = (index, {updateKey, volumeValidation,value}) =>{
    this.setState((prevState)=>{
      let volumes = prevState.volumes;
      let volumeValidation = prevState.volumeValidation;
      if (value) {
        volumes[index][updateKey] = value;
      }
      if (volumeValidation){
        volumeValidation[index] = volumeValidation;
      }
      this.props.callback({volumes:volumes,isValid: volumeValidation.every((isValid)=> isValid)})
      return { volumes: volumes, volumeValidation: volumeValidation }
    })
  }

  handleAddVolume = (event) => {
    this.setState((prevState)=>{
      let volumes = prevState.volumes;
      let volumeValidation = prevState.volumeValidation;
      volumes.push({
                  name: "",
                  type: "replicate",
                  isArbiter: false,
                  brickDir: ""
                });
      volumeValidation.push(false);
      this.props.callback({volumes:volumes,isValid: false});
      return {volumes: volumes, volumeValidation: volumeValidation}
    });
  }

  handleDeleteVolume = (index) => {
    this.setState((prevState)=>{
      let volumes = prevState.volumes;
      let volumeValidation = prevState.volumeValidation;
      volumes.splice(index,1);
      volumeValidation.splice(index,1);
      this.props.callback({volumes:volumes,isValid: false});
      return {volumes: volumes, volumeValidation: volumeValidation}
    });

  }

  render(){
    console.debug("VS.state.volumes:",this.state.volumes);
    let volumeInputs = [];
    let volumeCount = this.state.volumes.length;
    for (let index = 0; index < volumeCount; index++){
      let callback = (volume)=>{this.onVolumeChanged(index,volume)};
      volumeInputs.push(
        <VolumeInput
          key={index}
          volume={this.state.volumes[index]}
          index={index}
          onVolumeChangedCallback={callback}
          typeOptions={this.typeOptions}
          deleteCallback={()=>{this.handleDeleteVolume(index)}}
        />
      );
    }

    return (
      <Grid fluid className="wizard-step-container">
        <Grid.Row>
          <Grid.Col>
              {volumeInputs}
          </Grid.Col>
        </Grid.Row>
        <Grid.Row>
          <Grid.Col smOffset={5} sm={2}>
            <a onClick={this.handleAddVolume} className="col-md-offset-4">
                <span className="pficon pficon-add-circle-o">
                    <strong> Add Volume</strong>
                </span>
            </a>
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
      this.state.values[key].value = this.props.volume[key]
      this.state.values[key].validation = this.validators[key](this.state.values[key].value);
    }
  }

  getVolumeValidation = (prevState) => {
    for (let key in prevState.values){
      if (!prevState.values[key]["validation"]){
        return false
      }
    }
    return true
  }
  onChange = (key, value) => {
    //console.debug("onChangeVolumeRow",key,value)
    this.setState((prevState)=>{
      let values = prevState.values;
      let input = values[key];
      input.value = value;
      input.validation = this.validators[key](input.value);
      this.props.onVolumeChangedCallback({updateKey: key, volumeValidation: this.getVolumeValidation(prevState), value: input.value});

      return {[key]: input};
    });
  }

  onBlur = (key, value) => {
    //console.debug("onBlurVolumeRow")
    this.setState((prevState)=>{
      let values = prevState.values;
      let input = values[key];
      input.value = value;
      input.validation = this.validators[key](input.value);
      input.validationState = input.validation ? null : 'error';
      return { [key]: input };
    });
  }
  //Normal means from-event
  onChangeNormal = (key, event) => {
    let value = event.target.value;
    this.onChange(key, value);
  }
  onBlurNormal = (key, event) => {
    let value = event.target.value;
    this.onBlur(key, value);
  }
  onChecked = (key,event) => {
    let value = event.target.checked;
    this.onChange(key, value);
  }

  render(){
    //console.debug("volumeRowValues:",this.state.values)
    return (
      <Grid fluid>
          <Grid.Row>
            <Grid.Col sm={3}>
              <Form>
                <FormGroup validationState={this.state.values["name"].validationState}>
                  <ControlLabel>Name</ControlLabel>
                  <FormControl type="text"
                    value={this.state.values["name"].value}
                    onChange={(event)=>{this.onChangeNormal("name",event)}}
                    onBlur={(event)=>{this.onBlurNormal("name",event)}}
                  />
                </FormGroup>
              </Form>
            </Grid.Col>
            <Grid.Col sm={2}>
              <ControlLabel>Volume Type</ControlLabel>
                <DropDown typeOptions={this.props.typeOptions} onSelect={(value)=>{this.onChange("type",value)}}/>
            </Grid.Col>
            <Grid.Col sm={1}>
              <Form>
                <FormGroup validationState={this.state.values["isArbiter"].validationState}>
                  <ControlLabel>Arbiter</ControlLabel>
                  <Checkbox type="checkbox"
                    checked={this.state.values["isArbiter"].value}
                    onChange={(event)=>{this.onChecked("isArbiter",event)}}
                  />
                </FormGroup>
              </Form>
            </Grid.Col>
            <Grid.Col sm={4}>
              <Form>
                <FormGroup validationState={this.state.values["brickDir"].validationState}>
                  <ControlLabel>Brick Directory</ControlLabel>
                  <FormControl type="text"
                    value={this.state.values["brickDir"].value}
                    onChange={(event)=>{this.onChangeNormal("brickDir",event)}}
                    onBlur={(event)=>{this.onBlurNormal("brickDir",event)}}
                  />
                </FormGroup>
              </Form>
            </Grid.Col>
            <Grid.Col sm={1}>
                <a onClick={this.props.deleteCallback}>
                  <span className="pficon pficon-delete gdeploy-wizard-delete-icon">
                  </span>
                </a>
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

  onClick = (value,index) => {
    this.setState((prevState)=>{
      return {activeItem:index}
    });
    this.props.onSelect(value);
  }
  render(){
    let options = this.props.typeOptions;
    let menuItems = [];

    for(let index = 0; index < options.length; index++){
      let option = options[index]
      menuItems.push(
        <li value={option.value} key={option.value} onClick={(event) => {this.onClick(option.value,index)}}>
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
            <span className="pull-left">{options[this.state.activeItem]["name"]}</span>
            <span className="caret" />
          </button>
          <ul className="dropdown-menu">{menuItems}</ul>
        </div>
    );
  }
}


export default VolumeStep
