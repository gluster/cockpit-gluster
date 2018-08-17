import React, { Component } from 'react'
import {Grid, Form, FormGroup, FormControl, ControlLabel, HelpBlock, Checkbox, Row, Col} from 'patternfly-react'
import { notEmpty } from '../common/validators'
import Dropdown from '../common/Dropdown'

class BrickStep extends Component{
  constructor(props){
    super(props)
    this.state = {
      //props: glusterModel
      hostIndex:0,

      raidValidation: {
        raid_type:{validation:false,validationState:null},
        stripe_size:{validation:false,validationState:null},
        disk_count:{validation:false,validationState:null}
      }
    }
    this.validators = {
      stripe_size:(value) => {return notEmpty(value)},
      disk_count:(value) => {return notEmpty(value)}
    }

    //for generating bricks from volumes
    this.getDefaultValue = {
      volName: (volume) => {return volume.name},
      device: (volume) => "/dev/sdb",
      size: (volume) =>  100,
      thinPool: (volume) => true,
      mountPoint: (volume) => {
        let mountPointSplit = volume.brickDir.split('/');
        mountPointSplit.pop();
        let mountPoint = mountPointSplit.join('/')
        return mountPoint
      },
      vdo: (volume) => false
    }


    this.raidOptions = [
      {name: "JBOD", value:"jbod"},
      {name: "RAID 5", value:"raid_5"},
      {name: "RAID 6", value:"raid_6"},
      {name: "RAID 10", value:"raid_10"}
    ]
    // this.props.callback({isValid: this.state.brickValidation.every((isValid)=> isValid)});
    //console.debug("BS.Constructor: bricks", this.state.bricks);
  }


  componentWillMount(){
    //initialize validation
    for(let key in this.props.glusterModel.raidConfig){
      if (typeof(this.validators[key]) == 'function'){
        let validation = false;
        let value = this.props.glusterModel.raidConfig[key];
        let validator = this.validators[key];
        if (value !== undefined){
          validation = validator(value);
        }
        this.state.raidValidation[key].validation = validation;
      }
    }
  }

  handleHostSelect = (value, hostIndex) => {
    this.setState({hostIndex:hostIndex});
  }

  handleBrickChange = (hostIndex, index, bricks,{brickKey, brickValue, isValid}) => {
    let oldBricks = bricks;

    let newBricks = [];
    if (oldBricks !== undefined){
      newBricks = oldBricks.slice();
    }
    // console.debug("BS.handleBrickChange",hostIndex,index,brickKey, brickValue, JSON.stringify(newBricks))
    newBricks[hostIndex][index][brickKey] = brickValue;
    this.props.callback({bricks: newBricks});
  }

  onChangeRaidConfig = (key, value) => {
    this.setState((prevState)=>{
      let newState = {};
      let newRaidConfig = Object.assign({},this.props.glusterModel.raidConfig);
      let validation = true;
      if (typeof(this.validators[key]) == 'function'){
        validation = this.validators[key](value);
      }
      newRaidConfig[key] = value;
      newState.raidValidation = prevState.raidValidation;
      newState.raidValidation[key].validation = validation;
      this.props.callback({raidConfig: newRaidConfig});
      return newState
    });
    let validation
  }
  onBlurRaidConfig = (key,value) => {
    this.setState((prevState)=>{
      let newState = {};
      let validation = true;
      if (typeof(this.validators[key]) == 'function'){
        validation = this.validators[key](value);
      }
      newState.raidValidation = prevState.raidValidation;
      newState.raidValidation[key].validation = validation;
      newState.raidValidation[key].validationState = validation ? null : 'error';
     //console.debug("BS.newRaidValidationState",newState.raidValidation[key].validationState)
      return newState
    });
  }

  onChangeNormal = (key, event) => {
    let value = event.target.value;
    this.onChangeRaidConfig(key, value);
  }
  onBlurNormal = (key, event) => {
    let value = event.target.value;
    this.onBlurRaidConfig(key, value);
  }



  render(){
   //console.debug("BS.props.volumes:",this.props.glusterModel.volumes);
   //console.debug("BS.props.bricks:",this.props.glusterModel.bricks);
    //generating bricks from vols
    let hosts = this.props.glusterModel.hosts;
    let volumes = this.props.glusterModel.volumes;
    //using slice() to create a local copy
    let bricks = this.props.glusterModel.bricks.slice();
    let bricksChanged = false;

    let hostOptions = hosts.map((host)=>{
      return {name: host, value:host}
    });

    while(bricks.length < hosts.length){
      bricks.push([]);
    }
    for (let hostIndex = 0;hostIndex < hosts.length; hostIndex++){
      while (bricks[hostIndex].length < volumes.length){
        let index = bricks[hostIndex].length;
        let brick = {};
        for (let key in this.getDefaultValue){
          brick[key] = this.getDefaultValue[key](volumes[index]);
        }
        bricks[hostIndex].push(
          brick
          // {volName: volumes[index].name, thinPool:false, device: "/dev/sdb", size: 100, mountPoint: "/gluster_bricks/"+volumes[index].name+"/",vdo: false}
        );
        bricksChanged = true;
      }
    }

    if (bricksChanged){
      this.props.callback({bricks: bricks});
    }
    let brickRows = [];
    let volumeCount = volumes.length;
    for (let index = 0; index < volumeCount; index++){
     //console.debug("BS.BR.vol."+index, volumes[index])
     //console.debug("BS.BR.brick."+index, bricks[this.state.hostIndex][index])
      brickRows.push(
        <BrickRow
          key={index}
          index={index}
          volume={volumes[index]}
          brick={bricks[this.state.hostIndex][index]}
          callback={(brickInfo)=>{this.handleBrickChange(this.state.hostIndex,index,bricks,brickInfo)}}
        />
      );
    }

    return (
      <Grid fluid className="wizard-step-container">
        <Row>
          <Col>
            <ControlLabel>
              <FormGroup>
                <strong>Raid Info:</strong>
              </FormGroup>
            </ControlLabel>
          </Col>
        </Row>

          <Row>
            <Col sm={2}>
              <ControlLabel>
                Raid Type
              </ControlLabel>
            </Col>
            <Col sm={2}>
              <Form>
                <FormGroup>
                  <Dropdown
                    typeOptions={this.raidOptions}
                    onSelect={(index, value) => {this.onChangeRaidConfig("raid_type", value)}}
                  />
                </FormGroup>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col sm={2}>
              <ControlLabel>
                Stripe Size(KB)
              </ControlLabel>
            </Col>
            <Col sm={2}>
              <Form>
                <FormGroup validationState={this.state.raidValidation["stripe_size"].validationState}>
                  <FormControl type="text"
                    value={this.props.glusterModel.raidConfig["stripe_size"]}
                    onChange={(event)=>{this.onChangeNormal("stripe_size",event)}}
                    onBlur={(event)=>{this.onBlurNormal("stripe_size",event)}}
                  />
                </FormGroup>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col sm={2}>
              <ControlLabel>
                Data Disk Count
              </ControlLabel>
            </Col>
            <Col sm={2}>
              <Form>
                <FormGroup validationState={this.state.raidValidation["disk_count"].validationState}>
                  <FormControl type="text"
                    value={this.props.glusterModel.raidConfig["disk_count"]}
                    onChange={(event)=>{this.onChangeNormal("disk_count",event)}}
                    onBlur={(event)=>{this.onBlurNormal("disk_count",event)}}
                  />
                </FormGroup>
              </Form>
            </Col>
          </Row>

        <Row>
          <Col>
            <FormGroup>
              <ControlLabel>
                <strong>Brick Configuration:</strong>
              </ControlLabel>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={2}>
            <ControlLabel>
              Select Hosts:
            </ControlLabel>
          </Col>
          <Col sm={7}>
            <Form>
              <FormGroup>
                <Dropdown
                  typeOptions={hostOptions}
                  onSelect={this.handleHostSelect}
                />
              </FormGroup>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup>
              <hr/>
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col className={"wizard-bricksdir"} sm={12}>
              {brickRows}
          </Col>
        </Row>
      </Grid>
    );
  }
}


class BrickRow extends Component {
    constructor(props){
      super(props);
      this.state = {
        validation: {
          volName: {validation:false,validationState:null},
          device:{validation:false,validationState:null},
          size: {validation:false,validationState:null},
          thinPool:{validation:false,validationState:null},
          mountPoint:{validation:false,validationState:null},
          vdo: {validation:false,validationState:null}
        }
      }

      this.validators = {
        volName: (value) => notEmpty(value),
        device: (value) => notEmpty(value),
        size:  (value) => notEmpty(value),
        mountPoint: (value) => notEmpty(value),
      }
      //only keys with values derived from the volume go here.
      //entries are (volume) => {return value} functions
      this.getDefaultValue = {
        volName: (props) => {return props.volume.name},
        device: (props) => "/dev/sdb",
        size: (props) =>  100,
        thinPool: (props) => true,
        mountPoint: (props) => {
          let mountPointSplit = props.volume.brickDir.split('/');
          mountPointSplit.pop();
          let mountPoint = mountPointSplit.join('/')
          return mountPoint
        },
        vdo: (props) => false
      }


      for(let key in this.validators){
        let validation = false;
        let value = this.props.brick[key]
        let validator = this.validators[key];
        if (typeof(validator) == 'function' && value !== undefined){
          validation = validator(value)
        }
        this.state.validation[key].validation = validation;
      }

    }

    onChange = (brick, key, value) => {
      this.setState((prevState)=>{
        let newState = {};
        let validator = this.validators[key];
        newState.validation = prevState.validation;
        if (typeof(validator) == 'function'){
          newState.validation[key].validation = validator(value);
          if(newState.validation[key].validation){
            newState.validation[key].validationState = null;
          }
        }
        this.props.callback({brickKey: key, brickValue: value});
        return newState
      });
    }

    onBlur = (brick, key, value) => {
     //console.debug("BR.onBlur",key,value);
      this.setState((prevState)=>{
        let newState = {};
        let validator = this.validators[key];
        newState.validation = prevState.validation;
        if (typeof(validator) == 'function'){
          newState.validation[key].validation = this.validators[key](value);
          newState.validation[key].validationState = newState.validation[key].validation ? null : 'error';
        }
        return newState
      });
    }



    render(){
    let brick = this.props.brick;
   //console.debug("BR.render brick",brick)
    const gridValues=[2,2,2,1,3,1];
    return(
      <React.Fragment>
        {this.props.index == 0 && <Row>
          <Col sm={gridValues[0]}>
                <ControlLabel>Volume Name</ControlLabel>
          </Col>
          <Col sm={gridValues[1]}>
            <ControlLabel>Device Name</ControlLabel>
          </Col>
          <Col sm={gridValues[2]}>
                <ControlLabel>Size(GB)</ControlLabel>
          </Col>
          <Col sm={gridValues[3]}>
                <ControlLabel>Thinp</ControlLabel>
          </Col>
          <Col sm={gridValues[4]}>
                <ControlLabel>Mount Point</ControlLabel>
          </Col>
          <Col sm={gridValues[5]}>
                <ControlLabel><div>Dedupe &</div>Compression</ControlLabel>
          </Col>
        </Row>}
        <Row>
          <Col sm={gridValues[0]}>
            <Form>
              <FormGroup validationState={this.state.validation["volName"].validationState}>
                <FormControl type="text"
                  value={brick["volName"]}
                  onChange={(event)=>{
                    this.onChange(brick, "volName", event.target.value)
                  }}
                  onBlur={(event)=>{
                    this.onBlur(brick, "volName",event.target.value)
                  }}
                />
              </FormGroup>
            </Form>
          </Col>
          <Col sm={gridValues[1]}>
            <Form>
              <FormGroup validationState={this.state.validation["device"].validationState}>
                <FormControl type="text"
                  value={brick["device"]}
                  onChange={(event)=>{
                    this.onChange(brick, "device", event.target.value)
                  }}
                  onBlur={(event)=>{
                    this.onBlur(brick, "device",event.target.value)
                  }}
                />
              </FormGroup>
            </Form>
          </Col>
          <Col sm={gridValues[2]}>
            <Form>
              <FormGroup validationState={this.state.validation["size"].validationState}>
                <FormControl type="text"
                  value={brick["size"]}
                  onChange={(event)=>{
                    this.onChange(brick, "size", event.target.value)
                  }}
                  onBlur={(event)=>{
                    this.onBlur(brick, "size",event.target.value)
                  }}
                />
              </FormGroup>
            </Form>
          </Col>
          <Col sm={gridValues[3]}>
            <Form>
              <FormGroup validationState={this.state.validation["thinPool"].validationState}>
                <Checkbox
                  checked={brick["thinPool"]}
                  onChange={(event)=>{this.onChange(brick, "thinPool",event.target.checked)}}
                />
              </FormGroup>
            </Form>
          </Col>
          <Col sm={gridValues[4]}>
            <Form>
              <FormGroup validationState={this.state.validation["mountPoint"].validationState}>
                <FormControl type="text"
                  value={brick["mountPoint"]}
                  onChange={(event)=>{
                    this.onChange(brick, "mountPoint", event.target.value)
                  }}
                  onBlur={(event)=>{
                    this.onBlur(brick, "mountPoint",event.target.value)
                  }}
                />
              </FormGroup>
            </Form>
          </Col>
          <Col sm={gridValues[5]}>
            <Form>
              <FormGroup validationState={this.state.validation["vdo"].validationState}>
                <Checkbox
                  checked={brick["vdo"]}
                  onChange={(event)=>{this.onChange(brick, "vdo",event.target.checked)}}
                />
              </FormGroup>
            </Form>
          </Col>
        </Row>
    </React.Fragment>
    );
  }
}


export default BrickStep
