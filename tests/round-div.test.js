import React from 'react';
import ReactDOM from 'react-dom';
import RoundDiv from '../src/main.js';

it("renders without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<RoundDiv/>, div);
    ReactDOM.unmountComponentAtNode(div);
})
