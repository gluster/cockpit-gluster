import React, { Component } from 'react'

class Dropdown extends Component{
  constructor(props){
    super(props)
    this.state ={
      activeItem : 0,
    }
  }

  onClick = (value,index) => {
    this.setState((prevState)=>{
      return {activeItem:index}
    });
    this.props.onSelect(value,index);
  }
  render(){
    let options = this.props.typeOptions;
    let menuItems = [];

    for(let index = 0; index < options.length; index++){
      let option = options[index]
      menuItems.push(
        <li value={option.value} key={option.value} onClick={(event) => {this.onClick(option.value,index)}}>
            <a>
              {option.name}
            </a>
        </li>
      );
    }

    return(
        <div className="btn-group bootstrap-select dropdown form-control">
          <button className="btn btn-default dropdown-toggle" type="button"
            data-toggle="dropdown" aria-expanded="false">
            <span className="pull-left">{options[this.state.activeItem]["name"]}</span>
            <span className="caret" />
          </button>
          <ul className="dropdown-menu">{menuItems}</ul>
        </div>
    );
  }
}
export default Dropdown;
