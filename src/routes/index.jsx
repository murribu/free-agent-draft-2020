import React from "react";
import { Route, Switch, Redirect } from "react-router";
import {
  ConfirmSignIn,
  RequireNewPassword,
  ForgotPassword,
  TOTPSetup,
  Loading,
  Authenticator,
  SignIn,
  SignUp
} from "aws-amplify-react";
import TopNav from "../components/TopNav";
import Home from "../components/Home";

const MarginTopComponent = ({ render: C, props: childProps }) => (
  <div style={{ marginTop: "65px" }}>
    <C {...childProps} />
  </div>
);

const ProtectedRoute = ({ render: C, props: childProps, ...rest }) => (
  <Route
    {...rest}
    component={rProps => {
      console.log({ rProps, childProps });
      return childProps.state.authState === "signedIn" ? (
        <div>
          <TopNav
            authData={childProps.state.authData}
            authState={childProps.state.authState}
          />
          <MarginTopComponent render={C} />
        </div>
      ) : (
        <Redirect
          to={`/auth/start?redirect=${rProps.location.pathname}${
            rProps.location.search
          }`}
        />
      );
    }}
  />
);

const AuthRoute = ({ render: C, props: childProps, ...rest }) => {
  if (childProps.state.authState === "signedIn") {
    return (
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
    );
  } else {
    if (rest.withAuthenticator) {
      return (
        <Authenticator
          hideDefault={true}
          onStateChange={childProps.onAuthStateChange}
        >
          <SignIn />
          <SignUp />
          <ConfirmSignIn />
        </Authenticator>
      );
    } else {
      return <C childProps={childProps} {...rest} />;
    }
  }
};

const PublicRoute = ({ render: C, props: childProps, ...rest }) => (
  <Route
    {...rest}
    component={rProps => (
      <div>
        <TopNav
          authData={childProps.state.authData}
          authState={childProps.state.authState}
        />
        <MarginTopComponent render={C} props={childProps} />
      </div>
    )}
  />
);

const Routes = ({ childProps }) => {
  return (
    <Switch>
      <PublicRoute exact path="/" render={Home} props={childProps} />
      <AuthRoute
        exact
        path="/auth"
        props={childProps}
        withAuthenticator={true}
      />
    </Switch>
  );
};

export default Routes;
