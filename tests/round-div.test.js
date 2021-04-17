import React from 'react';
import ReactDOM from 'react-dom';
import RoundDiv from '../src/main.js';

it("renders without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<RoundDiv/>, div);
    ReactDOM.unmountComponentAtNode(div);
})

it("renders with one child without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<RoundDiv>
        <p>Hello World</p>
    </RoundDiv>, div);
    ReactDOM.unmountComponentAtNode(div);
})

it("renders with multiple children without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<RoundDiv>
        <p>Hello World</p>
        <div/>
    </RoundDiv>, div);
    ReactDOM.unmountComponentAtNode(div);
})
