import { PureComponent } from 'react';
import { Layout, Alert } from 'antd';

import { connect } from 'react-redux';
import Head from 'next/head';

interface IProps {
  ui: any;
  system: any;
}

const { Content } = Layout;

class ErrorPage extends PureComponent<IProps> {
  static noredirect: boolean = true;

  render() {
    const { ui, system } = this.props;
    const error = system.error || {
      statusCode: 400,
      message: 'Something went wrong, please try again later'
    };
    return (
      <>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Error
          </title>
        </Head>
        <Layout>
          <Content>
            <div className="main-container">
              <Alert
                style={{ marginTop: '20px' }}
                message={`${error.statusCode} Error`}
                description={error.message}
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
  ui: state.ui,
  system: state.system
});

export default connect(mapStates)(ErrorPage);
