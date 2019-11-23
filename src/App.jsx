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
import AWS from "aws-sdk";
import { Auth } from "aws-amplify";
import Routes from "./routes";
import TopNav from "./components/TopNav";

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

  state = {
    loading: true,
    unauthorizedAlertOpen: false,
    drawerOpen: false,
    mobileDrawerOpen: false,
    isLoggedIn: false,
    profile: {}
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

  async handleSignOut() {
    try {
      await Auth.signOut();
      this.setState({ isLoggedIn: false });
    } catch (e) {
      console.log("error signing out");
      console.error(e);
    }
  }

  render() {
    const { classes, authData, authState } = this.props;
    const { loading, unauthorizedAlertOpen } = this.state;

    const childProps = {
      isLoggedIn: this.state.isLoggedIn,
      onUserSignIn: this.handleSignIn,
      handleUserSignOut: this.handleSignOut
    };

    return (
      <ConnectedRouter history={this.props.history}>
        <div className={classes.root}>
          <main className={classes.content}>
            <TopNav childProps={childProps} />
            <div className={classes.toolbar} />
            <Routes childProps={childProps} />
          </main>
        </div>
      </ConnectedRouter>
    );
  }
}

export default withStyles(styles)(App);
