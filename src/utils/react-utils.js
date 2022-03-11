import {areEqualObjects} from './assert'

// prevents unnecessary re-renders:
// single value states (numbers and strings) prevent this out of the box,
// complex states (objects, arrays, etc.) don't, so here it is manually for arrays (non-nested)
export const lazySetArrayState = (setState, newState) =>
    setState(oldState => {
        if (oldState.every((val, i) => val === newState[i])) return oldState
        else return newState
    })

// prevents unnecessary re-renders:
// single value states (numbers and strings) prevent this out of the box,
// complex states (objects, arrays, etc.) don't, so here it is manually for objects (non-nested)
export const lazySetObjectsState = (setState, newState) =>
    setState(oldState => {
        if (areEqualObjects(oldState, newState)) return oldState
        else return newState
    })
