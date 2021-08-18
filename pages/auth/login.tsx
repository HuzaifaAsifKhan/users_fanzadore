/* eslint-disable no-console */
/* eslint-disable react/no-unescaped-entities */
import {
  Form,
  Checkbox,
  Input,
  Button,
  Row,
  Col,
  // Divider,
  Layout,
  Switch
} from 'antd';
import { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import Head from 'next/head';
import {
  login, loginPerformer, loginSuccess
} from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { authService, performerService, userService } from '@services/index';
import Link from 'next/link';
import './index.less';
import { IUIConfig } from 'src/interfaces';
import Router from 'next/router';
// import { TwitterOutlined } from '@ant-design/icons';
import Loader from '@components/common/base/loader';

interface IProps {
  loginAuth: any;
  login: Function;
  loginPerformer: Function;
  updateCurrentUser: Function;
  loginSuccess: Function;
  loginSocial: Function;
  ui: IUIConfig
}

const { Content } = Layout;

class Login extends PureComponent<IProps> {
  static authenticate: boolean = false;

  state = {
    loginUsername: false,
    loginAs: 'user',
    isLoading: false
  }

  getQueryParamsAndNavigate() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('loginAs');
  }

  async componentDidMount() {
    this.getQueryParamsAndNavigate() === 'user' ? this.handleSwitch('user') : this.handleSwitch('performer');
    this.redirectLogin();
  }

  onSwitchType(val: boolean) {
    this.setState({
      loginUsername: val
    });
  }

  async handleLogin(values: any) {
    const { loginPerformer: handleLoginPerformer, login: handleLogin } = this.props;
    const { loginUsername, loginAs } = this.state;
    const data = values;
    data.loginUsername = loginUsername;
    localStorage.setItem('rememberMe', data.remember ? 'true' : 'false');
    if (loginAs != 'user') {
      this.getQueryParamsAndNavigate() === 'newPerformer' ? data.loginAs = 'newPerformer' : data.loginAs = 'performer';
      return handleLoginPerformer(data);
    }
    return handleLogin(data);
  }

  async redirectLogin() {
    const { loginSuccess: handleLogin, updateCurrentUser: handleUpdateUser } = this.props;
    const token = authService.getToken();
    const role = authService.getUserRole();
    const rememberMe = process.browser && localStorage.getItem('rememberMe');
    if (!token || token === 'null' || !rememberMe) {
      return;
    }
    authService.setToken(token, role || 'user');
    let user = null;
    try {
      if (role === 'performer') {
        user = await performerService.me({
          Authorization: token
        });
      } else {
        user = await userService.me({
          Authorization: token
        });
      }
      // TODO - check permission
      if (!user.data._id) {
        return;
      }
      handleLogin();
      handleUpdateUser(user.data);
      Router.push('/home');
    } catch (e) {
      console.log(await e);
    }
  }

  handleSwitch(value: any) {
    this.setState({ loginAs: value });
  }

  render() {
    const { ui } = this.props;
    const {
      loginAs, isLoading, loginUsername
    } = this.state;

    return (
      <>
        <Head>
          <title>
            {ui?.siteName}
            {' '}
            | Login
          </title>
        </Head>
        <Layout>
          <Content>
            <div className="main-container">
              <div className="login-box">
                <Row>
                  {/* <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    xl={12}
                    className="login-content left"
                    style={ui.loginPlaceholderImage ? { backgroundImage: `url(${ui.loginPlaceholderImage})` } : null}
                  /> */}
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    xl={12}
                    className="login-content right"
                  >
                    <div className="switch-btn">
                      <button type="button" className={loginAs === 'user' ? 'active' : ''} onClick={this.handleSwitch.bind(this, 'user')} style={{ marginRight: '20px' }}>FAN LOGIN</button>
                      <button type="button" className={loginAs === 'performer' ? 'active' : ''} onClick={this.handleSwitch.bind(this, 'performer')}>CREATOR LOGIN</button>
                    </div>
                    <div className="login_form_box">
                    <div className="title">
                      <h3>
                        {loginAs === 'user' ? 'FAN LOGIN' : 'CREATOR LOGIN'}
                      </h3>
                    </div>
                    {/* {loginAs === 'user' && (
                      <div className="social-login">
                        <button type="button" onClick={this.loginTwitter.bind(this)} className="twitter-button">
                          <TwitterOutlined />
                          {' '}
                          Signup/Login with Twitter
                        </button>
                      </div>
                    )} */}
                    {/* <Divider>Or</Divider> */}
                    <div className="login-form">
                      <Form
                        name={`normal_login${loginAs === 'user' ? '1' : 0}`}
                        className="login-form"
                        initialValues={{ remember: true }}
                        onFinish={this.handleLogin.bind(this)}
                      >
                        <div className="switch-grp">
                          <Switch checkedChildren="Username" unCheckedChildren="E-mail" defaultChecked={loginUsername} onChange={this.onSwitchType.bind(this)} />
                        </div>

                        {!loginUsername && (
                        <Form.Item
                          name="email"
                          hasFeedback
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            { required: true, message: 'Please enter your email address!' },
                            { type: 'email', message: 'Invalid email address' }
                          ]}
                        >
                          <Input placeholder="Email address" />
                        </Form.Item>
                        )}

                        {loginUsername && (
                        <Form.Item
                          name="username"
                          hasFeedback
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[{ required: true, message: 'Please enter your username!' }]}
                        >
                          <Input placeholder="Username" />
                        </Form.Item>
                        )}

                        <Form.Item
                          name="password"
                          hasFeedback
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[
                            { required: true, message: 'Please enter your password!' },
                            { min: 6, message: 'Password is at least 6 characters' }
                          ]}
                        >
                          <Input type="password" placeholder="Password" />
                        </Form.Item>
                        <Form.Item>
                          <Row>
                            <Col span={12}>
                              <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                              </Form.Item>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                              <Link
                                href={{
                                  pathname: '/auth/forgot-password',
                                  query: { type: loginAs !== 'user' ? 'performer' : 'user' }
                                }}
                              >
                                <a className="login-form-forgot">Forgot password?</a>
                              </Link>
                            </Col>
                          </Row>
                        </Form.Item>
                        <Form.Item style={{ textAlign: 'center' }}>
                          <Button type="primary" htmlType="submit" className="login-form-button">
                            LOGIN
                          </Button>
                          <p>
                            Don't have an account yet ?
                            <Link
                              href={
                                loginAs !== 'user' ? { pathname: '/auth/register', query: { registerAs: 'performer' }} : { pathname: '/auth/register' }
                              }
                            >
                              <a> Create an account</a>
                            </Link>
                          </p>
                        </Form.Item>
                      </Form>
                    </div>
                    </div>
                    </Col>
                </Row>
                {isLoading && <Loader />}
              </div>
            </div>
          </Content>
        </Layout>
      </>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui }
});

const mapDispatchToProps = {
  login, loginPerformer, loginSuccess, updateCurrentUser
};
export default connect(mapStatesToProps, mapDispatchToProps)(Login) as any;
