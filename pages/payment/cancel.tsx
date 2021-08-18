import { PureComponent } from 'react';
import { Layout, Alert } from 'antd';
import { connect } from 'react-redux';
import Head from 'next/head';
import { IUser, IUIConfig } from '../../src/interfaces';

interface IProps {
  user: IUser;
  ui: IUIConfig;
}

const { Content } = Layout;

class PaymentCancel extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  render() {
    const { user, ui } = this.props;
    return (
      <>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Payment canceled
          </title>
        </Head>
        <Layout>
          <Content>
            <div className="main-container">
              <div className="page-heading">Payment Canceled</div>
              <Alert
                message="Payment canceled"
                description={`Hi ${user.name}, your payment has been canceled! Please contact us for more information.`}
                type="error"
                showIcon
              />
            </div>
          </Content>
        </Layout>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  user: state.user.current,
  ui: state.ui
});

const mapDispatch = {};
export default connect(mapStates, mapDispatch)(PaymentCancel);
