import { PureComponent } from 'react';
import { Layout, message } from 'antd';

import Page from '@components/common/layout/page';
import Loader from '@components/common/base/loader';
import { IVideo, IUIConfig } from 'src/interfaces';
import { connect } from 'react-redux';
import { videoService } from 'src/services';
import { PerformerListVideo } from '@components/video/performer-list';
import { ProPagination } from '@components/pagination';
import Head from 'next/head';

const { Content } = Layout;

interface IProps {
  ui: IUIConfig;
}
interface IStates {
  loading: boolean;
  favouriteVideos: IVideo[];
  currentPage: number;
  limit: number;
  total: number;
}

class FavouriteVideoPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: true,
      favouriteVideos: [],
      currentPage: 1,
      limit: 2,
      total: 0
    };
  }

  componentDidMount() {
    this.getFavouriteVideos();
  }

  async getFavouriteVideos() {
    try {
      const { limit, currentPage } = this.state;
      const resp = await videoService.getFavouriteVideos({
        limit,
        offset: (currentPage - 1) * limit
      });
      await this.setState({
        favouriteVideos: resp.data.data,
        total: resp.data.total
      });
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  async handlePagechange(page: number) {
    await this.setState({ currentPage: page });
    this.getFavouriteVideos();
  }

  render() {
    const {
      loading, favouriteVideos, limit, total
    } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>
            {' '}
            {ui && ui.siteName}
            {' '}
            | My Favourite
            {' '}
          </title>
        </Head>
        <Content>
          <div className="main-container">
            <div className="page-heading">My Favourite</div>
            {loading ? (
              <Loader />
            ) : (
              <Page>
                {!favouriteVideos
                    || (favouriteVideos.length === 0 && (
                      <div style={{ textAlign: 'center' }}>
                        No video found.
                      </div>
                    ))}
                {favouriteVideos && favouriteVideos.length > 0 && (
                <PerformerListVideo videos={favouriteVideos} />
                )}
                {total > limit && (
                <div className="paging">
                  <ProPagination
                    showQuickJumper={false}
                    defaultCurrent={1}
                    total={total}
                    pageSize={limit}
                    onChange={this.handlePagechange.bind(this)}
                  />
                </div>
                )}
              </Page>
            )}
          </div>
        </Content>
      </Layout>
    );
  }
}
const mapState = (state: any) => ({ ui: state.ui });
export default connect(mapState)(FavouriteVideoPage);
