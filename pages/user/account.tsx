import { PureComponent } from 'react';
import { Layout, Tabs, message } from 'antd';
import Head from 'next/head';
import { connect } from 'react-redux';
import { UserAccountForm } from '@components/user/account-form';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import { IUser, IUserFormData } from 'src/interfaces/user';
import { authService } from '@services/auth.service';
import { userService } from '@services/user.service';
import {
  updateUser,
  updateCurrentUserAvatar,
  updatePassword
} from 'src/redux/user/actions';
import { getResponseError } from '@lib/utils';
import './index.less';
import { IUIConfig } from 'src/interfaces';

interface IProps {
  name: string;
  username: string;
  email: string;
  onFinish(): Function;
  user: IUser;
  updating: boolean;
  updateUser: Function;
  updateCurrentUserAvatar: Function;
  updatePassword: Function;
  updateSuccess: boolean;
  error: any;
  ui: IUIConfig;
}
interface IState {
  pwUpdating: boolean;
}

const { Content } = Layout;

class UserAccountSettingPage extends PureComponent<IProps, IState> {
  static authenticate = true;

  constructor(props: IProps) {
    super(props);
    this.state = { pwUpdating: false };
  }

  componentDidUpdate(preProps: IProps) {
    const { error, updateSuccess } = this.props;
    if (error !== preProps.error) {
      message.error(getResponseError(error));
    }
    if (updateSuccess && updateSuccess !== preProps.updateSuccess) {
      message.success('Changes saved.');
    }
  }

  onFinish(data: IUserFormData) {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.updateUser(data);
  }

  uploadAvatar(data) {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.updateCurrentUserAvatar(data.response.data.url);
  }

  updatePassword(data: any) {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.updatePassword(data.password);
  }

  render() {
    const { user, updating, ui } = this.props;
    const { pwUpdating } = this.state;
    const uploadHeader = {
      authorization: authService.getToken()
    };
    return (
      <Layout>
        <Head>
          <title>
            {' '}
            {ui && ui.siteName}
            {' '}
            | My Account
            {' '}
          </title>
        </Head>
        <Content>
          <div className="main-container user-account">
            <Tabs
              defaultActiveKey="user-profile"
              tabPosition="top"
              className="nav-tabs"
            >
              <Tabs.TabPane tab={<span>Basic Information</span>} key="basic">
                <UserAccountForm
                  onFinish={this.onFinish.bind(this)}
                  updating={updating}
                  user={user}
                  options={{
                    uploadHeader,
                    avatarUrl: userService.getAvatarUploadUrl(),
                    uploadAvatar: this.uploadAvatar.bind(this)
                  }}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Change password</span>} key="password">
                <UpdatePaswordForm
                  onFinish={this.updatePassword.bind(this)}
                  updating={pwUpdating}
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </Content>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  user: state.user.current,
  updating: state.user.updating,
  error: state.user.error,
  updateSuccess: state.user.updateSuccess,
  ui: state.ui
});
const mapDispatch = { updateUser, updateCurrentUserAvatar, updatePassword };
export default connect(mapStates, mapDispatch)(UserAccountSettingPage);
