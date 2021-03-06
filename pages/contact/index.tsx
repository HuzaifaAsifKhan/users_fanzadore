/* eslint-disable react/no-did-update-set-state */
import { PureComponent, createRef } from 'react';

import {
  Form, Button, Layout, Input, message, Col, Row
} from 'antd';
import Head from 'next/head';
import '../auth/index.less';
import { settingService } from '@services/setting.service';
import { connect } from 'react-redux';
import { IUIConfig } from '../../src/interfaces';

const { TextArea } = Input;

interface IProps {
  ui: IUIConfig;
}

class ContactPage extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect: boolean = true;

  _intervalCountdown: any;

  state = {
    submiting: false,
    countTime: 60
  }

  formRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
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

  async onFinish(values) {
    this.setState({ submiting: true });
    try {
      await settingService.contact(values);
      message.success('Thank you for contact us, we will reply within 48hrs.');
      this.handleCountdown();
      this.formRef.current.resetFields();
    } catch (e) {
      message.error('Error occured, please try again later');
      this.formRef.current.resetFields();
    } finally {
      this.setState({ submiting: false });
    }
  }

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
    if (!this.formRef) this.formRef = createRef();
    const { ui } = this.props;
    const { submiting, countTime } = this.state;
    return (
      <Layout>
        <Head>
          <title>
            {' '}
            {ui?.siteName}
            {' '}
            | Contact
            {' '}
          </title>
        </Head>
        <div className="main-container">
          <div className="login-box">
            <Row>
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={12}
                xl={12}
                className="login-content left contact"
                style={ui.loginPlaceholderImage ? { backgroundImage: `url(${ui.loginPlaceholderImage})` } : null}
              />
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={12}
                xl={12}
                className="login-content right"
              >
                <p className="text-center">
                  <span className="title">Contact</span>
                </p>
                <h5
                  className="text-center"
                  style={{ fontSize: 13, color: '#888' }}
                >
                  Please fill out all the info beside and we will get back to
                  you with-in 48hrs.
                </h5>
                <Form
                  layout="vertical"
                  name="contact-from"
                  ref={this.formRef}
                  onFinish={this.onFinish.bind(this)}
                >
                  <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Tell us your name' }]}
                  >
                    <Input placeholder="Your valid name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: 'Tell us your e-mail address.'
                      },
                      { type: 'email', message: 'Invalid email format' }
                    ]}
                  >
                    <Input placeholder="Your valid email" />
                  </Form.Item>
                  <Form.Item
                    name="message"
                    rules={[
                      { required: true, message: 'What can we help you?' },
                      {
                        min: 20,
                        message: 'Please input at least 20 characters.'
                      }
                    ]}
                  >
                    <TextArea rows={3} placeholder="Your message" />
                  </Form.Item>
                  <div className="text-center">
                    <Button
                      size="large"
                      className="primary"
                      type="primary"
                      htmlType="submit"
                      loading={submiting || countTime < 60}
                      disabled={submiting || countTime < 60}
                      style={{ fontWeight: 600, width: '100%' }}
                    >
                      {countTime < 60 ? 'Resend in' : 'Send'}
                      {' '}
                      {countTime < 60 && `${countTime}s`}
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(ContactPage);
