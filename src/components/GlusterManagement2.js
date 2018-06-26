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
    this.updateHostInfo(
      function (hostList){
        commonGlusterState["hostList"] = hostList;
        that.setState(commonGlusterState);
      }
    );

  }

  updateHostInfo(callback){
    cockpit.spawn([ "vdsm-client", "--gluster-enabled", "GlusterHost", "list" ])
    .done(
      function (hostListJson){
        console.log(hostListJson);
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

  updateVolumeInfo(){
    cockpit.spawn(["vdsm-client", "--gluster-enabled", "GlusterVolume", "list"])
    .done(
      function (volumeInfoJson){
        let volumeInfo = JSON.parse(volumeInfoJson);
        for(let volumeName of Object.keys(volumeInfo.volumes)){
          getVolumeStatus(volumeName, function(volumeStatus){
            //replaces the brick-name string list with a brick-status object list.
            volumeInfo.volumes[volumeName].bricks = volumeStatus.volumeStatus.bricks;
          })//end getVolumeStatus
        }
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
            <div className="col-11 col-sm-7 col-md 6">
              {this.state.hostList && <HostsTable hostList={this.state.hostList} />}
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
    for(var host of props.hostList){
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
            <tr><th>Name</th><td>Peer status</td><td>Uuid</td></tr>
          </thead>
          <tbody>
            {this.hostTableRows}
          </tbody>
        </table>
      </div>
    )
  }
}




export default GlusterManagement2
