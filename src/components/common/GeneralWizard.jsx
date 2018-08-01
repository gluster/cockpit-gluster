import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Wizard, Icon, Button } from 'patternfly-react'

class GeneralWizard extends Component {
  constructor(props){
    super(props)
  }

  render(){
    const stepCount = Array.isArray(this.props.children) ? this.props.children.length : 1;
    return (
    <Wizard show={this.props.show} title={this.props.title}>
      <Wizard.Header
        onClose={this.props.onClose}
        title={this.props.title}
      />
      <Wizard.Body>
      {this.props.children[this.props.activeStepIndex]}
      </Wizard.Body>
      <WizFooter
        onNext={this.props.onNext}
        onBack={this.props.onBack}
        onCancel={this.props.onCancel}
        onFinal={this.props.onFinal}
        onClose={this.props.onClose}
        stepCount={stepCount}
        activeStepIndex={this.props.activeStepIndex}

      />
    </Wizard>
    );
  }
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
  onCancel();
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
        onClick={isFinalStep ? onClose : onNext}
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


export default GeneralWizard;
