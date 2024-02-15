import { combineReducers, applyMiddleware, createStore } from "redux";
// import { legacy_createStore as createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import thunk from "redux-thunk";
import logger from "redux-logger";
import { userReducer } from "./reducers/userReducer";
import { emailReducer } from "./reducers/emailReducer";

const allReducers = combineReducers({
  userReducer,
  emailReducer,
});


export const store = createStore(
  allReducers,
  composeWithDevTools(
    applyMiddleware(thunk, logger),
    
  )
);


