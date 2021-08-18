import { PureComponent } from 'react';
import { Layout, message } from 'antd';
import Head from 'next/head';
import Page from '@components/common/layout/page';
import FormGallery from '@components/gallery/form-gallery';
import { IGalleryCreate, IUIConfig } from 'src/interfaces';
import { galleryService } from 'src/services';
import { getResponseError } from '@lib/utils';
import Router from 'next/router';
import { connect } from 'react-redux';

const { Content } = Layout;

interface IProps {
  ui: IUIConfig;
}

interface IStates {
  submitting: boolean;
}

class GalleryCreatePage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  constructor(props: IProps) {
    super(props);
    this.state = {
      submitting: false
    };
  }

  async onFinish(data: IGalleryCreate) {
    try {
      this.setState({ submitting: true });
      await galleryService.create(data);
      message.success('Gallery have been created.');
    } catch (e) {
      message.error(
        getResponseError(e) || 'An error occurred, please try again!'
      );
    } finally {
      await this.setState({ submitting: true }, () => Router.push('/model/gallery-manager/listing'));
    }
  }

  render() {
    const { ui } = this.props;
    const { submitting } = this.state;
    return (
      <Layout>
        <Head>
          <title>
            {' '}
            {ui && ui.siteName}
            {' '}
            | Create Gallery
            {' '}
          </title>
        </Head>
        <Content>
          <div className="main-container">
            {/* <BreadcrumbComponent
              breadcrumbs={[
                { title: 'Gallery Manager', href: '/model/gallery-manager/listing' },
                { title: 'New Gallery' }
              ]}
            /> */}
            <Page>
              <div className="page-heading">
                <span>New Gallery</span>
              </div>
              <FormGallery
                submitting={submitting}
                onFinish={this.onFinish.bind(this)}
              />
            </Page>
          </div>
        </Content>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(GalleryCreatePage);
