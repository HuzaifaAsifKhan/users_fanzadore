import { PureComponent } from 'react';
import {
  Layout, Collapse, Tabs, Button, Row, Col, message, Modal, List, Tag, Avatar, Tooltip
} from 'antd';
import { connect } from 'react-redux';
import { getVideos, moreVideo, getVods } from '@redux/video/actions';
import { getGalleries } from '@redux/gallery/actions';
import { listProducts, moreProduct } from '@redux/product/actions';
import { performerService, photoService, paymentService, postService } from 'src/services';
import Head from 'next/head';
import '@components/performer/performer.less';
import { CheckCircleOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { PerformerListVideo } from '@components/video/performer-list';
import { PerformerListProduct } from '@components/product/performer-list-product';
import PerformerInfo from '@components/performer/table-info';
import GalleryCard from '@components/gallery/gallery-card';
import PhotosSlider from '@components/photo/photo-slider';
import Link from 'next/link';
import Router from 'next/router';
import { redirectToErrorPage } from '@redux/system/actions';
import {
  IPerformer,
  IGallery,
  IUser,
  IUIConfig,
  IPostResponse
} from '../../../src/interfaces';
import { getPosts } from '../../../src/redux/posts/actions';
import moment from 'moment';

interface IProps {
  ui: IUIConfig;
  currentUser: IUser | IPerformer;
  performer: IPerformer;
  query: any;
  listProducts: Function;
  getVideos: Function;
  moreVideo: Function;
  getVods: Function;
  moreProduct: Function;
  videos: any;
  saleVideos: any;
  products: any;
  getGalleries: Function;
  galleries: any;
  error: any;
  redirectToErrorPage: Function;
  getPosts: Function,
  posts: IPostResponse,
}

const { Content } = Layout;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const PostList = ({ posts, currentUser }) => (
  <List
    size="large"
    dataSource={posts}
    header={`${posts.length} ${posts.length > 1 ? 'posts' : 'post'}`}
    itemLayout="horizontal"
    renderItem={(item: any) => (
      <List.Item key={item.slug}>
        <div className="post_item">
          <div className="post_media">
            {(item.filePath && (item.filePath.split(/[#?]/)[0].split('.').pop().trim() === 'jpg' || item.filePath.split(/[#?]/)[0].split('.').pop().trim() === 'png')) ? <img className="image-css"
              width={272}
              alt="logo"
              src={item.filePath}
            /> :
              (item.filePath && <video controls height="100%" width="100%">
                <source src={item.filePath} type="video/mp4" /></video>)}
          </div>
          <div className="post_meta_content">
            {currentUser.isPerformer && <div className="active_tag">
              <span>{item.postPrice != '0' ? `$${item.postPrice}` : null}</span>
              {((item.expiryTime === '' || (Date.parse(item.expiryTime) > Date.parse(moment(new Date()).format('YYYY-MM-DD HH:mm:ss')))) && (item.scheduleDateTime === '' || (Date.parse(item.scheduleDateTime) < Date.parse(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'))))) ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>}</div>}
            <List.Item.Meta
              avatar={
                <Avatar src={item.avatar || '/no-avatar.png'} />
              }
              title={currentUser.name}
              description={`@${currentUser.username}`}
            />
            <div>{item.content}</div>
            <div className="poll_div">{item.isPoll && <>
              <div className="poll_options">
              <div><Tooltip title={item.optionOne} placement="top"><Tag color="#7b5dbd">{item.optionOne}</Tag></Tooltip></div>
              <div><Tooltip title={item.optionTwo} placement="right"><Tag color="#7b5dbd">{item.optionTwo}</Tag></Tooltip></div>
              <div><Tooltip title={item.optionThree} placement="bottom"><Tag color="#7b5dbd">{item.optionThree}</Tag></Tooltip></div>
              </div>
            </>}</div>

          </div>
        </div>
      </List.Item>
    )}
  />
);

class PerformerProfile extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  state = {
    itemPerPage: 24,
    videoPage: 1,
    // eslint-disable-next-line react/no-unused-state
    photoPage: 1,
    canVidLoadMore: true,
    vodPage: 1,
    canVodLoadMore: true,
    productPage: 1,
    canProductLoadMore: true,
    sellectedGallery: null,
    galleryPhotos: null,
    visibleModal: false,
    isSubscribed: false,
    viewedVideo: true,
    viewedaddBanking: true,
    performerPosts: [],
    photosData: [],
    videosData: [],
  };

  static async getInitialProps({ ctx }) {
    const { query } = ctx;
    try {
      const performer = (await (
        await performerService.findOne(query.username, {
          Authorization: ctx.token || ''
        })
      ).data) as IPerformer;

      if (!performer) {
        return Router.push('/error/404');
      }

      return {
        performer
      };
    } catch (e) {
      const error = await Promise.resolve(e);
      return { error };
    }
  }

  async componentDidMount() {
    const {
      performer,
      redirectToErrorPage: redirectToErrorPageHandler,
      getPosts: getPostsHandler,
      currentUser
    } = this.props;
    const data = await (await postService.getPosts(currentUser._id, 'GET_ALL_POSTS')).data;
    this.setState({performerPosts: data});   
    if (!performer) {
      // move to 404?
      return redirectToErrorPageHandler({
        url: '/error/404',
        error: {
          statusCode: 404,
          message: 'Your requested link does not exist!'
        }
      });
    }
    this.getMediaSeparate();
    this.checkBlock();
    this.setState({ isSubscribed: performer.isSubscribed });
    performerService.increaseView(performer.username);
    return this.loadItems('video');
  }

  async componentDidUpdate(prevProps) {
    const { videos, saleVideos, products, posts, getPosts: getPostsHandler, currentUser } = this.props;
    const {
      productPage, itemPerPage, vodPage, videoPage
    } = this.state;
    if (prevProps.videos && prevProps.videos.total !== videos.total) {
      const { total } = videos;
      // eslint-disable-next-line react/no-did-update-set-state
      await this.setState({
        canVidLoadMore: total > videoPage * itemPerPage
      });
    }
    if (prevProps.saleVideos && prevProps.saleVideos.total !== saleVideos.total) {
      const { total } = saleVideos;
      // eslint-disable-next-line react/no-did-update-set-state
      await this.setState({
        canVodLoadMore: total > vodPage * itemPerPage
      });
    }
    if (prevProps.products && prevProps.products.total !== products.total) {
      const { total } = products;
      // eslint-disable-next-line react/no-did-update-set-state
      await this.setState({
        canProductLoadMore: total > productPage * itemPerPage
      });
    }
  }

  getMediaSeparate = () => {
    this.state.performerPosts.forEach((post)=> {
      if(post.filePath != "") {
        (post.filePath && (post.filePath.split(/[#?]/)[0].split('.').pop().trim() === 'jpg' || post.filePath.split(/[#?]/)[0].split('.').pop().trim() === 'png')) ? this.state.photosData.push(post.filePath) : this.state.videosData.push(post.filePath);
      }
    });
  }
  loadMoreItem = async (performerId: string, type: string) => {
    const {
      moreVideo: moreVideoHandler,
      moreProduct: moreProductHandler
    } = this.props;
    const {
      canVidLoadMore,
      videoPage,
      itemPerPage,
      canVodLoadMore,
      vodPage,
      productPage,
      canProductLoadMore
    } = this.state;
    if (type === 'vid') {
      if (!canVidLoadMore) {
        return false;
      }
      await this.setState({
        videoPage: videoPage + 1
      });
      moreVideoHandler({
        limit: itemPerPage,
        offset: (videoPage - 1) * itemPerPage,
        performerId,
        isSaleVideo: false
      });
    }
    if (type === 'vod') {
      if (!canVodLoadMore) {
        return false;
      }
      await this.setState({
        vodPage: vodPage + 1
      });
      moreVideoHandler({
        limit: itemPerPage,
        offset: (vodPage - 1) * itemPerPage,
        performerId,
        isSaleVideo: true
      });
    }
    if (type === 'product') {
      if (!canProductLoadMore) {
        return false;
      }
      await this.setState({
        productPage: productPage + 1
      });
      moreProductHandler({
        limit: itemPerPage,
        offset: (productPage - 1) * itemPerPage,
        performerId
      });
    }

    return undefined;
  };

  loadItems = (type: string) => {
    const { itemPerPage, productPage, videoPage } = this.state;
    const {
      performer,
      getGalleries: getGalleriesHandler,
      listProducts: listProductsHandler,
      getVideos: getVideosHandler,
      getVods: getVodsHandler
    } = this.props;

    switch (type) {
      case 'video':
        getVideosHandler({
          limit: itemPerPage,
          offset: videoPage - 1,
          performerId: performer._id,
          isSaleVideo: false
        });
        break;
      case 'saleVideo':
        getVodsHandler({
          limit: itemPerPage,
          offset: videoPage - 1,
          performerId: performer._id,
          isSaleVideo: true
        });
        break;
      case 'photo':
        getGalleriesHandler({
          limit: 200,
          performerId: performer._id
        });
        break;
      case 'store':
        listProductsHandler({
          performerId: performer._id,
          limit: itemPerPage,
          offset: productPage - 1
        });
        break;
      default: break;
    }
  }

  async checkBlock() {
    const { redirectToErrorPage: redirectToErrorPageHandler, error } = this.props;
    if (error && process.browser) {
      redirectToErrorPageHandler({
        url: '/error',
        error: {
          ...error,
          message:
            // eslint-disable-next-line no-nested-ternary
            error.message === 'BLOCKED_BY_PERFORMER'
              ? 'You have been blocked by this performer, please contact us for any questions'
              : error.message === 'BLOCK_COUNTRY'
                ? 'You cannot view the profile of this model. This model has blocked access from your country'
                : error.message
        }
      });
    }
  }

  async handleShowPhotosSlider(gallery: IGallery, performerId: string) {
    const { isSubscribed } = this.state;
    if (!isSubscribed) {
      return message.error('Subscribe to view full content!');
    }
    try {
      const resp = await (
        await photoService.userSearch(performerId, { galleryId: gallery._id })
      ).data.data;
      return this.setState({
        visibleModal: true,
        sellectedGallery: gallery,
        galleryPhotos: resp
      });
    } catch (e) {
      // console.log(e);
      // TODO - show error
      return undefined;
    }
  }

  handleClosePhotosSlider() {
    this.setState({ visibleModal: false });
  }

  async subscribe(performerId: string, type: string) {
    try {
      const subscription = await (
        await paymentService.subscribe({ type, performerId })
      ).data;
      // throw success now
      if (subscription) {
        message.success('Redirecting to payment method.');
        window.location.href = subscription.paymentUrl;
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    }
  }

  handleViewWelcomeVideo() {
    const video = document.getElementById('video') as HTMLVideoElement;
    video.pause();
    this.setState({ viewedVideo: false });
  }

  handleViewAddBanking() {
    this.setState({ viewedaddBanking: false });
  }
  
  redirecttoBilling() {
    return Router.replace('/model/account');
  }

  render() {
    const {
      performer,
      ui,
      currentUser,
      videos: videosVal,
      products: productsVal,
      saleVideos: saleVideosVal,
      galleries: galleriesVal
    } = this.props;
//    console.log(currentUser?.bankingInformation);
    const loadingVideo = videosVal.requesting || false;
    const videos = videosVal.items || [];
    const loadingVod = saleVideosVal.requesting || false;
    const saleVideos = saleVideosVal.items || [];
    const loadingPrd = productsVal.requesting || false;
    const products = productsVal.items || [];
    const galleries = galleriesVal.items || [];
    const {
      visibleModal,
      sellectedGallery,
      galleryPhotos,
      viewedVideo,
      viewedaddBanking,
      isSubscribed,
      canVidLoadMore,
      canVodLoadMore,
      canProductLoadMore,
      photosData,
      videosData,
      performerPosts
    } = this.state;
    if (currentUser.isPerformer && currentUser?.bankingInformation == null) {
      // console.log('sjiksahsjushudud');
      return this.redirecttoBilling();
    }
    return (
      <>
        <Head>
          <title>
            {`${ui?.siteName} | ${performer?.username}`}
          </title>
          <meta
            name="keywords"
            content={`${performer?.username}, ${performer?.name}`}
          />
          <meta name="description" content={performer?.bio} />
          {/* OG tags */}
          <meta
            property="og:title"
            content={`${ui?.siteName} | ${performer?.username}`}
            key="title"
          />
          <meta property="og:image" content={performer?.avatar || '/no-avatar.png'} />
          <meta
            property="og:keywords"
            content={`${performer?.username}, ${performer?.name}`}
          />
          <meta
            property="og:description"
            content={performer?.bio}
          />
        </Head>
        <Layout>
          <Content>
            <div
              className="top-profile"
              style={{
                backgroundImage:
                  performer?.cover
                    ? `url('${performer.cover}')`
                    : "url('/banner-image.jpg')"
              }}
            >
              <div className="bg-2nd">
                <div className="main-container">
                  <div className="tab-stat">
                    <div className="tab-item">
                      <span>
                        {(performer?.stats?.totalVideos) + videosData.length || 0}
                        {' '}
                        Vids
                      </span>
                    </div>
                    <div className="tab-item">
                      <span>
                        {(performer?.stats?.totalPhotos) + photosData.length || 0}
                        {' '}
                        Pics
                      </span>
                    </div>
                    <div className="tab-item">
                      <span>
                        {(performer?.stats?.totalProducts) + videosData.length + photosData.length || 0}
                        {' '}
                        Items
                      </span>
                    </div>
                    <div className="tab-item">
                      <span>
                        {(performer?.stats?.subscribers) || 0}
                        {' '}
                        Subs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="main-profile">
              <div className="main-container">
                <div className="fl-col">
                  <img
                    alt="Avatar"
                    src={
                      performer?.avatar
                        ? performer.avatar
                        : '/no-avatar.png'
                    }
                  />
                  <div className="m-user-name">
                    <h4>
                      {performer?.name ? performer.name : ''}
                      &nbsp;
                      <CheckCircleOutlined />
                    </h4>
                    <h5>
                      @
                      {performer?.username}
                    </h5>
                  </div>
                </div>
                {currentUser.isPerformer ? <div className="btn-grp">
                <button className="secondary" type="button">
                        <Link
                          href={{
                            pathname: '/posts',
                          }}
                        >
                          <span>Create Post</span>
                        </Link>
                      </button>
                      <Button
                        className="secondary"
                      >
                        Yearly Sub $
                        {performer.yearlyPrice.toFixed(2)}
                      </Button>
                      <Button
                        type="primary"
                        className="primary"
                      >
                        Monthly Sub $
                        {performer?.monthlyPrice.toFixed(2)}
                      </Button>
                </div> : null}
                <div className="btn-grp">
                  {/* <button>Send Tip</button> */}
                  {currentUser
                    && !currentUser.isPerformer
                    && currentUser._id
                      !== ((performer?._id) || '') && (
                      <button className="normal" type="button">
                        <Link
                          href={{
                            pathname: '/messages',
                            query: {
                              toSource: 'performer',
                              toId: (performer?._id) || ''
                            }
                          }}
                        >
                          <span>Message</span>
                        </Link>
                      </button>
                  )}
                  {currentUser._id
                    && !currentUser.isPerformer
                    && !isSubscribed
                    && performer
                    && (
                      <Button
                        className="secondary"
                        onClick={this.subscribe.bind(
                          this,
                          performer._id,
                          'yearly'
                        )}
                      >
                        Yearly Sub $
                        {performer.yearlyPrice.toFixed(2)}
                      </Button>
                  )}
                  {currentUser._id
                    && !currentUser.isPerformer
                    && !isSubscribed
                    && performer
                    && (
                      <Button
                        type="primary"
                        className="primary"
                        onClick={this.subscribe.bind(
                          this,
                          performer._id,
                          'monthly'
                        )}
                      >
                        Monthly Sub $
                        {performer?.monthlyPrice.toFixed(2)}
                      </Button>
                  )}
                </div>
                <div
                  className={
                    currentUser.isPerformer ? 'mar-0 pro-desc' : 'pro-desc'
                  }
                >
                  <div className="flex-row show-more">
                    <Collapse
                      expandIconPosition="right"
                      bordered={false}
                      expandIcon={({ isActive }) => (
                        <ArrowDownOutlined rotate={isActive ? 180 : 0} />
                      )}
                      className="site-collapse-custom-collapse"
                    >
                      <Panel
                        header="show more"
                        key="1"
                        className="site-collapse-custom-panel"
                      >
                        <PerformerInfo performer={performer && performer} />
                      </Panel>
                    </Collapse>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '20px' }} />
            <div className="main-container">
              <div className="model-content">              
                <Tabs defaultActiveKey="all" size="large" onTabClick={this.loadItems}>
                <TabPane tab="All" key="all">                
                <Row>
                      {currentUser && currentUser.isPerformer 
                      && <Col xs={12} sm={12} md={6} lg={10} span={6}>
                      <div style={{fontWeight: 'bold'}}>MY WISHLIST</div>
                      <div></div>
                      </Col>}
                      <Col xs={12} sm={12} md={6} lg={10}>
                      {performerPosts.length > 0 && <PostList posts={performerPosts} currentUser={currentUser} />}
                      </Col>
                    </Row>
                    <Row>
                    <Col xs={12} sm={12} md={6} lg={10} span={6}></Col>
                      {galleries
                        && galleries.length > 0
                        && galleries.map((gallery: IGallery) => (
                          <Col
                            xs={12}
                            sm={12}
                            md={8}
                            lg={6}
                            xl={6}
                            key={gallery._id}
                            onClick={this.handleShowPhotosSlider.bind(
                              this,
                              gallery,
                              performer?._id
                            )}
                          >
                            <GalleryCard gallery={gallery} />
                          </Col>
                        ))}
                    </Row>

                    {videos && videos.length > 0 && (
                      <PerformerListVideo videos={videos} />
                    )}
                    {loadingVideo && <p className="text-center">loading...</p>}
                    {videos && videos.length > 0 && canVidLoadMore && (
                      <p className="text-center">
                        <Button
                          onClick={this.loadMoreItem.bind(
                            this,
                            performer?._id,
                            'vid'
                          )}
                        >
                          Load more content
                        </Button>
                      </p>
                    )}

                    {!loadingVideo && !videos.length && !galleries.length && !performerPosts.length && <p className="text-center">No content found.</p>}

                  </TabPane>
                <TabPane tab="Photo" key="photo">
                    <Row>
                    <Col xs={12} sm={12} md={6} lg={10} span={6}>
                    <div style={{fontWeight: 'bold'}}>MY WISHLIST</div>
                    </Col>
                      {galleries
                        && galleries.length > 0
                        && galleries.map((gallery: IGallery) => (
                          <Col
                            xs={12}
                            sm={12}
                            md={8}
                            lg={6}
                            xl={6}
                            key={gallery._id}
                            onClick={this.handleShowPhotosSlider.bind(
                              this,
                              gallery,
                              performer?._id
                            )}
                          >
                            <GalleryCard gallery={gallery} />
                          </Col>
                        ))}
                    </Row>
                    <Row>
                    {currentUser && currentUser.isPerformer 
                      && <Col xs={12} sm={12} md={6} lg={10} span={6}>
                      </Col>}
                      <Col xs={12} sm={12} md={6} lg={10}>                        
                      {
                        photosData.length && photosData.map(photoUrl => 
                        <>  
                        <label className="label-style">{photoUrl.substr(photoUrl.lastIndexOf("/") + 1).replace(/\.[^/.]+$/, "").toUpperCase()}</label>                      
                        <p className="image-style"><img src={photoUrl} key={photoUrl} alt={photoUrl.substr(photoUrl.lastIndexOf("/") + 1)} /></p>
                        </>
                        )
                      }
                      </Col>
                    </Row>
                    {!galleries.length && !photosData.length && (
                      <p className="text-center">No gallery found.</p>
                    )}
                  </TabPane>
                  <TabPane tab="Video" key="video">
                    <Row>
                    <div style={{fontWeight: 'bold'}}>MY WISHLIST</div>
                    {videos && videos.length > 0 && (
                      <PerformerListVideo videos={videos} />
                    )}
                    </Row>
                    <Row>
                    {currentUser && currentUser.isPerformer 
                      && <Col xs={12} sm={12} md={6} lg={10} span={6}>
                      </Col>}
                    <Col xs={12} sm={12} md={6} lg={10}>
                      {
                        videosData.length && videosData.map(videoUrl => 
                        <>
                        <label className="label-style">{videoUrl.substr(videoUrl.lastIndexOf("/") + 1).replace(/\.[^/.]+$/, "").toUpperCase()}</label>
                        <p className="image-style"><video controls height="100%" width="100%"  key={videoUrl}>
                        <source src={videoUrl} type="video/mp4" /></video></p>
                        </>
                        )
                      }
                      </Col>
                    </Row>
                    {loadingVideo && <p className="text-center">loading...</p>}
                    {!loadingVideo && !videos.length && !videosData.length && (
                      <p className="text-center">No video found.</p>
                    )}
                    {videos && videos.length > 0 && canVidLoadMore && (
                      <p className="text-center">
                        <Button
                          onClick={this.loadMoreItem.bind(
                            this,
                            performer?._id,
                            'vid'
                          )}
                        >
                          I want more
                        </Button>
                      </p>
                    )}
                  </TabPane>
                  {/* <TabPane tab="VOD" key="saleVideo">
                    {saleVideos && saleVideos.length > 0 && (
                      <PerformerListVideo videos={saleVideos} />
                    )}
                    {loadingVod && <p className="text-center">loading...</p>}
                    {!loadingVod && !saleVideos.length && (
                      <p className="text-center">No VOD found.</p>
                    )}
                    {saleVideos && saleVideos.length > 0 && canVodLoadMore && (
                      <p className="text-center">
                        <Button
                          onClick={this.loadMoreItem.bind(
                            this,
                            performer?._id,
                            'vod'
                          )}
                        >
                          I want more
                        </Button>
                      </p>
                    )}
                  </TabPane>
                  <TabPane tab="Store" key="store">
                    {products && products.length > 0 && (
                      <PerformerListProduct products={products} />
                    )}
                    {loadingPrd && <p className="text-center">loading...</p>}
                    {!loadingPrd && !products.length && (
                      <p className="text-center">No product found.</p>
                    )}
                    {products && products.length > 0 && canProductLoadMore && (
                      <p className="text-center">
                        <Button
                          onClick={this.loadMoreItem.bind(
                            this,
                            performer?._id,
                            'product'
                          )}
                        >
                          I want more
                        </Button>
                      </p>
                    )}
                  </TabPane> */}
                </Tabs>
              </div>
            </div>
            {sellectedGallery && (
              <PhotosSlider
                gallery={sellectedGallery}
                photos={galleryPhotos}
                visible={visibleModal}
                subscribed={isSubscribed}
                onClose={this.handleClosePhotosSlider.bind(this)}
              />
            )}
            {performer
              && performer.welcomeVideoPath
              && performer.activateWelcomeVideo && (
                <Modal
                  key="welcome-video"
                  width={768}
                  visible={viewedVideo}
                  title="Welcome video"
                  onOk={this.handleViewWelcomeVideo.bind(this)}
                  onCancel={this.handleViewWelcomeVideo.bind(this)}
                  footer={[
                    <Button
                      type="primary"
                      onClick={this.handleViewWelcomeVideo.bind(this)}
                    >
                      Close
                    </Button>
                  ]}
                >
                  <video
                    autoPlay
                    src={performer.welcomeVideoPath}
                    controls
                    id="video"
                    style={{ width: '100%' }}
                  />
                </Modal>
            )}

            { currentUser.isPerformer && currentUser?.bankingInformation == null &&  (
                <Modal
                  key="addBanking"
                  width={768}
                  visible={viewedaddBanking}
                  onOk={this.handleViewAddBanking.bind(this)}
                  onCancel={this.handleViewAddBanking.bind(this)}
                  footer={null}
                >
                    <img
                        alt="logo"
                        src={ui && ui.logo ? ui.logo : '/logo-new.jpg'}
                        height="64"
                        style={{margin: "0 25% 10px"}}
                      />
                      <div 
                        className="text-center"
                        >
                          <h1>
                            Thank you for verifying your email.
                          </h1>
                          <h3>
                            To complete your registration and start earning money, please enter your bank details.
                            <br></br>
                            To continue
                          </h3>
                          &nbsp;
                          <Button size="large" type="link" className="danger" onClick={this.handleViewAddBanking.bind(this)}>
                            <Link href="/model/account">
                              <a>Click Here</a>
                            </Link>
                          </Button>
                      </div>
                </Modal>
            )}
            
          </Content>
        </Layout>
      </>
    );
  }
}


const mapStates = (state: any) => ({
  ui: state.ui,
  videos: { ...state.video.videos },
  saleVideos: { ...state.video.saleVideos },
  products: { ...state.product.products },
  galleries: { ...state.gallery.listGalleries },
  currentUser: { ...state.user.current },
  posts: { ...state.user.posts }
});

const mapDispatch = {
  getVideos,
  moreVideo,
  getVods,
  listProducts,
  moreProduct,
  getGalleries,
  redirectToErrorPage,
  getPosts
};
export default connect(mapStates, mapDispatch)(PerformerProfile);
