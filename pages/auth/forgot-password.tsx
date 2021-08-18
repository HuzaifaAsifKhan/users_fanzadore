/* eslint-disable react/no-did-update-set-state */
import { PureComponent } from 'react';
import {
  Form, Input, Button, Layout, Col, Row, message
} from 'antd';
import { authService } from '@services/index';
import Head from 'next/head';
import { IForgot } from 'src/interfaces';
import { connect } from 'react-redux';
import Link from 'next/link';
import './index.less';

const { Content } = Layout;

interface IForgotFormProps {
  reset: Function;
  submiting: boolean;
  countTime: number;
}

const ForgotForm = ({ reset, submiting, countTime }: IForgotFormProps) => {
  const onFinish = (values: IForgot) => {
    reset(values);
  };

  return (
    <Form name="login-form" onFinish={onFinish}>
      <Form.Item
        hasFeedback
        name="email"
        validateTrigger={['onChange', 'onBlur']}
        rules={[
          {
            type: 'email',
            message: 'Invalid email format'
          },
          {
            required: true,
            message: 'Please enter your E-mail!'
          }
        ]}
      >
        <Input placeholder="Enter your email address" />
      </Form.Item>
      <Form.Item style={{ textAlign: 'center' }}>
        <Button
          className="primary"
          type="primary"
          htmlType="submit"
          style={{
            width: '100%',
            marginBottom: 15,
            fontWeight: 600,
            padding: '5px 25px',
            height: '42px'
          }}
          disabled={submiting || countTime < 60}
          loading={submiting || countTime < 60}
        >
          {countTime < 60 ? 'Resend in' : 'Send'}
          {' '}
          {countTime < 60 && `${countTime}s`}
        </Button>
        <p>
          Have an account already?
          <Link href="/auth/login">
            <a> Login here.</a>
          </Link>
        </p>
        <p>
          Don&apos;t have an account yet
          <Link href="/auth/register">
            <a> Register here.</a>
          </Link>
        </p>
      </Form.Item>
    </Form>
  );
};

interface IProps {
  auth: any;
  ui: any;
  forgot: Function;
  forgotData: any;
  query: any;
}

interface IState {
  type: string;
  submiting: boolean;
  countTime: number;
}

class Forgot extends PureComponent<IProps, IState> {
  static authenticate = false;

  _intervalCountdown: any;

  state = {
    type: 'user',
    submiting: false,
    countTime: 60
  };

  static async getInitialProps({ ctx }) {
    const { query } = ctx;
    return { query };
  }

  componentDidMount() {
    const { query } = this.props;
    if (query && query.type) {
      this.setState({
        type: query.type
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.countTime === 0) {
      this._intervalCountdown && clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
    }
  }

  componentWillUnmount() {
    this._intervalCountdown && clearInterval(this._intervalCountdown);
  }

  handleReset = async (data: IForgot) => {
    const { type } = this.state;
    await this.setState({ submiting: true });
    try {
      await authService.resetPassword({
        ...data,
        type
      });
      message.success('An email has been sent to you to reset your password');
      this.handleCountdown();
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Error occured, please try again later');
    } finally {
      await this.setState({ submiting: false });
    }
  };

  handleCountdown = async () => {
    const { countTime } = this.state;
    if (countTime === 0) {
      clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
      return;
    }
    this.setState({ countTime: countTime - 1 });
    this._intervalCountdown = setInterval(this.coundown.bind(this), 1000);
  }

  coundown() {
    const { countTime } = this.state;
    this.setState({ countTime: countTime - 1 });
  }

  render() {
    const { ui } = this.props;
    const { submiting, countTime } = this.state;
    const { siteName } = ui;
    return (
      <>
        <Head>
          <title>
            {siteName}
            {' '}
            | Forgot Password
          </title>
        </Head>
        <Layout>
          <Content>
            <div className="main-container">
              <div className="login-box">
                <Row>
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    xl={12}
                    className="login-content left"
                    style={ui.loginPlaceholderImage ? { backgroundImage: `url(${ui.loginPlaceholderImage})` } : null}
                  />
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    xl={12}
                    className="login-content right"
                    style={{ paddingTop: 70 }}
                  >
                    <h3
                      style={{
                        fontSize: 30,
                        textAlign: 'center',
                        fontFamily: 'Merriweather Sans Bold'
                      }}
                    >
                      Reset password
                    </h3>
                    <div>
                      <ForgotForm countTime={countTime} submiting={submiting} reset={this.handleReset} />
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Content>
        </Layout>
      </>
    );
  }
}

const mapStatetoProps = (state: any) => ({
  ui: { ...state.ui }
});

export default connect(mapStatetoProps)(Forgot);
