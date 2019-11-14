import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { Greetings, Authenticator } from "aws-amplify-react";

const ProtectedRoute = ({ render: C, props: childProps, ...rest }) => (
  <Route
    {...rest}
    render={rProps =>
      childProps.isLoggedIn ? (
        <C {...rProps} {...childProps} />
      ) : (
        <Redirect
          to={`/auth?redirect=${rProps.location.pathname}${
            rProps.location.search
          }`}
        />
      )
    }
  />
);

const AuthRoute = ({ render: C, props: childProps, ...rest }) => {
  return childProps.isLoggedIn ? (
    <Route
      path="/auth"
      component={({ location }) => {
        return (
          <Redirect
            to={{
              pathname: `${
                location.search.substring(1).split("=").length > 1
                  ? location.search.substring(1).split("=")[1]
                  : `/`
              }`
            }}
          />
        );
      }}
    />
  ) : (
    <Authenticator
      onStateChange={childProps.onUserSignIn}
      hide={[Greetings]}
      usernameAttributes="email"
      signUpConfig={{
        hiddenDefaults: ["phone_number"]
      }}
    />
  );
};

const ProppedRoute = ({ render: C, props: childProps, ...rest }) => (
  <Route {...rest} render={rProps => <C {...rProps} {...childProps} />} />
);

const Home = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "35vh"
    }}
  >
    Free Agent Draft 2020
  </div>
);

const Secret = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "35vh"
    }}
  >
    Secret
  </div>
);

const NoMatch = () => <h1>404</h1>;

const Routes = ({ childProps }) => {
  return (
    <Switch>
      <ProppedRoute exact path="/" render={Home} props={childProps} />
      <ProtectedRoute exact path="/secret" render={Secret} props={childProps} />
      <AuthRoute exact path="/auth" props={childProps} />
      <Route component={NoMatch} />
    </Switch>
  );
};

export default Routes;
