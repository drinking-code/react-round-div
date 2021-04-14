<header>
  <h1>Better rounded corners</h1>
  <i>for HTML divs in React.js</i>
</header>
<br/><br/>
`react-round-div` makes your rounded rectangles look smoother for a more pleasant feel. With a simple and easy integration into your code you have to do almost nothing to up the style of your project.

Here is a very clear demonstration of these smooth corners:

![Figure showing that these corners are very much hunky-dory](img/compare.svg)

## Installation

```shell
npm i react-round-div
```

## Usage
Simply import the package and replace any divs with rounded corners (`border-radius`) that you want to improve. `react-round-div` will handle the rest.  
```jsx  
import RoundDiv from 'react-round-div';

const App = () => {
    return (
        <RoundDiv>
            <p>Hello smooth corners!</p>
        </RoundDiv>
    )
};

export default App;
```
`react-round-div` will clip the `border-radius` of it is too large to prevent artifacts from appearing. You can turn this off by passing `clip={false}`.


## Caveats
This package is still in the starting blocks, so for now only single colored backgrounds and borders are supported.  
There is support to come for gradients and image backgrounds, gradient borders, and perhaps proper `backdrop-filter` support.
