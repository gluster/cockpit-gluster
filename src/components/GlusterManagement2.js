
import Redirect from 'react-router'
import React, { Component } from 'react'

class GlusterManagement2 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedVolumes: {},
      hostList: null,
      volumeBricks: null,
      volumeInfo: null,
      volumeStatus: null,
      gdeployState: "",
      gdeployWizardType: ""
    };
    //Binding "this" of the component to "this" of the component
    this.updateGlusterInfo = this.updateGlusterInfo.bind(this);
    this.updateHostInfo = this.updateHostInfo.bind(this);
    this.updateVolumeInfo = this.updateVolumeInfo.bind(this);
    this.updateVolumeStatus= this.updateVolumeStatus.bind(this);
    this.handleVolumeRowClick= this.handleVolumeRowClick.bind(this);

  }
  componentDidMount(){

    this.updateGlusterInfo();
    // this.glusterInterval = setInterval(this.updateGlusterInfo)
  }

  componentWillUnmount(){

  }

  updateGlusterInfo(){
    let that = this;
    let commonGlusterState = {};
    that.updateHostInfo(
      function (hostList){
        commonGlusterState["hostList"] = hostList;
        that.setState({hostList:hostList})
      }
    );
    that.updateVolumeInfo(
      function (volumeInfo){
        that.setState({volumeInfo:volumeInfo});
    });

  }

  updateHostInfo(callback){
    cockpit.spawn([ "vdsm-client", "--gluster-enabled", "GlusterHost", "list" ])
    .done(
      function (hostListJson){
        // console.log(hostListJson);
        let hostList = JSON.parse(hostListJson).hosts;
        callback(hostList);
      }
    )
    .fail(
      function(err){
        console.log("Error while fetching host info: ", err);
        callback(null);
      }
    );
  }

  updateVolumeInfo(callback){
    let that = this;
    cockpit.spawn(["vdsm-client", "--gluster-enabled", "GlusterVolume", "list"])
    .done(
      function (volumeInfoJson){
        var volumeInfo = JSON.parse(volumeInfoJson);
        // console.log(volumeInfo.volumes["engine"].bricks);
        callback(volumeInfo.volumes);
      }
    )
    .fail(
      function(err){
        console.log("Error while fetching volume info: ", err);
        callback(null);
      }
    );
  }

  updateVolumeStatus(volumeName,callback){
    cockpit.spawn(["vdsm-client", "--gluster-enabled", "GlusterVolume", "status", "volumeName="+volumeName])
    .done(
      (volumeStatusJson) => callback(JSON.parse(volumeStatusJson).volumeStatus)
    )
    .fail(
      function(err){
        console.log("Error while fetching volume status for ",volumeName, " status: ", err);
        callback(null);
      }
    );
  }

  handleVolumeRowClick(volumeName){
    let that = this;
    // let newSelectedVolumes = this.state.selectedVolumes;
    this.setState(function(prevState, props){
      if(prevState.selectedVolumes.hasOwnProperty(volumeName)){
        delete prevState.selectedVolumes[volumeName];
        return {selectedVolumes:prevState.selectedVolumes}
      }
      else{
        prevState.selectedVolumes[volumeName]="fetching";
        that.updateVolumeStatus(volumeName, function(volumeStatus){
          that.setState(function(prevState,props){
            if(prevState.volumeStatus == null){
              prevState.volumeStatus = {};
            }
            prevState.volumeStatus[volumeName]= volumeStatus;
            prevState.selectedVolumes[volumeName]="";
            return {volumeStatus:prevState.volumeStatus,selectedVolumes:prevState.selectedVolumes};
          });
        });

        return {selectedVolumes:prevState.selectedVolumes}
      }
    });
  }

  render(){
    console.log("hostList:",this.state.hostList);
    return(
      <div>
        <div className="container-fluid">
          <h2 className="title">Gluster Management</h2>
          <div className="row">
            <div className="col-12">
              {this.state.hostList !== null && <HostsTable hostList={this.state.hostList} />}
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              {this.state.volumeInfo !== null && <VolumeTable volumeInfo={this.state.volumeInfo} selectedVolumes={this.state.selectedVolumes} volumeStatus={this.state.volumeStatus} handleVolumeRowClick={this.handleVolumeRowClick}/>}
            </div>
          </div>
        </div>
      </div>
    )
  }

}

class HostsTable extends Component{
  constructor(props){
    super(props);
  }
  generateTable(){
    this.hostTableRows = [];
    this.hostTableHeadings =[];
    // for (let heading of Object.keys(props.hostList)){
    for (let heading of ["Name","Peer status","UUID"]){
      this.hostTableHeadings.push(
        <th key={heading}>{heading}</th>
      )
    }
    for(let host of this.props.hostList){
      this.hostTableRows.push(
        <tr key={host.uuid}>
          <td>{host.hostname}</td>
          <td>{host.status}</td>
          <td>{host.uuid}
        </td></tr>);
    }
  }
  render(){
    console.log("Rendering HostsTable");
    this.generateTable();
    return(
      <div className="panel panel-default">
        <div className="panel-heading">Hosts</div>

        <table className="table">
          <thead>
            <tr>{this.hostTableHeadings}</tr>
          </thead>
          <tbody>
            {this.hostTableRows}
          </tbody>
        </table>
      </div>
    )
  }
}

class VolumeBricksTable extends Component{
  constructor(props){
    super(props);
  }
  generateTable(){
    this.volumeBricksTableRows = [];
    for(let brick of this.props.volumeBrickList){
      this.volumeBricksTableRows.push(
        <tr key={brick.brick}>
          <td>{brick.brick}</td>
          <td>{brick.hostuuid}</td>
          <td>{brick.status}</td>
        </tr>);
    }
  }
  render(){
    this.generateTable()
    return(
      <div className="panel panel-default">
        <table className="table">
          <thead>
            <tr>
              <th>Brick</th>
              <th>Host UUID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {this.volumeBricksTableRows}
          </tbody>
        </table>
      </div>
    )
  }
}


class VolumeTable extends Component{
  constructor(props){
    super(props);

  }

  generateTable(){
    this.volumeTableRows = [];
    for(let volumeName in this.props.volumeInfo){
      let volume = this.props.volumeInfo[volumeName];
      let expanded = this.props.selectedVolumes.hasOwnProperty(volumeName) && this.props.volumeStatus !== null && this.props.volumeStatus[volumeName] !== undefined;
      this.volumeTableRows.push(
          <tr key={volume.uuid} onClick={()=>{this.props.handleVolumeRowClick(volumeName)}}>
            <td className="volume-expando">{expanded && <span className="fa fa-angle-down volume-expando"></span>}{!expanded && <span className="fa fa-angle-right volume-expando"></span>}</td>
            <td>{volumeName}</td>
            <td>{volume.volumeType}</td>
            <td>{volume.volumeStatus}</td>
          </tr>
      );
      if(expanded){
        this.volumeTableRows.push(
          <tr className="no-highlight" key={volumeName+"-brick-status"}>
            <td className="no-highlight" colSpan="100">
              <VolumeBricksTable volumeBrickList={this.props.volumeStatus[volumeName].bricks} />
            </td>
          </tr>
        );
      }
    }
  }

  render(){
    // console.log("VolumeTable rendered.");
    // console.log("Volume Status: ",this.props.volumeStatus);
    // console.log("selectedVolumes: ",this.props.selectedVolumes);
    this.generateTable();
    return(
      <div className="panel panel-default">
        <div className="panel-heading">Volumes</div>
        <table className="table table-hover">
          <thead>
            <tr>
              <th className="volume-expando"></th>
              <th>Name</th>
              <th>Volume Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {this.volumeTableRows}
          </tbody>
        </table>
      </div>
    )
  }
}





export default GlusterManagement2
