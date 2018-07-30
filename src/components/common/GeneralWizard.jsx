import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Wizard } from 'patternfly-react'

class GeneralWizard extends Component {
  constructor(props){
    super(props)
  }

  render(){
    // <Wizard.Header/>

    return (
    <Wizard show={this.props.show}>
      <Wizard.Body>
      {this.props.children}
      </Wizard.Body>
      <Wizard.Footer
        onBack={this.props.onBack}
        onCancel={this.props.onCancel}
        onFinal={this.props.onFinal}
        stepCount={this.props.children.length}
        activeStepIndex={this.props.activeStepIndex}
        finalText={this.props.finalText}
        isBackDisabled={this.props.isBackDisabled}
        isNextDisabled={this.props.isNextDisabled}
      />
    </Wizard>
    );
  }
}

const WizardFooter = ({
  onBack,
  onCancel,
  onFinal,
  stepCount,
  activeStepIndex,
  cancelText,
  backText,
  nextText,
  finalText,
  isBackDisabled,
  isNextDisabled,
}) => {
  const isFinalStep = activeStepIndex == stepCount - 1;
  return(
    <Wizard.Footer>
      <Button bsStyle="default"
        className="btn-cancel"
        onClick={onCancel}>
        {cancelText}
      </Button>
      <Button
        bsStyle="default"
        onClick={onBackClick}
        disabled={isBackDisabled}>
        <Icon type="fa" name="angle-left" />
        {backText}
      </Button>
      <Button
        bsStyle="primary"
        onClick={isFinalStep ? onCancel : onNext}
        disabled={isNextDisabled}>
        {isFinalStep ? (
          closeText
        ) : (
          <React.Fragment>
            {nextText}
            <Icon type="fa" name="angle-right" />
          </React.Fragment>
        )}
      </Button>
    </Wizard.Footer>
  )
}

WizardFooter.propTypes = {
  onBack: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
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

WizardFooter.defaultProps = {
  cancelText: "Cancel",
  backText: "Back",
  nextText: "Next",
  finalText: "Finish",
  isBackDisabled: false,
  isNextDisabled: false
}


export default GeneralWizard;
