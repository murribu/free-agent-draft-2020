import React from "react";

import AccountCircle from "@material-ui/icons/AccountCircle";
import AppBar from "@material-ui/core/AppBar";
import { Auth } from "aws-amplify";
import Badge from "@material-ui/core/Badge";
import IconButton from "@material-ui/core/IconButton";
import { Link } from "react-router-dom";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import PropTypes from "prop-types";
import Toolbar from "@material-ui/core/Toolbar";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

class TopNav extends React.Component {
  static propTypes() {
    return {
      classes: PropTypes.object.isRequired,
      authData: PropTypes.object.isRequired,
      authState: PropTypes.string.isRequired
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      menuAnchorEl: null
    };
  }

  handleMenu(event) {
    this.setState({ menuAnchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ menuAnchorEl: null });
  }

  signOut() {
    Auth.signOut();
  }

  renderLinks() {
    const { classes } = this.props;
    const pathName = this.props.history.location.pathname;
    const links = ["about"];
    return (
      <div className={classes.linksContainer}>
        {links.map(link => (
          <Link
            to={`/${link}`}
            key={link}
            className={
              pathName.match(link) !== null
                ? classes.highlightedLink
                : classes.link
            }
          >
            {link}
          </Link>
        ))}
      </div>
    );
  }

  render() {
    const { classes, authData, authState } = this.props;
    const { menuAnchorEl } = this.state;
    const open = Boolean(menuAnchorEl);

    return (
      <AppBar position="fixed" className={classes.appBar} color="default">
        <Toolbar disableGutters={true} className={classes.toolBar}>
          <div className={classes.toolBarItems}>
            <Link to="/" className={classes.link}>
              Free Agent Draft 2020
            </Link>
            {this.renderLinks()}
          </div>
          {authState === "signedIn" && (
            <div className={classes.navBarRight}>
              <Link to="/queue">
                <div className={classes.queueContainer}>
                  <span className={classes.queueText}>Queue</span>
                  <IconButton color="inherit">
                    <Badge badgeContent={4} color="primary" />
                  </IconButton>
                </div>
              </Link>
              {authData.username}
              <IconButton
                aria-owns={open ? "menu-appbar" : undefined}
                aria-haspopup="true"
                onClick={event => this.handleMenu(event)}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={menuAnchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right"
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right"
                }}
                open={open}
                onClose={event => this.handleClose(event)}
              >
                <MenuItem onClick={event => this.handleClose(event)}>
                  <Link to="/profile">Profile</Link>
                </MenuItem>
                <MenuItem onClick={this.signOut}>Sign Out</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

const styles = theme => ({
  appBar: {
    // zIndex: theme.zIndex.drawer + 1
  },
  highlightedLink: {
    color: "#555",
    textDecoration: "none",
    fontWeight: "bold",
    marginLeft: 25,
    borderBottom: "3px solid #1aa3ff"
  },
  linksContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 100
  },
  link: {
    color: "#555",
    textDecoration: "none",
    fontWeight: "bold",
    marginLeft: 25,
    borderBottom: "3px solid transparent"
  },
  logoStyle: {
    height: "20px"
  },
  navBarRight: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifySelf: "flex-end"
  },
  queueContainer: {
    marginRight: 20,
    display: "flex",
    flexDirection: "row"
  },
  toolBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 20
  },
  toolBarItems: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  queueText: {
    color: "lightGrey",
    fontWeight: "bold",
    marginRight: 5
  }
});

export default withRouter(withStyles(styles)(TopNav));
