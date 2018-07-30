import React, { Component } from 'react'
import { Wizard } from 'patternfly-react'
import HostsStep from './WizardSteps/HostsStep'
import { test } from './ExpandClusterWizard'


class GlusterWizard extends Component {
  constructor(props){
    super(props)
    this.state = {
      show: true,
      loading: false,
      activeStepIndex: 2
    }
    test();
    console.log("wizard constructor")
    this.HostsStep = React.createRef();
    this.wizardSteps = [{
      title: "Hosts",
      render: () => {console.log(this.title);return <div><h1>{this.title}</h1></div>}
    },
    {
      title: "Blah 2",
      render: () => {return <div><h1>Hello world 2</h1></div>}
    },
      {
      title: "blah 1",
      render: () => <HostsStep title={"blash"} ref={this.HostsStep}/>
    },
    HostsStep
    ]
    this.title = "Expand Cluster"


    this.close = () => {
      this.setState({ show: false});
    }
    this.open = () => {
      this.setState({ show: true});
    }
    this.exit = () =>{
      //TODO: add confirmation
      this.close();
    }
    this.toggle = () => {
      this.setState((prevState)=>{
        return { show: !prevState.show }
      });
    }
    this.handleStepChange = (index) => {
      this.setState({activeStepIndex: index})
    }
  }
//require onExit to reset the show prop
  render(){
    if (this.HostsStep.current){
      console.log("Title:",this.HostsStep.current.title)
    }

    return(
      <Wizard show={this.state.show} onHide={this.close} onExited={this.exit}>
           <Wizard.Header onClose={this.close} title={this.title} />
           <Wizard.Body>
             <Wizard.Steps
               steps=[<Wizard.Step
                       stepIndex={},
                       label={local.stepnum},
                       step={local.stepnum},
                       activeStep={local.activeStep}
                       title={local.steptitle}
                       onClick={this.handleStepChange}
                     />]
           ))}
         />
         <Wizard.Row>
           <Wizard.Main>
             <Wizard.Contents
               stepIndex={activeStepIndex}
               activeStepIndex={activeStepIndex}
             >
               {renderedStep}
             </Wizard.Contents>
           </Wizard.Main>
 </Wizard.Row>
           </Wizard.Body>
           <Wizard.Footer>
             <Button bsStyle="default" className="btn-cancel" onClick={onHideClick}>
               {cancelText}
             </Button>
             <Button
               bsStyle="default"
               onClick={onBackClick}
               disabled={prevStepUnreachable}
             >
               <Icon type="fa" name="angle-left" />
               {backText}
             </Button>
             <Button
               bsStyle="primary"
               onClick={onFinalStep ? onHideClick : onNextClick}
               disabled={nextStepUnreachable}
               ref={nextButtonRef}
             >
               {onFinalStep ? (
                 closeText
               ) : (
                 <React.Fragment>
                   {nextText}
                   <Icon type="fa" name="angle-right" />
                 </React.Fragment>
               )}
             </Button>
           </Wizard.Footer>

     </Wizard>
    );
  }
}

const WizardFooter = ({steps, activeStepIndex, onBack, onHide, onNext, isNextDisabled}) => {

}

export default GlusterWizard
