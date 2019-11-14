import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { createBrowserHistory } from "history";
import { connectRouter } from "connected-react-router";
import { combineReducers } from "redux";

// First party
import App from "./App";

export const history = createBrowserHistory();

const createRootReducer = history =>
  combineReducers({
    router: connectRouter(history)
  });

const store = createStore(createRootReducer(history), {});

const renderApp = () => {
  render(
    <Provider store={store}>
      <App history={history} />
    </Provider>,
    document.getElementById("root")
  );
};

if (process.env.NODE_ENV !== "production" && module.hot) {
  module.hot.accept("./App", renderApp);
}

renderApp();
