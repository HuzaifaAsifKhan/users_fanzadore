import { PureComponent, useState } from 'react';
import {
  Row, Col, Button, Layout, Form, Input, Select
} from 'antd';

import Link from 'next/link';
import { registerFan } from '@redux/auth/actions';
import { connect } from 'react-redux';
import Head from 'next/head';
import './index.less';
import { IUIConfig } from 'src/interfaces';
import RegisterPerformer from './model-register';

const { Option } = Select;

interface IMemberRegisterProps {
  onRegister: Function;
  onChange: Function
}

const MemberRegister = ({ onRegister, onChange }: IMemberRegisterProps) => {
  const onFinish = (values: any) => {
    onRegister(values);
  };

  const onChangeRegisterControl = () => {
    onChange();
  };

  return (   
    <Form
      name="member_register"
      initialValues={{ remember: true, gender: 'male' }}
      onFinish={onFinish}
    >      
      <Row>      
        <Col xs={12} sm={12} md={12}>
          <Form.Item
            name="firstName"
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: 'Please input your first name!' },
              {
                pattern: new RegExp(
                  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
                ),
                message:
                  'First name can not contain number and special character'
              }
            ]}
            hasFeedback
          >
            <Input placeholder="First name" />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12}>
          <Form.Item
            name="lastName"
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: 'Please input your last name!' },
              {
                pattern: new RegExp(
                  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
                ),
                message:
                  'Last name can not contain number and special character'
              }
            ]}
            hasFeedback
          >
            <Input placeholder="Last name" />
          </Form.Item>
        </Col>
        <Col xs={12} sm={12} md={12}>
          <Form.Item
            name="username"
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: 'Please input your username!' },
              {
                pattern: new RegExp(/^[A-Za-z0-9]+$/g),
                message: 'Username must contain Alphabets & Numbers only'
              },
              {
                min: 3,
                message: 'Username must containt at least 3 characters'
              }
            ]}
            hasFeedback
          >
            <Input placeholder="Username" />
          </Form.Item>
        </Col>
        {/* <Col xs={12} sm={12} md={12} lg={12}>
          <Form.Item
            name="gender"
            validateTrigger={['onChange', 'onBlur']}
            rules={[{ required: true }]}
            hasFeedback
          >
            <Select>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="transgender">Transgender</Option>
            </Select>
          </Form.Item>
        </Col> */}
        <Col xs={12} sm={12} md={12} lg={12}>
          <Form.Item
            name="email"
            validateTrigger={['onChange', 'onBlur']}
            hasFeedback
            rules={[
              {
                type: 'email',
                message: 'Invalid email address!'
              },
              {
                required: true,
                message: 'Please input your email address!'
              }
            ]}
          >
            <Input placeholder="Email address" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item
            name="password"
            validateTrigger={['onChange', 'onBlur']}
            hasFeedback
            rules={[
              { required: true, message: 'Please input your password!' },
              {
                min: 6,
                message: 'Password must contain at least 6 characters.'
              }
            ]}
          >
            <Input type="password" placeholder="Password" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item
            name="confirm"
            validateTrigger={['onChange', 'onBlur']}
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: 'Please confirm your password!'
              },
              {
                min: 6,
                message: 'Password must contain at least 6 characters.'
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  // eslint-disable-next-line prefer-promise-reject-errors
                  return Promise.reject('Passwords do not match together!');
                }
              })
            ]}
          >
            <Input type="password" placeholder="Confirm password" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ textAlign: 'center' }}>
        <Button
          type="primary"
          htmlType="submit"
          style={{
            marginBottom: 15,
            fontWeight: 600,
            padding: '5px 25px',
            height: '42px'
          }}
        >
          CREATE YOUR ACCOUNT
        </Button>
        <p>
          Have an account already?
          <Link href={{ pathname: '/auth/login', query: { loginAs: 'user' }}}>
            <a> Login here.</a>
          </Link>
        </p>
        <p>
          Are you a model?
            <a onClick={onChangeRegisterControl}> Register here.</a>
        </p>
      </Form.Item>
    </Form>
  );
};

const { Content } = Layout;

interface IProps {
  ui: IUIConfig;
  registerFan: Function;
}

class FanRegister extends PureComponent<IProps> {
  static authenticate: boolean = false;
  registerAsUser: boolean = true;
  state = {
    registerAsUser: true
  }

  getQueryParamsAndNavigate() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('registerAs');
  }

  componentDidMount() {
    this.getQueryParamsAndNavigate() === 'performer' ? this.handleSwitch(false) : this.handleSwitch(true);
  }

  handleRegister = (data: any) => {
    const { registerFan: registerFanHandler } = this.props;
    registerFanHandler(data);
  };

  handleSwitch(value: boolean) {
    this.setState({registerAsUser: value});
  }

  render() {
    const { ui } = this.props;
    const { registerAsUser } = this.state;
    return (
      <Layout>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Fan Register
          </title>
        </Head>
        <Content>
          <div className="main-container">
            <div className="login-box register-box">
              <Row>
                <Col
                  xs={16}
                  sm={16}
                  md={16}
                  lg={16}
                  xl={16}
                  className="login-content right"
                >
                  <div className="switch-btn">
                    <button type="button" style={{ marginRight: '20px' }} className={ registerAsUser ? 'active' : ''} onClick={this.handleSwitch.bind(this, true)}>BE A FAN</button>
                    <button type="button" className={ !registerAsUser ? 'active' : ''} onClick={this.handleSwitch.bind(this, false)}>BE ADORED</button>
                  </div>
                   <div className="login_form_box">
                { registerAsUser ?
                <div>
                   <p className="text-center">
                    <span className="title">FAN REGISTER</span>
                  </p>
                  <div className="register-form">
                    <MemberRegister onRegister={this.handleRegister} onChange={this.handleSwitch.bind(this, false)} />
                  </div></div> :
                  <div>
                  <p className="text-center">
                    <span className="title">CREATOR REGISTER</span>
                  </p>
                  <div>
                  <RegisterPerformer onChange={this.handleSwitch.bind(this, true)} />
                  </div>
                  </div>
                  }
                  </div>
                </Col>
              </Row>
                {registerAsUser ? <div className="benefit_list">
                <p>BENEFITS:</p>
                <ul>
                <li>View exclusive content</li>
                <li>Monthly and yearly subscription</li>
                <li>Chat with content creators</li>
                <li>Favourite your video with future viewing</li>
                <li><i>Plus much more</i></li>
                </ul>
                </div> :
                <div className="benefit_list">
                <p>BENEFITS:</p>
                <ul>
                <li>Multi video uploading</li>
                <li>Chat with fans</li>
                <li>Affiliate program for blogs to promote your content</li>
                <li>80% standard commission rate</li>
                <li><i>Plus much more</i></li>
                </ul>
                </div>}
            </div>
          </div>
        </Content>
      </Layout>
    );
  }
}
const mapStatesToProps = (state: any) => ({
  ui: state.ui
});

const mapDispatchToProps = { registerFan };

export default connect(mapStatesToProps, mapDispatchToProps)(FanRegister);
