import React, { Component } from 'react'

class Dropdown extends Component{
  constructor(props){
    super(props)
    this.state ={
      activeItem : 0,
      changed:false
    }
  }

  onClick = (value,index) => {
    this.setState((prevState)=>{
      return {activeItem:index, changed:true}
    });
    this.props.onSelect(value,index);
  }
  render(){
    let options = this.props.typeOptions;
    let menuItems = [];
    let selectedName = options[this.state.activeItem].name;

    for(let index = 0; index < options.length; index++){
      let option = options[index]
      if (option.value == this.props.value){
        selectedName = option.name
      }
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
            <span className="pull-left">{selectedName}</span>
            <span className="caret" />
          </button>
          <ul className="dropdown-menu">{menuItems}</ul>
        </div>
    );
  }
}
export default Dropdown;
