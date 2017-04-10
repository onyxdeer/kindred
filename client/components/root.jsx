import React, {Component} from 'react';
import {Provider} from 'react-redux';
import { HashRouter as Router, Route, Link, Redirect } from 'react-router-dom'; 
import { Form } from 'antd';
import App from './app.jsx';
import AboutPage from './aboutpage.jsx';
import SignUp from '../containers/login-signup/signup.jsx';
import Login from '../containers/login-signup/login.jsx';
import Video from '../containers/video/video.jsx';
import Survey from '../containers/account/survey.jsx';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Cookies from 'js-cookie';
import axios from 'axios';
import '../styles/index.css';

const SignUpForm = Form.create()(SignUp);
const LoginForm = Form.create()(Login);

const PrivateRoute = ({component, user}) => (
  <Route {...user} render={(user) => (
    authenticate(user) ? 
      React.createElement(component, user) : 
      <Redirect to='/login'/>
  )}/>
);

const checkToken = () => {
  let cookie = Cookies.getJSON();
  for (let key in cookie) {
    if (key !== 'pnctest') {
      return (axios.post('/api/tokenCheck', {
        Username: cookie[key].Username,
        Token: cookie[key].Token
      }).then((response) => {
        console.log('check token repsonse', response);
        return response.data;
      }));
    } else {
      return false;
    }
  }
};

const authenticate = (props) => {
  if (!props.user) {
    if (!checkToken()) {
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }
};

class Root extends Component {
  constructor (props) {
    super(props);
  }

  render () {
    console.log('ROOT STATE', this.props.user);
    return (
    <div className="root-div">
        <Router>
          <div className="route-div">
            <Route exact path="/" component={App} />
            <Route path="/signup" component={SignUpForm} />
            <Route path="/login" component={LoginForm} />
            <PrivateRoute path="/video" component={Video} user={this.props.user} />
            <Route path="/survey" component={Survey} />
            <Route path="/aboutus" component={AboutPage} />
          </div>
        </Router>
    </div>
    );
  } 
}

function mapStateToProps (state) {
  return {
    user: state.userReducer
  };
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Root);