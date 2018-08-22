import React, { Component } from 'react'
import jwt from 'jsonwebtoken'
import ExpandClusterWizard from './ExpandClusterWizard'

class GlusterManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedVolumes: {},
      peers: null,
      volumeBricks: null,
      volumes: null,
      expandClusterStarted: true,
      showExpandCluster: true
    };
    this.gluster_api = cockpit.http("24007");
    this.expandClusterWizard = React.createRef();
    //Binding "this" of the function to "this" of the component.
    //However, when nesting calls, it seems best to use "let that = this;"
    // and use  "that" in the inner nested calls.
    this.getPeers = this.getPeers.bind(this);
    this.getVolumes = this.getVolumes.bind(this);
    this.handleVolumeRowClick= this.handleVolumeRowClick.bind(this);
    this.handleExpandCluster= this.handleExpandCluster.bind(this);
  }

  componentDidMount(){
    this.getPeers();
    this.getVolumes();
  }
  onCancelExpandClusterWizard = (event) =>{
    this.setState({expandClusterStarted: false});
  }

  generateAuthHeader(){
    //TODO: get secret from fs
    let secret = "fake_secret";
    let algorithm = "HS256";
    let app_id = "cockpit-gluster";
    let time = Math.floor(new Date().getTime/1000);
    let claims = {
      "iss" : app_id,
      "iat" : time,
      "exp" : time + 120
    }
    return "bearer " + jwt.sign(claims, secret, {algorithm: algorithm})
  }

  getPeers(){
    let that = this;
    let headers = { "Authorization" : this.generateAuthHeader() };
    let promise =  this.gluster_api.get("/v1/peers")
    promise
    .then(function(result){
          let peers = JSON.parse(result);
          that.setState({"peers":peers});
        })
    .catch(function(reason){
          console.warn("Failed for reason: ", reason);
        })
    return promise
  }

  getVolumes(){
    let that = this;
    let headers = { "Authorization" : this.generateAuthHeader() };
    // console.log("headers", headers);
    let promise =  this.gluster_api.get("/v1/volumes")
    promise
    .then(function(result){
          let volumes = JSON.parse(result);
          that.setState({"volumes":volumes});
        })
    .catch(function(reason){
          console.warn("Failed for reason: ", reason);
        })
    return promise
  }

  getVolumeBricks(volumeName){
    let that = this;
    let headers = { "Authorization" : this.generateAuthHeader() };
    let promise =  this.gluster_api.get("/v1/volumes/"+volumeName+"/bricks")
    promise
    .then(function(volumeBricksJson){
          let volumeBrickList = JSON.parse(volumeBricksJson);
          that.setState(function(prevState, props){
            if(prevState.volumeBricks == null){
              prevState.volumeBricks = {};
            }
            prevState.volumeBricks[volumeName] = volumeBrickList;
            return {"volumeBricks": prevState.volumeBricks}
          });
        })
    .catch(function(reason){
          console.warn("Failed for reason: ", reason);
        })
    return promise
  }


  handleVolumeRowClick(volumeName){
    let that = this;
    this.setState(function(prevState, props){
      if(prevState.selectedVolumes.hasOwnProperty(volumeName)){
        delete prevState.selectedVolumes[volumeName];
        return {selectedVolumes:prevState.selectedVolumes}
      }
      else{
        prevState.selectedVolumes[volumeName]="fetching";
        that.getVolumeBricks(volumeName).then(function(volumeBricks){
          that.setState(function(prevState,props){
            prevState.selectedVolumes[volumeName] = "";
            return {selectedVolumes:prevState.selectedVolumes};
          });
        });

        return {selectedVolumes:prevState.selectedVolumes}
      }
    });
  }

  handleExpandCluster(event){
    this.setState((prevState)=>{
      if (prevState.expandClusterStarted){
        if(this.expandClusterWizard.current){
          this.expandClusterWizard.current.toggle();
        }
        return null
      }
      return { expandClusterStarted: true}
    })
  }

  render(){
    return(
      <div>
        <div className="container-fluid gluster-management">
          <h2 className="title">Gluster Management</h2>
          <div className="row">
            <div className="col-12">
              {
                this.state.peers !== null &&
                <HostsTable peers={this.state.peers}
                  handleRefresh={this.getPeers}
                handleExpandCluster={this.handleExpandCluster}/>
              }
              {
                this.state.peers == null &&
                <InlineAlert
                  message="We were unable to fetch peer data! Open the browser console for more info." />
              }
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              {
                this.state.volumes !== null &&
                <VolumeTable volumes={this.state.volumes}
                  selectedVolumes={this.state.selectedVolumes}
                  volumeBricks={this.state.volumeBricks}
                  handleRefresh={this.getVolumes}
                  handleVolumeRowClick={this.handleVolumeRowClick}/>
              }
              {
                this.state.volumes == null &&
                <InlineAlert
                  message="We were unable to fetch volume data! Open the browser console for more info." />
              }
            </div>
          </div>
          {this.state.expandClusterStarted && <ExpandClusterWizard onCancel={this.onCancelExpandClusterWizard} ref={this.expandClusterWizard}/>}
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
    this.moreInfoModals=[];
    for (let heading of ["Name","Peer status","ID","More Info"]){
      this.hostTableHeadings.push(
        <th key={heading}>{heading}</th>
      )
    }
    for(let host of this.props.peers){
      this.hostTableRows.push(
        <tr key={host.id}>
          <td>{host.name}</td>
          <td>

            {host.online && <span><span className="fa fa-arrow-circle-o-up status-icon" ></span> Online</span>}
            {!host.online && <span><span className="fa fa-arrow-circle-o-down status-icon"></span> Offline</span>}
          </td>
          <td>{host.id}</td>
          <td><ObjectModalButton modalId={host.id}/></td>
        </tr>);
      this.moreInfoModals.push(
        <ObjectModal key={host.id} modalObject={host} title={"Peer: "+host.name} modalId={host.id}/>
      );
    }
  }

  render(){
    this.generateTable();
    return(
      <div className="panel panel-default">
        <div className="panel-heading">
          Peers
          <button className="btn btn-default refresh-btn"
            onClick={this.props.handleRefresh}>
            <span className="fa fa-refresh"/>
          </button>
          <span className="pull-right">
            <button className="btn btn-default action-btn"
              onClick={this.props.handleExpandCluster}>
              Expand Cluster
            </button>
          </span>
        </div>
        <table className="table">
          <thead>
            <tr>{this.hostTableHeadings}</tr>
          </thead>
          <tbody>
            {this.hostTableRows}
          </tbody>
        </table>
        {this.moreInfoModals}
      </div>
    )
  }
}

class VolumeBricksTable extends Component{
  constructor(props){
    super(props);
  }

  generateTable = () => {
    this.volumeBricksTableRows = [];
    this.brickMoreInfoModals = [];
    let modalCounter = 0;
    for(let brick of this.props.volumeBrickList){
      let brickInfo = brick.info;
      modalCounter++;
      this.volumeBricksTableRows.push(
        <tr key={brickInfo.id}>
          <td>{brickInfo.path}</td>
          <td>{brickInfo.id}</td>
          <td>
            {brick.online && <span><span className="fa fa-arrow-circle-o-up status-icon" ></span> Online</span>}
            {!brick.online && <span><span className="fa fa-arrow-circle-o-down status-icon"></span> Offline</span>}
          </td>
          <td><ObjectModalButton modalId={brickInfo.id}/></td>
        </tr>);
        this.brickMoreInfoModals.push(
          <ObjectModal key={brickInfo.id} title={"Brick: "+brick.brick}  modalId={brickInfo.id} modalObject={brick} />
        );
    }
  }

  render(){
    this.generateTable()
    return(
      <div className="panel panel-default volume-bricks-table">
        <table className="table">
          <thead>
            <tr>
              <th>Brick</th>
              <th>UUID</th>
              <th>Status</th>
              <th>More Info</th>
            </tr>
          </thead>
          <tbody>
            {this.volumeBricksTableRows}
          </tbody>
        </table>
        {this.brickMoreInfoModals}
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
    this.moreInfoModals=[];
    for(let volume of this.props.volumes){
      let expanded = this.props.selectedVolumes.hasOwnProperty(volume.name) && this.props.volumeBricks !== null && this.props.volumeBricks[volume.name] !== null && this.props.volumeBricks[volume.name] !== undefined;
      this.volumeTableRows.push(
          <tr key={volume.id} onClick={()=>{this.props.handleVolumeRowClick(volume.name)}}>
            <td className="volume-expando">{expanded && <span className="fa fa-angle-down volume-expando"></span>}{!expanded && <span className="fa fa-angle-right volume-expando"></span>}</td>
            <td>{volume.name}</td>
            <td>{volume.type}{volume["arbiter-count"] > 0 && " (with Arbiter)"}</td>
            <td>
              {/* {volume.volumeBricks == 'ONLINE' ? <span className="fa fa-arrow-circle-o-up status-icon" ></span>:<span className="fa fa-arrow-circle-o-down status-icon"></span> } */}
              {volume.state}
            </td>
            <td><ObjectModalButton modalId={volume.id}/></td>
          </tr>
      );
      this.moreInfoModals.push(
        <ObjectModal key={volume.id} modalObject={volume} title={"Volume: "+volume.name} modalId={volume.id}/>
      );
      if(expanded){
        //TODO: pass the volume.bricksInfo brickinfo so it can be displayed in the modal
        this.volumeTableRows.push(
          <tr className="no-highlight" key={volume.name+"-brick-status"}>
            <td className="no-highlight" colSpan="100">
              <VolumeBricksTable volumeBrickList={this.props.volumeBricks[volume.name]} />
            </td>
          </tr>
        );
      }
    }
  }

  render(){

    this.generateTable();
    return(
      <div className="panel panel-default">
        <div className="panel-heading">
          Volumes
          <button
            className="btn btn-default refresh-btn"
            onClick={this.props.handleRefresh}>
            <span className="fa fa-refresh"/>
          </button>
          <span className="pull-right">
            <button className="btn btn-default action-btn"
              onClick={()=>{}}>
              Create Volume
            </button>
          </span>
        </div>
        <table className="table table-hover">
          <thead>
            <tr>
              <th className="volume-expando"></th>
              <th>Name</th>
              <th>Volume Type</th>
              <th>Status</th>
              <th>More Info</th>
            </tr>
          </thead>
          <tbody>
            {this.volumeTableRows}
          </tbody>
        </table>
        {this.moreInfoModals}
      </div>
    )
  }
}

class ObjectModal extends Component {
  constructor(props){
    super(props);
    //required props: title,id,modalObject
  }

  generateTable(){
    this.rowList = [];
    for(let key in this.props.modalObject){
      var value = this.props.modalObject[key];
      if (Array.isArray(value) && value.every((value)=> {return typeof(value) ==='string'})){
        value = value.join(", ");
      }
      else if (typeof(value) === 'object') {
        value = <pre className="prettify"><code>{JSON.stringify(value)}</code></pre>;
      }
      else if (typeof(value.toString) === 'function'){
        value = value.toString();
      }
      this.rowList.push(
        <tr key={key}>
          <td>{key}</td>
          <td>{value}</td>
        </tr>
      );
    }
  }

  render(){
    this.generateTable();
    return(
      <div>
        <div className="modal fade object-modal" id={this.props.modalId} tabIndex="-1" role="dialog" aria-labelledby={this.props.title}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">{this.props.title} <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></h4>

              </div>
              <div className="modal-body object-modal" >
                <table>
                  <tbody>
                    <tr>
                      <th>Key</th>
                      <th>Value</th>
                    </tr>
                    {this.rowList}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function ObjectModalButton(props){
  function handleClick(event){
    event.stopPropagation();
    $("#"+props.modalId).modal({show:true,keyboard:true});
  }
  return (
    <button className="btn btn-find btn-link object-modal-btn" title="More Info" type="button" onClick={handleClick}>
      <span className="fa fa-lg fa-info-circle"></span>
    </button>
  );
}

function InlineAlert(props){
  return(
    <div className="alert alert-warning">
      <span className="pficon pficon-warning-triangle-o"></span>
      {props.message}
    </div>

  )
}
export default GlusterManagement
