import React, { Component } from 'react'

export class ObjectModal extends Component {
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
<<<<<<< HEAD
        <div className="modal fade" id="confirm-delete" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
=======
        <div className="modal fade" id="confirm-delete" tabIndex="-1" role="dialog">
>>>>>>> Added start, stop and delete volume actions with proper functionality.
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title"> Delete Volume?
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </h4>
              </div>
              <div className="modal-body">
                <strong> Do you really wish to delete this volume? This action cannot be undone!</strong>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                <a className="btn btn-danger btn-ok">Delete</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export function ObjectModalButton(props){
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

export function StartModalButton(props){
  let buttonState = (props.modalState=="Started") ? "disabled":""
  function handleClick(event){
    event.stopPropagation();
    let promise = props.gluster_api.post("/v1/volumes/"+props.modalName+"/start")
    promise
    .then(function(result){
          console.log("Volume Started successfully");
          props.refresh()
        })
    .catch(function(reason){
          console.warn("Volume didn't start because: ", reason);
        })
  }
  return (
    <button className="btn btn-find btn-link start-modal-btn" title="Start Volume" type="button" disabled={buttonState} onClick={handleClick}>
      <span className="pficon pficon-lg pficon-on"></span>
    </button>
  );
}

export function StopModalButton(props){
  let buttonState = (props.modalState=="Stopped"  || props.modalState=="Created") ? "disabled":""
  function handleClick(event){
    event.stopPropagation();
    let promise = props.gluster_api.post("/v1/volumes/"+props.modalName+"/stop")
    promise
    .then(function(result){
          console.log("Volume Stopped successfully");
          props.refresh()
        })
    .catch(function(reason){
          console.warn("Volume didn't stop because: ", reason);
        })
  }
  return (
    <button className="btn btn-find btn-link stop-modal-btn" title="Stop Volume" type="button" disabled={buttonState} onClick={handleClick}>
      <span className="pficon pficon-lg pficon-off"></span>
    </button>
  );
}

export function DeleteModalButton(props){
  function handleClick(event){
    event.stopPropagation();
    var confirmDelete = $('#confirm-delete')
    confirmDelete.modal({show:true,keyboard:true});
    confirmDelete.on('click', '.btn-ok', function(e) {
      if(props.modalState === "Stopped") {
        const deleteVolume = "/v1/volumes/"+props.modalName
        let promise = props.gluster_api.request({body: " ", method: 'DELETE', path: deleteVolume })
        .then(function(result) {
              props.refresh()
              confirmDelete.modal('hide')
              console.log("Volume Deleted successfully!");
        })
        .catch(function(reason) {
              console.log("Volume Not Deleted successfully because: ", reason);
        });
      } else {
        const deleteVolume = "/v1/volumes/"+props.modalName
        let promise = props.gluster_api.post("/v1/volumes/"+props.modalName+"/stop")
        promise
        .then(function(result){
              console.log("Volume Stopped successfully");
              props.refresh()
              let promise1 = props.gluster_api.request({body: " ", method: 'DELETE', path: deleteVolume })
              promise1
              .then(function(result1) {
                    props.refresh()
                    confirmDelete.modal('hide')
                    console.log("Volume Deleted successfully!");
              })
              .catch(function(reason1) {
                    console.log("Volume Not Deleted successfully because: ", reason1);
              });
            })
        .catch(function(reason){
              console.warn("Volume didn't stop because: ", reason);
            })
      }
    });
  }
  return (
    <button className="btn btn-find btn-link delete-modal-btn" title="Delete Volume" type="button" onClick={handleClick}>
      <span className="pficon pficon-lg pficon-delete"></span>
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
