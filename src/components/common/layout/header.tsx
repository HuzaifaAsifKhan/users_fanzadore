import { PureComponent } from 'react';
import {
  Layout, Menu, Avatar, Badge, Tooltip
} from 'antd';
import { connect } from 'react-redux';
import Link from 'next/link';
import { IUser } from 'src/interfaces';
import { logout } from '@redux/auth/actions';
import {
  ShoppingCartOutlined, MessageOutlined, HomeOutlined,
  ContactsOutlined, StarOutlined, BellOutlined, HeartOutlined
} from '@ant-design/icons';
import './header.less';
import { withRouter } from 'next/router';
import { addCart } from 'src/redux/cart/actions';
import { cartService, messageService, authService, performerService } from 'src/services';
import { Event, SocketContext } from 'src/socket';
import SearchBar from './search-bar';

interface IProps {
  currentUser?: IUser;
  logout?: Function;
  router: any;
  ui?: any;
  cart?: any;
  addCart: Function;
  posts: any
}

class Header extends PureComponent<IProps> {
  state = {
    totalNotReadMessage: 0,
    totalNotReadNotifications: 0,
    subscriberNotifications: 0,
    tipsNotification: 0
  };

  async componentDidMount() {
    const { cart, currentUser, addCart: addCartHandler } = this.props;
    if (process.browser) {
      if (!cart || (cart && cart.items.length <= 0)) {
        if (currentUser._id) {
          const existCart = await cartService.getCartByUser(currentUser._id);
          if (existCart && existCart.length > 0) {
            addCartHandler(existCart);
          }
        }
      }
    }
  }

  async componentDidUpdate(prevProps: any) {
    const { cart, currentUser, addCart: addCartHandler } = this.props;
    localStorage.setItem('username', currentUser.username)
    if (prevProps.currentUser !== currentUser) {
      if (!cart || (cart && cart.items.length <= 0)) {
        if (currentUser._id && process.browser) {
          const existCart = await cartService.getCartByUser(currentUser._id);
          if (existCart && existCart.length > 0) {
            addCartHandler(existCart);
          }
        }
      }
      if (currentUser && currentUser._id) {
        const data = await (await messageService.countTotalNotRead()).data;
        const notificationData = await performerService.getNotificationCount(currentUser.username);              
        if (data) {
          // eslint-disable-next-line react/no-did-update-set-state
          this.setState({ totalNotReadMessage: data.total });
        }
        if (notificationData) {
          this.setState({ subscriberNotifications: notificationData, totalNotReadNotifications: notificationData});
        }       
      }
    }
  }

  async handleMessage(event) {
    event && this.setState({ totalNotReadMessage: event.total });
  }

  async beforeLogout() {
    const { logout: logoutHandler } = this.props;
    const token = authService.getToken();
    const socket = this.context;
    token
      && socket
      && (await socket.emit('auth/logout', {
        token
      }));
    socket && socket.close();
    logoutHandler();
  }

  render() {
    const {
      currentUser, router, ui, cart, posts
    } = this.props;
    const { totalNotReadMessage, totalNotReadNotifications, tipsNotification } = this.state;
    const rightContent = [
      <Menu key="user" mode="horizontal">
        {currentUser.isPerformer && (
        <Menu.SubMenu
          title={(
            <>
              <Avatar src={currentUser?.avatar || '/no-avatar.png'} />
            </>
          )}
        >
          <Menu.Item key="settings">
            <Link href={currentUser.isPerformer ? '/model/account' : '/user/account'}>
              <a>My Account</a>
            </Link>
          </Menu.Item>
          <Menu.Item key="posts">
            <Link href="/posts">
              <a>My Posts</a>
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href="/messages">
              <a>Messages</a>
            </Link>
          </Menu.Item>
          {/* <Menu.Item key="store-manager">
            <Link href="/model/store-manager">
              <a>My Store</a>
            </Link>
          </Menu.Item> */}
          <Menu.Item key="my-subscriber">
            <Link href="/model/my-subscriber">
              <a>Subscribers</a>
            </Link>
          </Menu.Item>
          {/* <Menu.Item key="my-order">
            <Link href="/model/order-manager">
              <a>Orders</a>
            </Link>
          </Menu.Item> */}
          <Menu.Item key="earning">
            <Link href="/model/earning">
              <a>Earnings</a>
            </Link>
          </Menu.Item>
          <Menu.Item key="top-model">
            <Link href={{ pathname: '/model/top-models' }} as="/top-models">
              <a>Top Models</a>
            </Link>
          </Menu.Item>
          <Menu.Item key="SignOut" onClick={() => this.beforeLogout()}>
            <a>Sign Out</a>
          </Menu.Item>
        </Menu.SubMenu>
        )}
        {!currentUser.isPerformer && (
          <Menu.SubMenu
            title={(
              <>
                <Avatar src={currentUser?.avatar || '/no-avatar.png'} />
              </>
            )}
          >
            <Menu.Item key="favourite-video">
              <Link href="/user/my-favourite">
                <a>My Favourite</a>
              </Link>
            </Menu.Item>
            <Menu.Item key="watch-late-video">
              <Link href="/user/my-wishlist">
                <a>My Wishlist</a>
              </Link>
            </Menu.Item>
            <Menu.Item key="my-subscription">
              <Link href="/user/my-subscription">
                <a>My Subscription</a>
              </Link>
            </Menu.Item>
            <Menu.Item key="payment-history">
              <Link href="/user/payment-history">
                <a>Payment History</a>
              </Link>
            </Menu.Item>
            <Menu.Item key="SignOut" onClick={() => this.beforeLogout()}>
              <a>Sign Out</a>
            </Menu.Item>
          </Menu.SubMenu>
        )}
      </Menu>
    ];

    return (
      <div className="bg-black">
        <Event
          event="nofify_read_messages_in_conversation"
          handler={this.handleMessage.bind(this)}
        />
        <div className="main-container">
          <Layout.Header className="header" id="layoutHeader">
            <div
              className="nav-bar"
            >
              <div className="left-conner">
              {currentUser._id && (
                <Link href="/home">
                  <a className="logo-nav">
                    <img
                      alt="logo"
                      src={ui && ui.logo ? ui.logo : '/logo-new.jpg'}
                      height="64"
                    />
                  </a>
                </Link>
              )}

              {!currentUser._id && (
                <Link href="/">
                  <a className="logo-nav">
                    <img
                      alt="logo"
                      src={ui && ui.logo ? ui.logo : '/logo-new.jpg'}
                      height="64"
                    />
                  </a>
                </Link>
              )}



                {/* <Link href="/home">
                  <a className="logo-nav">
                    <img
                      alt="logo"
                      src={ui && ui.logo ? ui.logo : '/logo-new.jpg'}
                      height="64"
                    />
                  </a>
                </Link> */}
                <SearchBar />
              </div>
              <div className="mid-conner">
                <ul className="nav-icons">
                  {currentUser
                    && currentUser.isPerformer && (
                      <li
                        className={
                          router.asPath === `/model/${currentUser.username}`
                            ? 'active'
                            : ''
                        }
                      >
                        <Link
                          href={{
                            pathname: '/model/profile',
                            query: { username: currentUser.username }
                          }}
                          as={`/model/${currentUser.username}`}
                        >
                          <Tooltip title="My Profile">
                            <a><HomeOutlined /></a>
                          </Tooltip>
                        </Link>
                      </li>
                  )}
                  {currentUser && currentUser._id
                    && !currentUser.isPerformer && (
                      <li
                        className={router.pathname === '/home' ? 'active' : ''}
                      >
                        <Link href="/home">
                          <Tooltip title="Home">
                            <a><HomeOutlined /></a>
                          </Tooltip>
                        </Link>
                      </li>
                    )}
                  {currentUser && currentUser._id && !currentUser.isPerformer && (
                    <li className={router.pathname === '/posts' ? 'active' : ''}>
                      <Link href="/posts">
                        <Tooltip title="Posts">
                          <a>
                            <HeartOutlined />
                          </a>
                        </Tooltip>
                      </Link>
                    </li>
                  )}                  
                  {currentUser && currentUser._id && (
                    <li
                      className={
                        router.pathname === '/messages' ? 'active' : ''
                      }
                    >
                      <Link href="/messages">
                        <Tooltip title="Messenger">
                          <a>
                            <MessageOutlined />
                            <Badge
                              className="cart-total"
                              count={totalNotReadMessage}
                              showZero
                            />
                          </a>
                        </Tooltip>
                      </Link>
                    </li>
                  )}
                  {currentUser && currentUser._id && (
                    <li
                      className={
                        router.pathname === '/model/my-subscriber' ? 'active' : ''
                      }
                    >
                        <Menu key="notifications" mode="horizontal">
                        {currentUser.isPerformer && (
                          <Menu.SubMenu title={(
                              <a>
                                <BellOutlined />
                                <Badge className="cart-total" count={totalNotReadNotifications} showZero />
                              </a>
                          )}>
                            <Menu.Item key="my-subscribers"><Link href="/model/my-subscriber"><a>New Subscribers ({totalNotReadNotifications})</a></Link></Menu.Item>
                            <Menu.Item key="tip-to-me"><a>New Tip ({tipsNotification})</a></Menu.Item>
                          </Menu.SubMenu>
                        )}
                        </Menu>
                    </li>
                  )}
                  {!currentUser._id && (
                    <li className={router.pathname === '/auth/register' ? '' : ''}>
                      <Link href="/auth/register">
                        <a>ADORE</a>
                      </Link>
                    </li>
                  )}
                  {!currentUser._id && (
                    <li className={router.pathname === '/auth/register' ? '' : ''}>
                      <Link href={{ pathname: '/auth/register', query: { registerAs: 'performer' }}}>
                        <a>BE ADORED</a>
                      </Link>
                    </li>
                  )}
                  {!currentUser._id && (
                    <li
                      className={
                        router.pathname === '/auth/login' ? 'active' : ''
                      }
                    >
                      <Link href="/auth/login">
                        <a>LOGIN</a>
                      </Link>
                    </li>
                  )}
                  {currentUser._id && (
                    <li className="no-pad">{rightContent}</li>
                  )}
                </ul>
              </div>
            </div>
          </Layout.Header>
        </div>
      </div>
    );
  }
}

Header.contextType = SocketContext;
const mapState = (state: any) => ({
  currentUser: state.user.current,
  ui: state.ui,
  cart: state.cart,
  posts: state.post,
});
const mapDispatch = { logout, addCart };
export default withRouter(connect(mapState, mapDispatch)(Header)) as any;
