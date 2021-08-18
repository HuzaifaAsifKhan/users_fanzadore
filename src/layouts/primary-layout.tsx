import { PureComponent } from 'react';
import dynamic from 'next/dynamic';
import { Layout, BackTop } from 'antd';
// import { enquireScreen, unenquireScreen } from "enquire-js";
import { connect } from 'react-redux';
import { Router } from 'next/router';
import { updateUIValue, loadUIValue } from 'src/redux/ui/actions';
import Head from 'next/head';
import { IUIConfig } from 'src/interfaces/ui-config';
import './primary-layout.less';

const Header = dynamic(() => import('@components/common/layout/header'));
const Footer = dynamic(() => import('@components/common/layout/footer'));
const Loader = dynamic(() => import('@components/common/base/loader'));

interface DefaultProps extends IUIConfig {
  children: any;
  config: IUIConfig;
  updateUIValue: Function;
  loadUIValue: Function;
}

export async function getStaticProps() {
  return {
    props: {}
  };
}

class PrimaryLayout extends PureComponent<DefaultProps> {
  state = {
    // isMobile: false,
    // security request for primary layout
    // checkingUser: false,
    routerChange: false
  };

  enquireHandler: any;

  componentDidMount() {
    // this.props.loadUIValue();
    // this.enquireHandler = enquireScreen(mobile => {
    //   const { isMobile } = this.state
    //   if (isMobile !== mobile) {
    //     this.setState({
    //       isMobile: mobile,
    //     })
    //   }
    // });

    process.browser && this.handleStateChange();
  }

  handleStateChange() {
    Router.events.on('routeChangeStart', async () => this.setState({ routerChange: true }));
    Router.events.on('routeChangeComplete', async () => this.setState({ routerChange: false }));
  }

  // componentWillUnmount() {
  //   unenquireScreen(this.enquireHandler)
  // }

  // onCollapseChange = collapsed => {
  //   this.props.updateUIValue({ collapsed });
  // }

  // onThemeChange = (theme: string) => this.props.updateUIValue({ theme });

  render() {
    const {
      children,
      // collapsed,
      fixedHeader,
      // logo,
      // siteName,
      // theme,
      favicon
    } = this.props;
    const {
      // isMobile,
      routerChange
    } = this.state;
    // const headerProps = {
    //   collapsed,
    //   theme,
    //   onCollapseChange: this.onCollapseChange
    // };

    return (
      <>
        <Layout>
          <Head>
            <link rel="icon" href={favicon} sizes="64x64" />
          </Head>
          <div
            className="container"
            style={{ paddingTop: fixedHeader ? 72 : 0 }}
            id="primaryLayout"
          >
            <Header />
            <Layout.Content
              className="content"
              style={{ position: 'relative' }}
            >
              {routerChange && <Loader />}
              {/* {routerChange && <Loader spinning />} */}
              {/* <Bread routeList={newRouteList} /> */}
              {children}
            </Layout.Content>
            <BackTop className="backTop" />
            <Footer />
          </div>
        </Layout>
      </>
    );
  }
}

const mapStateToProps = (state: any) => ({
  ...state.ui,
  auth: state.auth
});
const mapDispatchToProps = { updateUIValue, loadUIValue };

export default connect(mapStateToProps, mapDispatchToProps)(PrimaryLayout);
