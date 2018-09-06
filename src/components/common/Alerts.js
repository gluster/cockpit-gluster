import React from 'react'

export function InlineAlert(props){
  return(
    <div className="alert alert-warning">
      <span className="pficon pficon-warning-triangle-o"></span>
      {props.message}
    </div>

  )
}
