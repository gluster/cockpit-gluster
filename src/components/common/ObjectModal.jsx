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

function InlineAlert(props){
  return(
    <div className="alert alert-warning">
      <span className="pficon pficon-warning-triangle-o"></span>
      {props.message}
    </div>

  )
}
