
import Redirect from 'react-router'
import React, { Component } from 'react'

class GlusterManagement2 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      volumeSelectedRow: 'None',
      hostList: null,
      volumeBricks: null,
      volumeInfo: null,
      volumeStatus: null,
      gdeployState: "",
      gdeployWizardType: ""
    };
    //Binding "this" to methods to preserve scope
    this.updateGlusterInfo = this.updateGlusterInfo.bind(this);
    this.updateHostInfo = this.updateHostInfo.bind(this);
    this.updateVolumeInfo = this.updateVolumeInfo.bind(this);
    this.getVolumeStatus= this.getVolumeStatus.bind(this);
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
        that.updateVolumeInfo(
          function (volumeInfo){
            commonGlusterState["volumeInfo"] = volumeInfo;
            that.setState(commonGlusterState);
          });
      }
    );

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
        console.log("Error while fetching volume status: ", err);
        callback({});
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
        callback({})
      }
    );
  }

  getVolumeStatus(volumeName,callback){
    cockpit.spawn(["vdsm-client", "--gluster-enabled", "GlusterVolume", "status", "volumeName="+volumeName])
    .done(
      (volumeStatusJson) => callback(JSON.parse(volumeStatusJson))
    )
    .fail(
      function(err){
        console.log("Error while fetching volume ",volumeName, " status: ", err);
        callback({})
      }
    );
  }

  render(){
    return(
      <div>
        <div className="container-fluid">
          <h2 className="title">Gluster Management</h2>
          <div className="row">
            <div className="col-12">
              {this.state.hostList && <HostsTable hostList={this.state.hostList} />}
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              {this.state.volumeInfo && <VolumeTable volumeInfo={this.state.volumeInfo} />}
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
    this.hostTableRows = [];
    this.hostTableHeadings =[];
    // for (let heading of Object.keys(props.hostList)){
    for (let heading of ["Name","Peer status","Uuid"]){
      this.hostTableHeadings.push(
        <th key={heading}>{heading}</th>
      )
    }
    for(let host of props.hostList){
      this.hostTableRows.push(
        <tr key={host.uuid}>
          <td>{host.hostname}</td>
          <td>{host.status}</td>
          <td>{host.uuid}
        </td></tr>);
    }

  }
  render(){
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

class VolumeTable extends Component{
  constructor(props){
    super(props);
    //generate volumeTableRows
    this.volumeTableRows = [];
    for(let volumeName in props.volumeInfo){
      let volume = props.volumeInfo[volumeName];
      this.volumeTableRows.push(
          <tr key={volume.uuid}>
            <td className="volume-expando"><span className="fa fa-angle-down volume-expando"></span></td>
            <td>{volume.volumeName}</td>
            <td>{volume.volumeType}</td>
            <td>{volume.volumeStatus}</td>
          </tr>
      );
    }
  }//done generating volumeTableRows

  render(){
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
