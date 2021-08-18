import { PureComponent, useRef } from 'react';
import {
  Layout,
  Tabs,
  Button,
  Form,
  Input,
  List,
  Comment,
  Avatar,
  Upload,
  Space,
  DatePicker,
  Modal,
  Tag,
  InputNumber,
  message,
  Tooltip,
} from 'antd';
import {
  SendOutlined,
  FileImageOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  DollarCircleOutlined,
  BarChartOutlined,
  HeartTwoTone,
  UnlockTwoTone,
} from '@ant-design/icons';
import { connect } from 'react-redux';
import Head from 'next/head';
import './posts.less';
import {
  IPostCreate,
  IPostSearch,
  IPostResponse,
  IUIConfig,
  IPerformer
} from '../../src/interfaces';
import { getPosts, createPost } from '../../src/redux/posts/actions';
const { Content } = Layout;
const { TabPane } = Tabs;
import { reactionService, paymentService, performerService, subscriptionService } from '@services/index';
import moment from 'moment';
import PerformerCard from '@components/performer/card';
import { getList } from '@redux/performer/actions';
import Link from 'next/link';
import { getResponseError } from '@lib/utils';

interface IProps {
  createPost: Function;
  getPosts: Function;
  posts: IPostResponse;
  ui: IUIConfig;
  currentUser: IPerformer;
  imageUrl?: string;
  uploadUrl?: string;
  headers?: any;
  onUploaded?: Function;
  onFileReaded?: Function;
  options?: any;
  performerState: any;
  getList: Function;
}

interface IState {
  loading: boolean;
  imageUrl: string;
}

const PostList = ({ posts, authorName, currentUser, onTipButtonClick, onLike, onUnlockPostClick }) => (
  <List
    size="large"
    dataSource={posts}
    header={`${posts.length} ${posts.length > 1 ? 'posts' : 'post'}`}
    itemLayout="horizontal"
    renderItem={(item: any) => (
      <List.Item key={item.slug}>
        <div className="post_item">
          <div className={`post_media ${(item && item.postPrice != '0' && !currentUser.isPerformer) ? 'lock_post' : ''}`}>
            {(item.filePath && (item.filePath.split(/[#?]/)[0].split('.').pop().trim() === 'jpg' || item.filePath.split(/[#?]/)[0].split('.').pop().trim() === 'png')) ? <img className="image-css"
              width={272}
              alt="logo"
              src={item.filePath}
            /> :
              (item.filePath && <video controls height="100%" width="100%">
                <source src={item.filePath} type="video/mp4" /></video>)}
          </div>
          <div className="post_meta_content">
            <div className="active_tag">
            <span>{item.postPrice != '0' ? `$${item.postPrice}` : null}</span>
              {currentUser && currentUser._id && !currentUser.isPerformer &&  <>              
              {/* unlock post icon */}
              {item && item.postPrice != '0' && <Tooltip title="Unlock the post"><UnlockTwoTone twoToneColor='#7b5dbd' className="unlock_icon" onClick={()=>onUnlockPostClick(item.postPrice, item.authorId, item.fileId)} /></Tooltip>}

            {/* send tip button */}
            
            <Tooltip title="Tip the model"><Tag.CheckableTag checked={true}>
            <span className="message-performer" onClick={()=>onTipButtonClick(item.authorId)} >Tip</span>
            </Tag.CheckableTag></Tooltip>
            {/* message button */}
            <Tooltip title="Message the model"><Tag.CheckableTag checked={true}>
                <Link
            href={{
              pathname: '/messages',
              query: {
                toSource: 'performer',
                toId: (item.authorId) || ''
              }
            }}
          >
          <span className="message-performer">Message</span>  
          </Link></Tag.CheckableTag>
          </Tooltip></>}
          {currentUser && currentUser._id && !currentUser.isPerformer && <Tooltip title={item.isLiked ? "Liked" : "Like the post"}><HeartTwoTone onClick={()=>onLike(item._id, currentUser._id, item.isLiked)} className="like-icon" twoToneColor={item.isLiked ? "#eb2f96" : "rgb(123, 93, 189)"} style={{fontSize: '18px'}} /></Tooltip>}

              {currentUser && currentUser._id && currentUser.isPerformer && <>{((item.expiryTime === '' || (Date.parse(item.expiryTime) > Date.parse(moment(new Date()).format('YYYY-MM-DD HH:mm:ss')))) && (item.scheduleDateTime === '' || (Date.parse(item.scheduleDateTime) < Date.parse(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'))))) ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>}</>}
              </div>
            <List.Item.Meta
              avatar={
                <Avatar src={item.avatar || '/no-avatar.png'} />
              }
              title={authorName}
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

const Editor = ({ onChange, onSubmit, submitting, value, onScheduleChange, onExpirationChange, onPriceChange, onFileChange, onPollChange }) => (
  <>
    <Form
      initialValues={{ remember: true, gender: 'male', country: 'US' }}
    >
      <Form.Item>
        <Input.TextArea rows={4} onChange={onChange} value={value} placeholder="Enter description here..." />
        <div className="submit_post_action">
          <span className="post-icons">
            <Space direction="vertical" style={{ width: '20%' }} size="large">
              <Upload
                listType="picture"
                onChange={onFileChange.bind(this)}
              >
                <Tooltip title="Select image(jpeg, png)/video(mp4)" placement="bottom"><FileImageOutlined /></Tooltip>
              </Upload>
            </Space>
            <Tooltip title="Schedule post" placement="bottom"><CalendarOutlined onClick={onScheduleChange} /></Tooltip>
            <Tooltip title="Put an expiry date" placement="bottom"><FieldTimeOutlined onClick={onExpirationChange} /></Tooltip>
            <Tooltip title="Create a poll" placement="bottom"><BarChartOutlined onClick={onPollChange} /></Tooltip>
            <Tooltip title="Put a price to unlock the post" placement="bottom"><DollarCircleOutlined onClick={onPriceChange} /></Tooltip>
          </span>
          <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
            <SendOutlined />
          </Button>
        </div>
      </Form.Item>
    </Form>
  </>
);

class Posts extends PureComponent<IProps> {
  constructor(props) {
    super(props);
  }

  state = {
    submitting: false,
    value: '',
    schedule: '',
    isModalVisible: false,
    isExpirationModelVisible: false,
    scheduleDateTimeVisible: false,
    scheduleDateTime: '',
    expiryTime: '',
    expiryTimeVisible: false,
    isPriceModalVisible: false,
    priceVisible: false,
    postPrice: 0,
    performerName: '',
    performerPhotoUrl: '',
    file: '',
    performerId: '',
    isPollModalVisible: false,
    optionOne: '',
    optionTwo: '',
    optionThree: '',
    isPoll: false,
    subscribedPosts: '',
    offset: 0,
    limit: 12,
    currentPage: 1,
    sidebarPosts: [],
    tipValue: 10,
    isTipModalVisible: false,
    modelIdForTip: '',
    topPerformers: [],
    activeUserPosts: [],
  } 

  async handleTipOk(performerId: string, userId: string) {
    const { tipValue } = this.state;
    try {
      const pay = await (await paymentService.sendTip(performerId, userId, tipValue)).data;
      if (pay) {
        this.setState({isTipModalVisible: false})
        message.success('Redirecting to payment method');
        window.location.href = pay.paymentUrl;
      }
    } catch (err) {
      this.setState({isTipModalVisible: false})
      err.then((error: any)=>{
        message.error(error.message)
      })
    }
  };

  onTipChange = (tip) => {
    this.setState({tipValue: tip});
  }

  sendTipModal = (performerId: string) => {
    this.setState({modelIdForTip: performerId, isTipModalVisible: !this.state.isTipModalVisible});
  }

  async componentDidMount() {
    const { getPosts: getPostHandler, currentUser, getList: getListHandler, posts } = this.props;
    const { limit, offset } = this.state;
    
    currentUser.isPerformer  ? await getPostHandler({
      performerId: currentUser._id,
      userId: 'GET_ALL_POSTS'
    })
    :
    await getPostHandler({
      performerId: 'GET_ALL_POSTS',
      userId: currentUser._id
    });
    posts ? this.filterInactivePosts(posts) : null;    
    getListHandler({
      limit,
      offset,
      status: 'active'
    });
    this.setState({ performerName: currentUser.name, performerPhotoUrl: currentUser.avatarPath, performerId: currentUser._id });
    this.getTopPerformer();    
  }

  async componentDidUpdate(prevProps) {
    const { posts, getPosts: getPostHandler, currentUser } = this.props;
 
    if (prevProps.posts.posts.items.length !== posts.posts.items.length) {
      this.setState({ submitting: false, value: '', schedule: '', scheduleDateTime: '', expiryTime: '', file: '', scheduleDateTimeVisible: false, expiryTimeVisible: false, priceVisible: false, optionOne: '', optionTwo: '', optionThree: '', postPrice: '' });      
      currentUser.isPerformer  ? await getPostHandler({
        performerId: currentUser._id,
        userId: 'GET_ALL_POSTS'
      })
      :
      await getPostHandler({
        performerId: 'GET_ALL_POSTS',
        userId: currentUser._id
      });
      this.filterInactivePosts(posts);
    } 
    if(JSON.stringify(prevProps.posts.posts.items) !== JSON.stringify(posts.posts.items)) {
      this.filterInactivePosts(posts);
    }
  }

  // show only active posts to the user
  async filterInactivePosts(posts: any) {
      const activePosts = await posts['posts'].items.filter(item=>

        ((item.expiryTime === '' || (Date.parse(item.expiryTime) > Date.parse(moment(new Date()).format('YYYY-MM-DD HH:mm:ss')))) && (item.scheduleDateTime === '' || (Date.parse(item.scheduleDateTime) < Date.parse(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'))))) ? true : false
      );
      this.setState({activeUserPosts: activePosts});
  }

  // get subscribed models
  async getSubscribedModels(topPerformers) {
    // const { topPerformers } = this.state;
    try {
      await this.setState({ loading: true });
      const filter = {};
      let sort = 'decs';
      let sortBy = 'updatedAt';
      const resp = await subscriptionService.userSearch({
        ...filter,
        sort,
        sortBy,
        limit: 10,
        offset: 0
      });
      await this.filterTopPerformers(topPerformers, resp.data.data);
    } catch (error) {
      message.error(
        getResponseError(error) || 'An error occured. Please try again.'
      );
    } finally {
      this.setState({ loading: false });
    }
  }

  async filterTopPerformers(topPerformers, subscribedPerformers) {
    let filteredSubscribers = [];
    topPerformers.forEach((singlePerformer)=>{
      const isSubscribed = subscribedPerformers.map(item => item.performerId === singlePerformer._id ? true :  false);
      if(isSubscribed[0]) {
        Object.assign(singlePerformer, { 'isSubscribed': true });
      }
      else {
        Object.assign(singlePerformer, { 'isSubscribed': false });
      }
      filteredSubscribers.push(singlePerformer);
    });
    this.setState({topPerformers: filteredSubscribers});
  }

  // fetch top performers for suggestion`
  async getTopPerformer() {
    try {
      const { limit } = this.state;
      const resp = await performerService.getTopPerformer({
        limit
      });
      await this.getSubscribedModels(resp.data.data);
    } catch (error) {
      message.error(getResponseError(error));
    }
  }

  // handle the like functionality on the posts
  async handleLikeOnPost(postId: string, userId: string, isLiked: boolean) {
    try {
      const { currentUser, getPosts:getPostHandler, posts } = this.props;
      let payload = {
        objectType: 'post',
        objectId: postId,
        createdBy: userId,
        action: 'like',
      }
      if(!isLiked) {
          const likeData = await reactionService.create(payload);
          if(likeData) {
            message.success("Post liked successfully!");
            await getPostHandler({
              performerId: 'GET_ALL_POSTS',
              userId: currentUser._id
            });
            this.filterInactivePosts(posts)
          } 
        }                 
        else {
          message.error("You already liked this post!")
        }
    }
    catch (err) {
      console.log(err)
    }
  }

  handleSubmit = () => {
    const { createPost: handleCreatePost, currentUser } = this.props;
    if (!this.state.value) {
      message.error('Please enter post description!')
      return;
    }

    this.setState({
      submitting: true
    });

    const data = {
      authorId: currentUser._id,
      content: this.state.value,
      author: this.state.performerName,
      scheduleDateTime: this.state.scheduleDateTime,
      expiryTime: this.state.expiryTime,
      postPrice: this.state.postPrice,
      file: this.state.file,
      optionOne: this.state.optionOne,
      optionTwo: this.state.optionTwo,
      optionThree: this.state.optionThree,
      isPoll: this.state.isPoll
    }
    return handleCreatePost(data);
  };

  handleChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  scheduleModelHandler = e => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  }

  expirationModelHandler = e => {
    this.setState({ isExpirationModelVisible: !this.state.isExpirationModelVisible });
  }

  priceModalHandler = e => {
    this.setState({ isPriceModalVisible: !this.state.isPriceModalVisible })
  }

  handleCancel = () => {
    this.setState({ isModalVisible: false, isTipModalVisible: false });
  };

  handleExpireCancel = () => {
    this.setState({ isExpirationModelVisible: false });
  };

  handlePriceCancel = () => {
    this.setState({ isPriceModalVisible: false });
  }

  handlePollModal = () => {
    this.setState({ isPollModalVisible: !this.state.isPollModalVisible })
  }

  onScheduleChange = (e) => {
    this.setState({ scheduleDateTimeVisible: true, scheduleDateTime: e.format("YYYY-MM-DD HH:mm:ss") })
  }

  returnRef = () => {
    return useRef(null);
  }

  // handling the expiry date of post
  handleExpireDate = (value: number | string) => {
    var scheduledTime: any = '';
    this.state.scheduleDateTime ? scheduledTime = this.state.scheduleDateTime : scheduledTime = moment().format("YYYY-MM-DD HH:mm:ss")
    var expiryTime: any;
    expiryTime = moment(scheduledTime, "YYYY-MM-DD").add(1, 'days');
    if (value === 1) {
      expiryTime = moment(scheduledTime, "YYYY-MM-DD").add(1, 'days');
    }
    else if (value === 3) {
      expiryTime = moment(scheduledTime, "YYYY-MM-DD").add(3, 'days');
    }
    else if (value === 7) {
      expiryTime = moment(scheduledTime, "YYYY-MM-DD").add(7, 'days');
    }
    else {
      expiryTime = '';
    }
    expiryTime ? this.setState({ expiryTime: expiryTime.format("YYYY-MM-DD HH:mm:ss"), expiryTimeVisible: true }) : this.setState({ expiryTime: '', expiryTimeVisible: false });
  }

  // handling the price of post
  handlePostPriceChange = (price: number) => {
    this.setState({ priceVisible: true, postPrice: price })
  }

  // handling the image or video upload
  handleFileChange = (info: any) => {
    if (info.file.status === 'done') {
      this.setState({ file: info.file })
    }
  }

  onPollOptionsChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    event.target.value != '' ? this.setState({ isPoll: true }) : this.setState({ isPoll: false })
  }

  // unlocking the paid posts
  async unlockPost(postPrice: number, performerId: string, fileId: string) {
    try {
      const { currentUser } = this.props;
      const pay = await (await paymentService.purchaseMedia(performerId, currentUser._id, fileId, postPrice)).data;
      if (pay) {
        message.success('Redirecting to payment method');
        window.location.href = pay.paymentUrl;
      }
    } catch (e) {
      // console.log(e)
    }
  }

  render() {
    const { ui, posts, currentUser, performerState = {
      requesting: false,
      error: null,
      success: false,
      data: null
    }, } = this.props;
    
    const performers = performerState.data && performerState.data.data
      ? performerState.data.data
      : [];
    const { submitting, value, isModalVisible, isExpirationModelVisible, scheduleDateTimeVisible, scheduleDateTime, expiryTime, expiryTimeVisible, isPriceModalVisible, priceVisible, postPrice, isPollModalVisible, optionOne, optionTwo, optionThree, subscribedPosts, isTipModalVisible, modelIdForTip, topPerformers, activeUserPosts } = this.state;
    return (
      <>
      {/* send tip modal */}
      <Modal title="Send a Tip" visible={isTipModalVisible} onOk={()=>this.handleTipOk(modelIdForTip, currentUser._id)} onCancel={this.handleCancel}>
          <div><span>Tip Amount </span>
            <InputNumber
              defaultValue={10}
              min={10}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              onChange={this.onTipChange}
            />
          </div>
        </Modal>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            |
            {' '}
            {'Posts'}
          </title>
        </Head>
        <Layout>
          <Content>
            {/* Modal to schedule a post */}
            <Modal title="Schedule Post" visible={isModalVisible} onOk={this.handleCancel} onCancel={this.handleCancel}>
              <DatePicker format="YYYY-MM-DD HH:mm:ss" showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }} onChange={this.onScheduleChange} />
              {/* Modal to set expiry date of the post */}
            </Modal>
            <Modal title="Expiration Period" visible={isExpirationModelVisible} onOk={this.handleExpireCancel} onCancel={this.handleExpireCancel}>
              <Button onClick={() => { this.handleExpireDate(1) }}>1 Day</Button>
              <Button onClick={() => { this.handleExpireDate(3) }} className="expire-date-buttons">3 Days</Button>
              <Button onClick={() => { this.handleExpireDate(7) }} className="expire-date-buttons">7 Days</Button>
              <Button onClick={() => { this.handleExpireDate('no limit') }} className="expire-date-buttons">No Limit</Button>
            </Modal>
            {/* Modal to set the price to unlock the post */}
            <Modal title="Put a Price to Unlock the Post" visible={isPriceModalVisible} onOk={this.handlePriceCancel} onCancel={this.handlePriceCancel}>
              <InputNumber min={0} defaultValue={0} onChange={this.handlePostPriceChange} formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Modal>
            {/* modal to post a poll */}
            <Modal title="Initialize a Poll" visible={isPollModalVisible} onOk={this.handlePollModal} onCancel={this.handlePollModal}>
              <div style={{ marginBottom: 16 }}>
                <Input placeholder="Add option" value={optionOne} name="optionOne" onChange={this.onPollOptionsChange} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Input placeholder="Add option" value={optionTwo} name="optionTwo" onChange={this.onPollOptionsChange} disabled={this.state.optionOne === ''} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Input placeholder="Add option" value={optionThree} name="optionThree" onChange={this.onPollOptionsChange} disabled={this.state.optionTwo === ''} />
              </div>
            </Modal>
            <div className="ligh_bg">
            <div className="main-container">
              <div className="main_post_wrap">
              <div className="newPost_wrap">
                
                  <div className="post_comment_filed">
                    <h1 className="post_page_heading">Posts</h1>
                    {currentUser && currentUser._id && currentUser.isPerformer && <Comment
                      content={
                        <Editor
                          onChange={this.handleChange}
                          onSubmit={this.handleSubmit}
                          submitting={submitting}
                          value={value}
                          onScheduleChange={this.scheduleModelHandler}
                          onExpirationChange={this.expirationModelHandler}
                          onPriceChange={this.priceModalHandler}
                          onFileChange={this.handleFileChange}
                          onPollChange={this.handlePollModal}
                        />
                      }
                    />}
                  </div>
                  <Tag closable visible={scheduleDateTimeVisible} onClose={() => this.setState({ scheduleDateTimeVisible: false })}>Post will be visible on {scheduleDateTime}</Tag>
                  <Tag closable visible={expiryTimeVisible} onClose={() => this.setState({ expiryTimeVisible: false })}>Post will expire on {expiryTime}</Tag>
                  <Tag closable visible={priceVisible} onClose={() => this.setState({ priceVisible: false })}>Price is ${postPrice}</Tag>
                  <div>
                    <Tag closable visible={this.state.optionOne != ''} onClose={() => this.setState({ optionOne: '' })}>Poll option: {this.state.optionOne}</Tag>
                    <Tag closable visible={this.state.optionTwo != ''} onClose={() => this.setState({ optionTwo: '' })}>Poll option: {this.state.optionTwo}</Tag>
                    <Tag closable visible={this.state.optionThree != ''} onClose={() => this.setState({ optionThree: '' })}>Poll option: {this.state.optionThree}</Tag>
                  </div>
                  {/* posts list */}
                  { (activeUserPosts && activeUserPosts.length > 0 && <PostList posts={activeUserPosts} authorName={currentUser.name} currentUser={currentUser}  onTipButtonClick={this.sendTipModal} onLike={this.handleLikeOnPost.bind(this)} onUnlockPostClick={this.unlockPost.bind(this)} />)}
                  {!currentUser.isPerformer && (activeUserPosts && activeUserPosts.length === 0 && <div>No posts</div>)}
                </div>
                  {/* sidebar posts */}

                  {!currentUser.isPerformer && <div className="rightSidebar">
                    <div className="sidebarBlock">
                      <h4>Suggestions</h4>
                      <div className="suggestions_list">
                        {topPerformers.length > 0
                          && topPerformers.map((p: any) => (
                            <PerformerCard performer={p} />
                          ))}
                      </div>
                    </div>
            </div>}
            
            </div>
            </div>
            </div>
          </Content>
        </Layout>
      </>
    )
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui },
  posts: { ...state.post },
  currentUser: { ...state.user.current },
  performerState: { ...state.performer.performerListing }
});

const mapDispatchToProps = {
  getPosts,
  createPost,
  getList
};

export default connect(mapStatesToProps, mapDispatchToProps)(Posts) as any;