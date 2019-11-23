import React from "react";

import AccountCircle from "@material-ui/icons/AccountCircle";
import { Auth } from "aws-amplify";
import { Link } from "react-router-dom";
import Card from "@material-ui/core/Card";
import Box from "@material-ui/core/Box";
import {
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Button,
  IconButton,
  Badge,
  Grid
} from "@material-ui/core";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { makeStyles, withStyles } from "@material-ui/core/styles";
function Home(props) {
  const useStyles = makeStyles(theme => ({
    centered: {
      textAlign: "center"
    }
  }));
  const classes = useStyles();
  return (
    <Grid container>
      <Grid item xs={3} />
      <Grid item xs={6}>
        <Box p={2}>
          <Box>
            <h1 className={classes.centered}>Players</h1>
          </Box>
          <Grid container>
            <Grid className={classes.centered} item xs={3}>
              Player
            </Grid>
            <Grid className={classes.centered} item xs={3}>
              Proj years
            </Grid>
            <Grid className={classes.centered} item xs={3}>
              Proj amount
            </Grid>
            <Grid className={classes.centered} item xs={3}>
              over/under
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Home;
