import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Header from './components/header';
import CategoryItems from './components/Category/CategoryItems';

import AuthModule from './Auth';
import ProductHome from './components/Product/ProductHome';
import { updateAuth } from './Auth/actionCreators';
import CartHome from './components/Cart/CartHome';
import OrderPlaced from './components/order-placed';
import { isNil } from 'lodash';
import { saveTokenInStorage } from './utils/storage';

const DefaultLayout = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={matchProps => (
      <div>
        <Header />
        <Component {...matchProps} />
      </div>
  )}
  />
);

class Routes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginReady: false,
    };
    // Remove when real signout component is ready
    this.handleLogout = this.handleLogout.bind(this);
  }

  async componentDidMount() {
    try {
      this.resetAndStartAuthentication();
      Auth.currentSession().then(async (response) => {
        const data = await Auth.currentAuthenticatedUser();
        const userData = await Auth.currentUserInfo();
        saveTokenInStorage(data);

        this.props.updateAuth({
          isAuthenticating: false,
          isAuthenticated: true,
          userData,
          identityId: data,
        });
      }).catch((error) => {
        this.finishAuthentication();
      });
    } catch (e) {
      // to do
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.loginReady && this.props.isAuthenticating && !nextProps.isAuthenticating) {
      this.setState({ loginReady: true });
    }
  }

  resetInitialState = () => {
    this.props.updateAuth({
      isAuthenticating: false,
      isAuthenticated: false,
      identityId: null,
      userData: null,
    });
  };

  resetAndStartAuthentication = () => {
    this.props.updateAuth({
      isAuthenticating: true,
      isAuthenticated: false,
      identityId: null,
      userData: null,
    });
  };

  finishAuthentication = () => {
    this.props.updateAuth({
      isAuthenticating: false,
    });
  };


  // Remove when real signout component is ready
  async handleLogout() {
    await Auth.signOut();
    this.resetInitialState();
  }

  render() {
    return (
      <Router>
        <div className="root-container">
          {
          !this.props.isAuthenticated && this.state.loginReady ?
            <Route render={() => <AuthModule />} />
          :
          (this.state.loginReady ?
            <React.Fragment>
              <DefaultLayout exact path="/" component={ProductHome} />
              <DefaultLayout exact path="/category/:category" component={CategoryItems} />
              <DefaultLayout exact path="/category/" component={CategoryItems} />
              <DefaultLayout exact path="/cart" component={CartHome} />
              <DefaultLayout exact path="/order-placed" component={OrderPlaced} />
            </React.Fragment>
            :
            null
          )
        }
        </div>
      </Router>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  isAuthenticating: state.auth.isAuthenticating,
  identityId: state.auth.identityId,
});

const mapDispatchToProps = dispatch => ({
  updateAuth: bindActionCreators(updateAuth, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Routes);
