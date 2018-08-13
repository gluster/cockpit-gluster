# Code Guidelines
Please raise an issue if there is a problem with one of these:

- Follow React Patterns
- Never modify state directly, use setState(newState) or setState(callback(prevState)=>newState) instead.
- Every reference to state outside of the render() and constructor(props) should be inside a setState callback.
- Do not modify props variables from inside the receiving component.
- Try to create PropTypes entries for your components
- If the behaviour your code is not obvious, leave a comment
- Do not initialize state with props unless you hard copy them.

## Variable naming
- camelCase
