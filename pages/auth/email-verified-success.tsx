import { PureComponent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { connect } from 'react-redux';
import {
  Layout
} from 'antd';

const { Content } = Layout;

interface IProps {
  ui: any;
}

class EmailVerifiedSuccess extends PureComponent<IProps> {
  static authenticate: boolean = false;

  render() {
    const { ui } = this.props;
    const { siteName } = ui;
    return (
      <>
        <Head>
          <title>
            {siteName}
            {' '}
            | Email Verify
            {' '}
          </title>
        </Head>
        <Layout>
          <Content>
            <div className="email-verify-succsess">
              <p>
                Your email has been verified,
                <Link href="/auth/login">
                  <a> click here to login</a>
                </Link>
              </p>
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

export default connect(mapStatetoProps)(EmailVerifiedSuccess);
