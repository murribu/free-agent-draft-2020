import React, { Component } from "react";
import { ConnectedRouter } from "connected-react-router";
import {
  ConfirmSignIn,
  RequireNewPassword,
  ForgotPassword,
  TOTPSetup,
  Loading,
  withAuthenticator,
  SignIn,
  SignUp
} from "aws-amplify-react";
import Amplify from "aws-amplify";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Alert from "./components/Alert";
import AWS from "aws-sdk";
import { Auth } from "aws-amplify";
import Routes from "./routes";

import { default as config } from "./config";

Amplify.configure({
  Auth: {
    identityPoolId: config.aws.identitypoolid,
    region: config.aws.cognitoregion,
    userPoolId: config.aws.userpoolid,
    userPoolWebClientId: config.aws.webclientid
  },
  API: {
    aws_appsync_graphqlEndpoint: config.aws.apiurl,
    aws_appsync_region: "us-east-1",
    aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS"
  },
  aws_appsync_graphqlEndpoint: config.aws.apiurl,
  aws_appsync_region: "us-east-1",
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS"
});

const styles = makeStyles({
  bgBlack: {
    background: "#2F3137"
  },
  bgGrayDarkest: {
    background: "#363940"
  }
});

const customAuthComponents = [
  <SignIn />,
  <ConfirmSignIn />,
  <SignUp />,
  <RequireNewPassword />,
  <ForgotPassword />,
  <TOTPSetup />,
  <Loading />
];

class App extends Component {
  groups = [];
  Routes;

  state = {
    loading: true,
    unauthorizedAlertOpen: false,
    drawerOpen: false,
    mobileDrawerOpen: false,
    isLoggedIn: false
  };

  constructor(props) {
    super(props);
    this.handleSignIn = this.handleSignIn.bind(this);
  }

  handleSignIn(e) {
    if (e === "signedIn") {
      this.setState({ isLoggedIn: true });
    } else {
      this.setState({ isLoggedIn: false });
    }
  }

  async componentDidMount() {
    // const { authData } = this.props;
    // await this.authAWS(authData);
    this.setState({
      loading: false
    });
  }

  async signOut() {
    await Auth.signOut();
  }

  render() {
    const { classes, authData, authState } = this.props;
    const { loading, unauthorizedAlertOpen } = this.state;

    const childProps = {
      isLoggedIn: this.state.isLoggedIn,
      onUserSignIn: this.handleSignIn
    };

    return (
      <ConnectedRouter history={this.props.history}>
        <div className={classes.root}>
          {loading && (
            <div className={classes.loadingContainer}>
              <div className={classes.loading}>
                <CircularProgress />
                <span className={classes.loadingTitle}>Authenticating...</span>
              </div>
              <Alert
                open={unauthorizedAlertOpen}
                title={<span>Error - Not Authorized</span>}
                content="Your user account is not authorized to access this application. If this is a mistake, please contact support."
                onDismiss={() => this.signOut()}
              />
            </div>
          )}
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <Routes childProps={childProps} />
          </main>
        </div>
      </ConnectedRouter>
    );
  }
}

export default withStyles(styles)(App);
