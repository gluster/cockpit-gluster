
import React, { Component } from 'react'
import jwt from 'jsonwebtoken' //required claims: iss exp





class Glusterd2Management extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "peers": ""
    };
    //Binding "this" of the component to "this" of the component
    this.getPeers = this.getPeers.bind(this);
    this.gluster_api = cockpit.http("24007");

  }

  componentDidMount(){

    this.getPeers()

  }

  generateAuthHeader(){
    let secret = "629315144b8fca70c26c7f536925d97baf11de332ba1fffdbc29487d5b5c7fe4";
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
    console.log("headers", headers);
    let promise =  this.gluster_api.get("/v1/peers")
    promise
    .then(function(result){
          console.log(result);
          that.setState({"peers":result})
        })
    .catch(function(reason){
          console.log("Failed for reason: ", reason);
        })
    return promise
  }


  render(){


    return(
      <div>{this.state.peers}</div>
    )
  }

}

export default Glusterd2Management
