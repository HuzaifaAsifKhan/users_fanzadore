import { PureComponent } from 'react';
import {
  Layout,
  Tabs,
  Button,
  Tag,
  message,
  Space,
  Row,
  Col,
  Input
} from 'antd';
import {
  LikeTwoTone,
  EyeOutlined,
  HourglassOutlined,
  HeartTwoTone,
  ClockCircleTwoTone
} from '@ant-design/icons';

import { connect } from 'react-redux';
import Head from 'next/head';
import { videoService, reactionService, paymentService } from '@services/index';
import {
  RelatedListVideo,
  VideoPlayer,
  ThumbnailVideo
} from '@components/video';
import { ListComments } from '@components/comment/list-comments';
import { CommentForm } from '@components/comment/comment-form';
import Link from 'next/link';
import './video.less';
import Router from 'next/router';
import {
  IVideoResponse,
  IUser,
  IUIConfig,
  ICoupon,
  IPerformer
} from '../../src/interfaces';
import {
  getComments,
  moreComment,
  createComment
} from '../../src/redux/comment/actions';
import { getRelated } from '../../src/redux/video/actions';

const { Content } = Layout;
const { TabPane } = Tabs;

interface IProps {
  query: any;
  user: IUser;
  relatedVideos: any;
  commentState: any;
  getRelated: Function;
  getComments: Function;
  moreComment: Function;
  createComment: Function;
  ui: IUIConfig;
  video: IVideoResponse;
}

function timeDuration(s) {
  if (!s) {
    return '00:00';
  }
  const secNum: any = parseInt(s, 10); // don't forget the second param
  let hours: any = Math.floor(secNum / 3600);
  let minutes: any = Math.floor((secNum - hours * 3600) / 60);
  let seconds: any = secNum - hours * 3600 - minutes * 60;

  if (hours < 10) hours = `0${hours}`;
  if (minutes < 10) minutes = `0${minutes}`;
  if (seconds < 10) seconds = `0${seconds}`;
  return `${(hours ? `${hours}:` : '') + minutes}:${seconds}`;
}

class VideoViewPage extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  static async getInitialProps({ ctx }) {
    const { query } = ctx;
    try {
      const video = (await (
        await videoService.findOne(query.id, {
          Authorization: ctx.token
        })
      ).data) as IVideoResponse;
      if (video) {
        return {
          video
        };
      }
    } catch (e) {
      return {
        query
      };
    }
    return {};
  }

  state = {
    // video: null,
    videoStats: { likes: 0, comments: 0, views: 0 },
    userReaction: { liked: false, favourited: false, watchedLater: false },
    // isLoading: true,
    itemPerPage: 24,
    commentPage: 1,
    canLoadMoreComment: true,
    isFirstLoadComment: true,
    isBought: false,
    isSubscribed: false,
    couponCode: '',
    isApplyCoupon: false,
    coupon: null as ICoupon
  };

  async componentDidMount() {
    const { video, getRelated: getRelatedHandler } = this.props;
    if (!video) {
      return Router.push('/home');
    }
    this.setState({
      videoStats: video.stats,
      userReaction: video.userReaction,
      isBought: video.isBought,
      isSubscribed: video.isSubscribed
    });
    videoService.increaseView(video._id);
    getRelatedHandler({
      performerId: video.performerId,
      excludedId: video._id,
      status: 'active',
      limit: 24
    });
    return undefined;
  }

  componentDidUpdate(prevProps) {
    const { commentState, video, getRelated: getRelatedHandler } = this.props;
    if (prevProps.video._id !== video._id) {
      videoService.increaseView(video._id);
      getRelatedHandler({
        performerId: video.performerId,
        excludedId: video._id,
        status: 'active',
        limit: 24
      });
      this.forceUpdate();
    }
    if (commentState && prevProps.commentState.total !== commentState.total) {
      const { total } = commentState;
      const { commentPage, itemPerPage } = this.state;
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        canLoadMoreComment: total > commentPage * itemPerPage
      });
    }
  }

  onChangeTab(videoId: string, tab: string) {
    const { isFirstLoadComment, itemPerPage, commentPage } = this.state;
    const { getComments: getCommentsHandler } = this.props;
    if (tab === 'comment' && isFirstLoadComment) {
      this.setState(
        {
          isFirstLoadComment: false
        },
        () => {
          getCommentsHandler({
            objectId: videoId,
            limit: itemPerPage,
            offset: commentPage - 1
          });
        }
      );
    }
  }

  async onReaction(
    videoId: string,
    action: string,
    isCreated: boolean = false
  ) {
    const { user } = this.props;
    const { userReaction, videoStats } = this.state;
    if (user && user.isPerformer) return;
    try {
      if (!isCreated) {
        const react = await (
          await reactionService.create({
            objectId: videoId,
            action,
            objectType: 'video'
          })
        ).data;
        if (react) {
          if (action === 'like') {
            this.setState({
              userReaction: { ...userReaction, liked: true },
              videoStats: {
                ...videoStats,
                likes: videoStats.likes + 1
              }
            });
            message.success('Liked');
          }
          if (action === 'favourite') {
            message.success("Added to 'My Favourite'");
            this.setState({
              userReaction: { ...userReaction, favourited: true }
            });
          }
          if (action === 'watch_later') {
            message.success('Added to "My Wishlist"');
            this.setState({
              userReaction: { ...userReaction, watchedLater: true }
            });
          }
        }
      }
      if (isCreated) {
        const react = await await reactionService.delete({
          objectId: videoId,
          action,
          objectType: 'video'
        });
        if (react) {
          if (action === 'like') {
            this.setState({
              userReaction: { ...userReaction, liked: false },
              videoStats: {
                ...videoStats,
                likes: videoStats.likes - 1
              }
            });
            message.success('Unliked');
          }
          if (action === 'favourite') {
            message.success("Removed from 'My Favourite'");
            this.setState({
              userReaction: { ...userReaction, favourited: false }
            });
          }
          if (action === 'watch_later') {
            message.success('Removed from "My Wishlist"');
            this.setState({
              userReaction: { ...userReaction, watchedLater: false }
            });
          }
        }
      }
    } catch (e) {
      message.error(e.message || 'Error occured, please try again later');
    }
  }

  async onSubmitComment(values: any) {
    const { createComment: createCommentHandler } = this.props;
    createCommentHandler(values);
  }

  loadMoreComment = async (videoId: string) => {
    const { canLoadMoreComment, commentPage, itemPerPage } = this.state;
    const { moreComment: moreCommentHandler } = this.props;
    if (!canLoadMoreComment) {
      return false;
    }
    await this.setState({
      commentPage: commentPage + 1
    });
    return moreCommentHandler({
      limit: itemPerPage,
      offset: (commentPage - 1) * itemPerPage,
      objectId: videoId
    });
  };

  async buyVideo(id: string) {
    try {
      const { isApplyCoupon, couponCode } = this.state;
      const data = isApplyCoupon && couponCode ? { couponCode } : {};
      const pay = await (await paymentService.purchaseVideo(id, data)).data;
      // TOTO update logic here
      if (pay) {
        message.success('Redirecting to payment method');
        window.location.href = pay.paymentUrl;
      }
    } catch (e) {
      // console.log(e);
    }
  }

  async subscribe(performerId: string, type: string) {
    try {
      const subscription = await (
        await paymentService.subscribe({ type, performerId })
      ).data;
      // throw success now
      if (subscription) {
        message.success('Redirecting to payment method');
        window.location.href = subscription.paymentUrl;
      }
    } catch (e) {
      // const err = await e;
      // eslint-disable-next-line no-alert
      window.alert('error occured, please try again later');
    }
  }

  async applyCoupon() {
    try {
      const { couponCode } = this.state;
      const resp = await paymentService.applyCoupon(couponCode);
      this.setState({ isApplyCoupon: true, coupon: resp.data });
      message.success('Coupon is applied');
    } catch (error) {
      const e = await error;
      message.error(
        e && e.message ? e.message : 'Error occured, please try again later'
      );
    }
  }

  async unApplyCoupon() {
    this.setState({ isApplyCoupon: false, coupon: null });
  }

  render() {
    const {
      user,
      ui,
      video,
      commentState = {
        requesting: false,
        error: null,
        success: false,
        items: [],
        total: 0
      },
      relatedVideos = {
        requesting: false,
        error: null,
        success: false,
        items: []
      }
    } = this.props;
    const {
      videoStats,
      userReaction,
      isSubscribed,
      isBought,
      isApplyCoupon,
      coupon,
      couponCode,
      canLoadMoreComment
    } = this.state;

    const playSource = {
      file: video && video.video && video.video.url ? video.video.url : '',
      image: video && video.thumbnail ? video.thumbnail : ''
    };
    const videoJsOptions = {
      autoplay: false,
      controls: true,
      playsinline: true,
      sources: [
        {
          src: playSource.file,
          type: 'video/mp4'
        }
      ]
    };

    const calTotal = (v: IVideoResponse, couponValue?: number) => {
      let total = v.price;
      if (couponValue) {
        total -= total * couponValue;
      }
      return total.toFixed(2) || 0;
    };

    return (
      <>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            |
            {' '}
            {video && video.title ? video.title : 'Video'}
          </title>
          <meta name="keywords" content={video && video.description} />
          <meta name="description" content={video && video.description} />
          {/* OG tags */}
          <meta
            property="og:title"
            content={
              ui
              && `${ui.siteName} | ${video && video.title ? video.title : 'Video'}`
            }
            key="title"
          />
          <meta property="og:image" content={video && video.thumbnail} />
          <meta property="og:keywords" content={video && video.description} />
          <meta
            property="og:description"
            content={video && video.description}
          />
        </Head>
        <Layout>
          <Content>
            <div className="main-container">
              <div className="vid-title">{video.title}</div>
              <div className="vid-duration">
                <a>
                  <HourglassOutlined />
                  &nbsp;
                  {timeDuration(video.video.duration)}
                </a>
                <a>
                  <EyeOutlined />
                  &nbsp;
                  {videoStats && videoStats.views ? videoStats.views : 0}
                </a>
              </div>
              <div className="vid-player">
                {((!video.isSaleVideo && isSubscribed)
                  || (video.isSaleVideo && isBought)) && (
                  <div className="main-player">
                    {video && video.video && video.video.url ? (
                      <VideoPlayer {...videoJsOptions} />
                    ) : (
                      <h3>No source found.</h3>
                    )}
                  </div>
                )}
                <div className="text-center">
                  {video.isSaleVideo && !isBought && (
                    <div className="coupon-form">
                      <Row>
                        <Col xs={24} md={12} sm={10}>
                          <Input
                            placeholder="Enter a coupon code"
                            onChange={(value) => this.setState({
                              couponCode: value.currentTarget.value
                            })}
                            disabled={isApplyCoupon}
                          />
                        </Col>
                        <Col xs={12} md={4} sm={6}>
                          {!isApplyCoupon ? (
                            <Button
                              className="primary"
                              disabled={!couponCode}
                              block
                              onClick={() => this.applyCoupon()}
                            >
                              <strong>Apply coupon</strong>
                            </Button>
                          ) : (
                            <Button
                              className="primary"
                              block
                              onClick={() => this.unApplyCoupon()}
                            >
                              <strong>Use later</strong>
                            </Button>
                          )}
                        </Col>
                        <Col xs={12} md={8} sm={8}>
                          <Button
                            className="normal"
                            onClick={this.buyVideo.bind(this, video._id)}
                            block
                          >
                            <Space>
                              BUY ME
                              <span
                                className={
                                  isApplyCoupon
                                    ? 'discount-price'
                                    : 'initialPrice'
                                }
                              >
                                $
                                {calTotal(video)}
                              </span>
                              {isApplyCoupon && coupon && (
                                <span>
                                  $
                                  {calTotal(video, coupon.value)}
                                </span>
                              )}
                            </Space>
                          </Button>
                        </Col>
                      </Row>
                      <div style={{ marginBottom: '10px' }} />
                      <ThumbnailVideo
                        video={video}
                      />
                    </div>
                  )}
                  {!video.isSaleVideo && !isSubscribed && (
                    <div
                      style={{ padding: '25px 5px' }}
                      className="subscription"
                    >
                      <h3>To view full content, subscribe me!</h3>
                      <div style={{ marginBottom: '25px' }}>
                        {video.performer && video.performer.monthlyPrice && (
                          <Button
                            className="primary"
                            style={{ marginRight: '15px' }}
                            onClick={this.subscribe.bind(
                              this,
                              video.performer._id,
                              'monthly'
                            )}
                          >
                            Subscribe Monthly $
                            {video.performer.monthlyPrice.toFixed(2)}
                          </Button>
                        )}
                        {video.performer && video.performer.yearlyPrice && (
                          <Button
                            className="btn btn-yellow"
                            onClick={this.subscribe.bind(
                              this,
                              video.performer._id,
                              'yearly'
                            )}
                          >
                            Subscribe Yearly $
                            {video.performer.yearlyPrice.toFixed(2)}
                          </Button>
                        )}
                      </div>
                      <ThumbnailVideo
                        video={video}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="vid-split">
              <div className="main-container">
                <div className="vid-act">
                  <div className="act-btns">
                    <button
                      type="button"
                      className={
                        userReaction && userReaction.liked
                          ? 'react-btn liked'
                          : 'react-btn'
                      }
                      onClick={this.onReaction.bind(
                        this,
                        video._id,
                        'like',
                        userReaction.liked
                      )}
                    >
                      {videoStats && videoStats.likes ? videoStats.likes : 0}
                      {' '}
                      <LikeTwoTone
                        twoToneColor={
                          userReaction && userReaction.liked ? '#fff' : '#888'
                        }
                      />
                    </button>
                    <button
                      type="button"
                      className={
                        userReaction && userReaction.favourited
                          ? 'react-btn favourited'
                          : 'react-btn'
                      }
                      onClick={this.onReaction.bind(
                        this,
                        video._id,
                        'favourite',
                        userReaction.favourited
                      )}
                    >
                      <HeartTwoTone
                        twoToneColor={
                          userReaction && userReaction.favourited
                            ? '#fff'
                            : '#888'
                        }
                      />
                    </button>
                    <button
                      type="button"
                      className={
                        userReaction && userReaction.watchedLater
                          ? 'react-btn watch-later'
                          : 'react-btn'
                      }
                      onClick={this.onReaction.bind(
                        this,
                        video._id,
                        'watch_later',
                        userReaction.watchedLater
                      )}
                    >
                      <ClockCircleTwoTone
                        twoToneColor={
                          userReaction && userReaction.watchedLater
                            ? '#888'
                            : '#888'
                        }
                      />
                    </button>
                  </div>
                  <div className="o-w-ner">
                    <Link
                      href={{
                        pathname: '/model/profile',
                        query: { username: video.performer.username }
                      }}
                      as={`/model/${video.performer.username}`}
                    >
                      <a>
                        <img
                          alt="performer avatar"
                          src={video.performer.avatar || '/user.png'}
                        />
                        {' '}
                        @
                        {video.performer.username}
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="vid-info">
              <div className="main-container">
                <div style={{ marginBottom: '15px' }}>
                  {video.tags.length > 0
                    && video.tags.map((tag) => (
                      <Tag color="magenta" key={tag}>
                        {tag || 'tag'}
                      </Tag>
                    ))}
                </div>

                <Tabs
                  defaultActiveKey="Video"
                  onChange={this.onChangeTab.bind(this, video._id)}
                >
                  <TabPane tab="Description" key="description">
                    <p>{video.description || 'No description...'}</p>
                  </TabPane>
                  <TabPane tab="Participants" key="participants">
                    <Row>
                      {video.participants && video.participants.length > 0 ? (
                        video.participants.map((per: IPerformer) => (
                          <Col xs={12} sm={12} md={6} lg={6} key={per._id}>
                            <Link
                              href={{
                                pathname: '/model/profile',
                                query: { username: per.username }
                              }}
                              as={`/model/${per.username}`}
                            >
                              <div key={per._id} className="participant-card">
                                <img
                                  alt="avatar"
                                  src={per.avatar || '/no-avatar.png'}
                                />
                                <div className="participant-info">
                                  <h5>{per.username}</h5>
                                  <p>{per.bio || '...'}</p>
                                </div>
                              </div>
                            </Link>
                          </Col>
                        ))
                      ) : (
                        <p>No info found.</p>
                      )}
                    </Row>
                  </TabPane>
                  <TabPane
                    tab={`Comment (${
                      videoStats && videoStats.comments
                        ? videoStats.comments
                        : 0
                    })`}
                    key="comment"
                  >
                    <CommentForm
                      creator={user}
                      onSubmit={this.onSubmitComment.bind(this)}
                      objectId={video._id}
                      requesting={
                        commentState.comment
                          ? commentState.comment.requesting
                          : false
                      }
                    />
                    {commentState.total > 0 && (
                      <ListComments
                        comments={commentState.items}
                        total={commentState.total}
                      />
                    )}
                    {commentState.requesting && <p>loading...</p>}
                    {!commentState.items && !commentState.requesting && (
                      <p className="text-center">Let be the first comment.</p>
                    )}
                    {commentState.total > 0 && canLoadMoreComment && (
                      <p className="text-center">
                        <Button
                          onClick={this.loadMoreComment.bind(this, video._id)}
                        >
                          i want more
                        </Button>
                      </p>
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </div>
            <div className="main-container">
              <div className="related-vid">
                <h4 className="ttl-1">You may also like</h4>
                {relatedVideos.requesting && <p>loading...</p>}
                {!relatedVideos.requesting && (
                  <RelatedListVideo videos={relatedVideos.items} />
                )}
              </div>
            </div>
          </Content>
        </Layout>
      </>
    );
  }
}
const mapStates = (state: any) => ({
  relatedVideos: { ...state.video.relatedVideos },
  commentState: { ...state.comment.comments },
  user: { ...state.user.current },
  ui: { ...state.ui }
});

const mapDispatch = {
  getRelated,
  getComments,
  moreComment,
  createComment
};
export default connect(mapStates, mapDispatch)(VideoViewPage);
