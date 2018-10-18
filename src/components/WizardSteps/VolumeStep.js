import React, { Component } from 'react'
import {Grid, Form, FormGroup, FormControl, ControlLabel, HelpBlock, Checkbox} from 'patternfly-react'
import { notEmpty } from '../../lib/validators'
import Dropdown from '../common/Dropdown'

class VolumeStep extends Component{
  constructor(props){
    super(props)
    this.state = {
      // volumes: Object.assign({}, this.props.glusterModel.volumes),
      volumes: this.props.glusterModel.volumes.slice(), //.slice() for hard copy
      volumeValidation: this.props.glusterModel.volumes.map((x)=>false),
    }
    this.typeOptions = [
      {name: "Replica", value:"replica"}
      // ,{name: "Distribute", value:"distribute"}
    ]
    this.props.callback({isValid: this.state.volumeValidation.every((isValid)=> isValid)});
   //console.debug("VS.Constructor: volumes", this.state.volumes);
  }
  onVolumeChanged = (index, {updateKey, volumeValidation,value}) =>{
    this.setState((prevState)=>{
      let volumes = prevState.volumes;
      let volumeValidation = prevState.volumeValidation;
      if (value) {
        volumes[index][updateKey] = value;
        // if(updateKey == "name"){
        //   volumes[index]["brickDir"] = "/gluster_bricks/"+value+"/"+value;
        //  //console.debug("VS.onVolumeChanged")
        // }
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
      console.debug("before:",volumes);
      volumes.splice(index,1);
      volumeValidation.splice(index,1);
      console.debug("after:",volumes);
      this.props.callback({volumes:volumes,isValid: false});
      return {volumes: volumes, volumeValidation: volumeValidation}
    });

  }

  render(){
   //console.debug("VS.state.volumes:",this.state.volumes);
    let volumeRows = [];
    let volumeCount = this.state.volumes.length;
    for (let index = 0; index < volumeCount; index++){
      let callback = (volume)=>{this.onVolumeChanged(index,volume)};
      volumeRows.push(
        <VolumeRow
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
          <Grid.Col sm={3}>
                <ControlLabel>Name</ControlLabel>
          </Grid.Col>
          <Grid.Col sm={2}>
            <ControlLabel>Volume Type</ControlLabel>
          </Grid.Col>
          <Grid.Col sm={1}>
                <ControlLabel>Arbiter</ControlLabel>
          </Grid.Col>
          <Grid.Col sm={4}>
                <ControlLabel>Brick Directory</ControlLabel>
          </Grid.Col>
        </Grid.Row>
        <Grid.Row>
          <Grid.Col>
              {volumeRows}
          </Grid.Col>
        </Grid.Row>
        <Grid.Row>
          <Grid.Col smOffset={4} sm={2}>
            <a onClick={this.handleAddVolume}>
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

class VolumeRow extends Component {
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

  componentWillReceiveProps = (nextProps) =>{
    if(JSON.stringify(nextProps)!==JSON.stringify(this.props)){
      this.setState((prevState)=>{
        let newState = {}
        newState.values = prevState.values;
        for(let key in newState.values){
          newState.values[key].value = nextProps.volume[key]
          newState.values[key].validation = this.validators[key](newState.values[key].value);
        }
      });
    }
    else{
      console.debug("VS.VR.nextProps same as oldProps");
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
      values[key].value = value;
      values[key].validation = this.validators[key](values[key].value);
      if (key == "name"){
        values["brickDir"].value = `/gluster_bricks/${value}/${value}`;
        values["brickDir"].validation = this.validators["brickDir"](values["brickDir"].value);
        this.props.onVolumeChangedCallback({
            updateKey: "brickDir",
            volumeValidation: this.getVolumeValidation(prevState),
            value: values["brickDir"].value
          });

      }
      this.props.onVolumeChangedCallback({
          updateKey: key,
          volumeValidation: this.getVolumeValidation(prevState),
          value: values[key].value
        });

      return {values: values};
    });
  }

  onBlur = (key, value) => {
    //console.debug("onBlurVolumeRow")
    this.setState((prevState)=>{
      let values = prevState.values;
      values[key].value = value;
      values[key].validation = this.validators[key](values[key].value);
      values[key].validationState = values[key].validation ? null : 'error';
      return { values: values };
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
    console.debug("VS.VR.state:",this.state);
    return (
      <Grid fluid>
          <Grid.Row>
            <Grid.Col sm={3}>
              <Form>
                <FormGroup validationState={this.state.values["name"].validationState}>
                  <FormControl type="text"
                    value={this.state.values["name"].value}
                    onChange={(event)=>{this.onChangeNormal("name",event)}}
                    onBlur={(event)=>{this.onBlurNormal("name",event)}}
                  />
                </FormGroup>
              </Form>
            </Grid.Col>
            <Grid.Col sm={2}>
                <Dropdown value={this.state.values["type"].value} typeOptions={this.props.typeOptions} onSelect={(value,index)=>{this.onChange("type",value)}}/>
            </Grid.Col>
            <Grid.Col sm={1}>
              <Form>
                <FormGroup validationState={this.state.values["isArbiter"].validationState}>
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




export default VolumeStep
