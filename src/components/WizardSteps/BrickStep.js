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
      },
      cacheValidation: []
    }
    // this.defaultCacheMode = {
    //   cache: false,
    //   ssd: "/dev/sdc",
    //   size: 20,
    //   mode: "writethrough"
    // }

    this.validators = {
      stripe_size:(value) => {return notEmpty(value)},
      disk_count:(value) => {return notEmpty(value)}
    }

    while(this.state.cacheValidation.length < this.props.glusterModel.cacheConfig.length){
      let hostCacheValidation = {};
      for (let key in this.props.glusterModel.cacheConfig[this.state.hostIndex]){
        hostCacheValidation[key] = {validation:false,validationState:null}
      }
      this.state.cacheValidation.push(hostCacheValidation);
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
      {name: "JBOD", value:"JBOD"},
      {name: "RAID 5", value:"RAID5"},
      {name: "RAID 6", value:"RAID6"},
      {name: "RAID 10", value:"RAID10"}
    ]
    this.cacheModeOptions =[
      {name:"writethrough",value:"writethrough"},
      {name:"writeback",value:"writeback"}
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

  onChangeCacheConfig = (key, value) => {
    this.setState((prevState)=>{
      let newState = {};
      let newCacheConfig = this.props.glusterModel.cacheConfig.slice();
      let validation = true;
      if (typeof(this.validators[key]) == 'function'){
        validation = this.validators[key](value);
      }
      newCacheConfig[prevState.hostIndex][key] = value;
      if (prevState.hostIndex == 0){
        for (let hostIndex = 1; hostIndex < newCacheConfig.length; hostIndex++){
          newCacheConfig[hostIndex][key] = value;
        }
      }
      newState.cacheValidation = prevState.cacheValidation;
      newState.cacheValidation[prevState.hostIndex][key].validation = validation;
      this.props.callback({cacheConfig: newCacheConfig});
      return newState
    });
  }
  onBlurCacheConfig = (key, value) => {
    this.setState((prevState)=>{
      let newState = {};

      let validation = true;
      if (typeof(this.validators[key]) == 'function'){
        validation = this.validators[key](value);
      }
      newState.cacheValidation = prevState.cacheValidation;
      newState.cacheValidation[prevState.hostIndex][key].validation = validation;
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
   console.debug("BS.props.bricks:",this.props.glusterModel.bricks);
   // console.debug("BS.props.cacheConfig:",this.props.glusterModel.cacheConfig);
    // let hosts = this.props.glusterModel.hosts;
    // let volumes = this.props.glusterModel.volumes;
    // let bricks = this.props.glusterModel.bricks;

    let { hosts, volumes, bricks, cacheConfig } = this.props.glusterModel;
    let cacheClassNames = cacheConfig[this.state.hostIndex].cache ? "" : "hidden";

    let hostOptions = hosts.map((host)=>{
      return {name: host, value:host}
    });

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
                  <FormControl type="number"
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
                  <FormControl type="number"
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
          <Col className={"wizard-brick-rows"} sm={12}>
              {brickRows}
          </Col>
        </Row>

        <Row className="cache-config-rows">
          <Col sm={12}  >
            <Form inline>
              <FormGroup validationState={null}>
                <Checkbox
                  className="wizard-checkbox cache-checkbox"
                  checked={this.props.glusterModel.cacheConfig[this.state.hostIndex]["cache"]}
                  onChange={(event)=>{
                    this.onChangeCacheConfig("cache",event.target.checked)
                  }}
                />
              </FormGroup>
              <ControlLabel className="cache-label">
                Configure LV Cache
              </ControlLabel>
            </Form>
          </Col>
        </Row>
        <Row className={cacheClassNames+" cache-config-rows"}>
          <Col sm={2}>
            <ControlLabel>
              SSD
            </ControlLabel>
          </Col>
          <Col sm={2}>
            <Form>
              <FormGroup validationState={this.state.cacheValidation[this.state.hostIndex]["ssd"].validationState}>
                <FormControl type="text"
                  value={this.props.glusterModel.cacheConfig[this.state.hostIndex]["ssd"]}
                  onChange={(event)=>{this.onChangeCacheConfig("ssd",event.target.value)}}
                  onBlur={(event)=>{this.onBlurCacheConfig("ssd",event.target.value)}}
                />
              </FormGroup>
            </Form>
          </Col>
        </Row>
        <Row className={cacheClassNames+" cache-config-rows"}>
          <Col sm={2}>
            <ControlLabel>
              LV Size(KB)
            </ControlLabel>
          </Col>
          <Col sm={2}>
            <Form>
              <FormGroup validationState={this.state.cacheValidation[this.state.hostIndex]["size"].validationState}>
                <FormControl type="number"
                  value={this.props.glusterModel.cacheConfig[this.state.hostIndex]["size"]}
                  onChange={(event)=>{this.onChangeCacheConfig("size",event.target.value)}}
                  onBlur={(event)=>{this.onBlurCacheConfig("size",event.target.value)}}
                />
              </FormGroup>
            </Form>
          </Col>
        </Row>
        <Row className={cacheClassNames+" cache-config-rows"}>
          <Col sm={2}>
            <ControlLabel>
              Cache Mode
            </ControlLabel>
          </Col>
          <Col sm={3}>
            <Form>
              <FormGroup>
                <Dropdown
                  typeOptions={this.cacheModeOptions}
                  onSelect={(value) => {this.onChangeCacheConfig("mode", value)}}
                />
              </FormGroup>
            </Form>
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
    const gridValues=[2,2,2,1,2,3];
    return(
      <React.Fragment>
        {this.props.index == 0 && <Row className="brick-row brick-title-row">
          <Col sm={gridValues[0]} className="brick-col" >
                <ControlLabel>Volume Name</ControlLabel>
          </Col>
          <Col sm={gridValues[1]} className="brick-col" >
            <ControlLabel>Device Name</ControlLabel>
          </Col>
          <Col sm={gridValues[2]} className="brick-col" >
                <ControlLabel>Size(GB)</ControlLabel>
          </Col>
          <Col sm={gridValues[3]} className="brick-col wizard-checkbox thinpool" >
                <ControlLabel>Thinp</ControlLabel>
          </Col>
          <Col sm={gridValues[4]} className="brick-col" >
                <ControlLabel>Mount Point</ControlLabel>
          </Col>
          <Col sm={gridValues[5]} className="brick-col wizard-checkbox vdo" >
                <ControlLabel>Dedupe & Compression</ControlLabel>
          </Col>
        </Row>}
        <Row className="brick-entry-row">
          <Col sm={gridValues[0]} className="brick-col" >
            <Form>
              <FormGroup validationState={this.state.validation["volName"].validationState}>
                <FormControl
                  type="text"
                  disabled={true}
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
          <Col sm={gridValues[1]} className="brick-col" >
            <Form>
              <FormGroup className="brick-form-group"  validationState={this.state.validation["device"].validationState}>
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
          <Col sm={gridValues[2]} className="brick-col" >
            <Form>
              <FormGroup className="brick-form-group"  validationState={this.state.validation["size"].validationState}>
                <FormControl type="number"
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
          <Col sm={gridValues[3]} className="brick-col wizard-checkbox thinpool" >
            <Form>
              <FormGroup className="brick-form-group"  validationState={this.state.validation["thinPool"].validationState}>
                <Checkbox
                  disabled={true}
                  className="wizard-checkbox"
                  checked={brick["thinPool"]}
                  onChange={(event)=>{this.onChange(brick, "thinPool",event.target.checked)}}
                />
              </FormGroup>
            </Form>
          </Col>
          <Col sm={gridValues[4]} className="brick-col" >
            <Form>
              <FormGroup className="brick-form-group"  validationState={this.state.validation["mountPoint"].validationState}>
                <FormControl
                  type="text"
                  disabled={true}
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
          <Col sm={gridValues[5]} className="brick-col wizard-checkbox vdo" >
            <Form>
              <FormGroup className="brick-form-group"  validationState={this.state.validation["vdo"].validationState}>
                <Checkbox
                  className="wizard-checkbox vdo"
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
