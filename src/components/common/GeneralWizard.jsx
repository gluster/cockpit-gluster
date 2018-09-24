import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Wizard, Icon, Button } from 'patternfly-react'

class GeneralWizard extends Component {
  constructor(props){
    super(props)
    this.getChildren = () => {
      this.children = [];
      if (Array.isArray(this.props.children)){
        this.children = this.props.children;
      }
      else{
        this.children =  [this.props.children]
      }
    }
  }
  render(){
    this.getChildren();
    return (
    <Wizard show={this.props.show} title={this.props.title}>
      <Wizard.Header
        onClose={this.props.onClose}
        title={this.children[this.props.activeStepIndex].props.stepName}
      />
      <WizSteps
        activeStep={this.props.activeStepIndex}
        handleStepChange={this.props.handleStepChange}
        children={this.children}/>
      <Wizard.Body>
      {this.children[this.props.activeStepIndex]}
      </Wizard.Body>
      <WizFooter
        onNext={this.props.onNext}
        onBack={this.props.onBack}
        onCancel={this.props.onCancel}
        onFinal={this.props.onFinal}
        onClose={this.props.onClose}
        stepCount={this.children.length}
        activeStepIndex={this.props.activeStepIndex}
        finalText={this.props.finalText}
        isNextDisabled={this.props.isNextDisabled}

      />
    </Wizard>
    );
  }
}

const WizSteps = ({children, activeStep, handleStepChange}) => {
  var steps = [];
  for (const [index, child] of children.entries()){
    steps.push(
      <Wizard.Step
      title={child.props.stepName}
      onClick={handleStepChange}
      stepIndex={index}
      step={index}
      label={(index+1).toString()}
      activeStep={activeStep}
      key={index}
      />
    );
  }
  return(
    <Wizard.Steps steps={steps}></Wizard.Steps>
  );
}

const WizFooter = ({
  onBack,
  onNext,
  onCancel,
  onClose,
  onFinal,
  stepCount,
  activeStepIndex,
  cancelText,
  backText,
  nextText,
  finalText,
  isBackDisabled,
  isNextDisabled
}) => {
  const isFinalStep = activeStepIndex == stepCount - 1;
  const isFirstStep = activeStepIndex == 0;
  return(
    <Wizard.Footer>
      <Button bsStyle="default" className="btn-cancel" onClick={onCancel}>
        {cancelText}
      </Button>
      {
        !isFirstStep &&
          <Button bsStyle="default" onClick={onBack}>
            <Icon type="fa" name="angle-left" />
            {backText}
          </Button>
      }
      <Button
        bsStyle="primary"
        onClick={isFinalStep ? onFinal : onNext}
        disabled={isNextDisabled}
      >
        {isFinalStep ?
          (finalText)
          : (
            <React.Fragment>
              {nextText}
              <Icon type="fa" name="angle-right" />
            </React.Fragment>
            )
        }
</Button>
    </Wizard.Footer>
  )
}

WizFooter.propTypes = {
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onFinal: PropTypes.func.isRequired,
  stepCount: PropTypes.number.isRequired,
  activeStepIndex: PropTypes.number.isRequired,
  cancelText: PropTypes.string,
  backText: PropTypes.string,
  nextText: PropTypes.string,
  finalText: PropTypes.string,
  isBackDisabled: PropTypes.bool,
  isNextDisabled: PropTypes.bool
}

WizFooter.defaultProps = {
  cancelText: "Cancel",
  backText: "Back",
  nextText: "Next",
  finalText: "Finish",
  isBackDisabled: false,
  isNextDisabled: false
}
GeneralWizard.propTypes = {
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onFinal: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  isBackDisabled: PropTypes.bool.isRequired,
  isNextDisabled: PropTypes.bool.isRequired,
  activeStepIndex: PropTypes.number.isRequired,
  title: PropTypes.string,
  cancelText: PropTypes.string,
  backText: PropTypes.string,
  nextText: PropTypes.string,
  finalText: PropTypes.string,
}

GeneralWizard.defaultProps = {
  cancelText: "Cancel",
  backText: "Back",
  nextText: "Next",
  finalText: "Finish",
  isBackDisabled: false,
  isNextDisabled: false
}


export default GeneralWizard;
