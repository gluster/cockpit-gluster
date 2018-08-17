import React, { Component } from 'react'
import {Grid, Form, FormGroup, FormControl, ControlLabel, HelpBlock, Checkbox} from 'patternfly-react'
import { notEmpty } from '../common/validators'
import Dropdown from '../common/Dropdown'


class ReviewStep extends Component {
  constructor(props){
    super(props)
  }

  render(){
    return JSON.stringify(this.props.glusterModel)
  }
}




export default ReviewStep
