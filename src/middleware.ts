import runtime from '@curvenote/runtime';
import thunkMiddleware from 'redux-thunk';
import { middleware } from '@curvenote/editor/dist/src';

const middlewareList = [
  thunkMiddleware,
  ...middleware,
  runtime.triggerEvaluate,
  runtime.dangerousEvaluatation,
];

export default middlewareList;