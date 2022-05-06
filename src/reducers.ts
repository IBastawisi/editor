import runtime from '@curvenote/runtime';
import * as sidenotes from 'sidenotes';
import { combineReducers } from 'redux';
import { State, EditorActions, Reducer, reducer } from '@curvenote/editor/dist/src';

const combinedReducers: Reducer = combineReducers({
  editor: reducer,
  runtime: runtime.reducer,
  sidenotes: sidenotes.reducer,
}) as Reducer;

function rootReducer(state: State | undefined, action: EditorActions): State {
  return combinedReducers(state, action);
}

export default rootReducer;