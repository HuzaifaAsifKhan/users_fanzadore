/* eslint-disable no-restricted-globals */
/* eslint-disable no-alert */
import { PureComponent } from 'react';
import { Layout, message } from 'antd';
import Head from 'next/head';

import FormGallery from '@components/gallery/form-gallery';
import {
  IGallery, IGalleryCreate, IPhotos, IUIConfig
} from 'src/interfaces';
import Page from '@components/common/layout/page';
import { galleryService } from 'src/services';
import Router from 'next/router';
import Loading from '@components/common/base/loader';
import { getResponseError } from '@lib/utils';
import { connect } from 'react-redux';
import { photoService } from '@services/index';

const { Content } = Layout;

interface IProps {
  id: string;
  ui: IUIConfig;
}

interface IStates {
  submitting: boolean;
  gallery: IGallery;
  loading: boolean;
  photos: IPhotos[];
  // isUpdating: boolean;
}

class GalleryUpdatePage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      submitting: false,
      gallery: null,
      loading: true,
      photos: []
      // isUpdating: true
    };
  }

  componentDidMount() {
    this.getData();
  }

  async onFinish(data: IGalleryCreate) {
    try {
      const { id } = this.props;
      this.setState({ loading: true });
      await galleryService.update(id, data);
      message.success('Changes saved.');
    } catch (e) {
      message.error(getResponseError(e));
    } finally {
      await this.setState({ loading: false });
      Router.push('/model/gallery-manager/listing');
    }
  }

  async getData() {
    try {
      const { id } = this.props;
      const [gallery, photos] = await Promise.all([
        galleryService.findById(id),
        photoService.searchPhotosInGallery({ galleryId: id })
      ]);
      await this.setState({ gallery: gallery.data, photos: photos.data.data });
    } catch (e) {
      message.error('Can not find gallery!');
    } finally {
      this.setState({ loading: false });
    }
  }

  async removePhoto(id: string) {
    if (window.confirm('Are you sure to delete this photo')) {
      try {
        const { photos } = this.state;
        await photoService.delete(id);
        message.success('Delete successfully');
        this.setState({ photos: photos.filter((p) => p._id !== id) });
      } catch (error) {
        message.error(getResponseError(error));
      }
    }
  }

  render() {
    const { ui } = this.props;
    const {
      gallery, submitting, loading, photos
    } = this.state;
    return (
      <Layout>
        <Head>
          <title>
            {' '}
            {ui && ui.siteName}
            {' '}
            | Update Gallery
            {' '}
          </title>
        </Head>
        <Content>
          <div className="main-container">
            {/* <BreadcrumbComponent
              breadcrumbs={[
                { title: 'Gallery Manager', href: '/model/gallery-manager/listing'},
                {
                  title:
                    gallery && gallery.name ? gallery.name : 'Gallery Detail'
                },
                { title: 'Update' }
              ]}
            /> */}
            <Page>
              <div className="page-heading">
                <span>Update Gallery</span>
              </div>
              {loading ? (
                <Loading />
              ) : (
                <FormGallery
                  gallery={gallery}
                  onFinish={this.onFinish.bind(this)}
                  submitting={submitting}
                  // isUpdating={isUpdating}
                  removePhoto={this.removePhoto.bind(this)}
                  photosList={photos}
                />
              )}
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
export default connect(mapStates)(GalleryUpdatePage);
