import { PureComponent } from 'react';
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  Upload,
  Progress,
  message,
  Checkbox
} from 'antd';
import { IPerformer, ICountry } from 'src/interfaces';
import { AvatarUpload } from '@components/user/avatar-upload';
import { ImageUpload } from '@components/file/image-upload';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const { TextArea } = Input;

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!'
  },
  number: {
    // eslint-disable-next-line no-template-curly-in-string
    range: 'Must be between ${min} and ${max}'
  }
};

interface IProps {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
  options?: {
    uploadHeaders?: any;
    avatarUploadUrl?: string;
    onAvatarUploaded?: Function;
    coverUploadUrl?: string;
    onCoverUploaded?: Function;
    beforeUpload?: Function;
    videoUploadUrl?: string;
    onVideoUploaded?: Function;
    uploadPercentage?: number;
  };
  countries?: ICountry[];
}

export class PerformerAccountForm extends PureComponent<IProps> {
  state = {
    isUploadingVideo: false,
    uploadVideoPercentage: 0,
    previewVideo: null,
    checked: false
  };

  componentDidMount() {
    const { user } = this.props;
    const { previewVideo } = this.state;
    user
      && user.welcomeVideoPath
      && this.setState(
        {
          previewVideo: user.welcomeVideoPath
        },
        () => {
          if (previewVideo) {
            const video = document.getElementById('video') as HTMLVideoElement;
            video.setAttribute('src', previewVideo);
          }
        }
      );
  }

  handleVideoChange = (info: any) => {
    info.file
      && info.file.percent
      && this.setState({ uploadVideoPercentage: info.file.percent });
    if (info.file.status === 'uploading') {
      this.setState({ isUploadingVideo: true });
      return;
    }
    if (info.file.status === 'done') {
      message.success('Welcome video uploaded');
      this.setState(
        {
          isUploadingVideo: false,
          previewVideo: info.file.response.data && info.file.response.data.url
        },
        () => {
          const { previewVideo } = this.state;
          if (previewVideo) {
            const video = document.getElementById('video') as HTMLVideoElement;
            video.setAttribute('src', previewVideo);
          }
        }
      );
    }
  };

  handleCheckbox(e) {
    this.setState({ checked: e.target.checked });
  }

  render() {
    const {
      onFinish, user, updating, countries, options
    } = this.props;

    const {
      uploadHeaders,
      avatarUploadUrl,
      onAvatarUploaded,
      coverUploadUrl,
      onCoverUploaded,
      videoUploadUrl
    } = options;
    const {
      isUploadingVideo,
      uploadVideoPercentage,
      previewVideo,
      checked
    } = this.state;
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={(values) => {
          // eslint-disable-next-line no-param-reassign
          values.activateWelcomeVideo = checked;
          onFinish(values);
        }}
        validateMessages={validateMessages}
        initialValues={user}
        labelAlign="left"
        className="account-form"
      >
        <Row>
          <Col md={12}>
            <Form.Item
              name="firstName"
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please input your first name!' },
                {
                  pattern: new RegExp(
                    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
                  ),
                  message:
                    'First name can not contain number and special character'
                }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item
              name="lastName"
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please input your last name!' },
                {
                  pattern: new RegExp(
                    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
                  ),
                  message:
                    'Last name can not contain number and special character'
                }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item name="username">
              <Input disabled placeholder="username" />
            </Form.Item>
          </Col>
          {/* <Col md={12}>
            <Form.Item name="email">
              <Input disabled placeholder="email" />
            </Form.Item>
          </Col> */}
          <Col md={12}>
            <Form.Item name="country" rules={[{ required: true }]}>
              <Select
                placeholder="Select your country"
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase())
                  >= 0}
              >
                {countries
                  && countries.length > 0
                  && countries.map((c) => (
                    <Option value={c.code} key={c.code}>
                      {c.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item 
            name="city"
            validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please input city!' }
              ]}
            >
              <Input placeholder="Enter the city" />
            </Form.Item>
          </Col>
          {/* <Col md={12}>
            <Form.Item name="state">
              <Input placeholder="Enter the state" />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item name="address">
              <Input placeholder="Enter the address" />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item name="zipcode">
              <Input placeholder="Zip code" />
            </Form.Item>
          </Col> */}
          <Col md={12}>
            <Form.Item name="height">
              <Input placeholder="Height" />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item name="weight">
              <Input placeholder="Weight" />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item name="eyes">
              <Input placeholder="Eyes" />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item name="gender">
              <Select>
                <Select.Option value="male" key="male">
                  Male
                </Select.Option>
                <Select.Option value="female" key="female">
                  Female
                </Select.Option>
                <Select.Option value="transgender" key="transgender">
                  Transgender
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item name="sexualPreference">
              <Input placeholder="Sexual Preference" />
            </Form.Item>
          </Col>
          {/* <Col md={24}>
            <Form.Item name="bio">
              <TextArea rows={3} placeholder="Bio" />
            </Form.Item>
          </Col>
          <Col md={24}>
            <Form.Item label="Avatar">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <div>
                  <AvatarUpload
                    headers={uploadHeaders}
                    uploadUrl={avatarUploadUrl}
                    onUploaded={onAvatarUploaded}
                    imageUrl={user.avatar}
                  />
                </div>
                <div>Support all types of Image. Max upload size is 5MB!</div>
              </div>
            </Form.Item>
          </Col>
          <Col md={24}>
            <Form.Item label="Cover">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <div>
                  <ImageUpload
                    headers={uploadHeaders}
                    uploadUrl={coverUploadUrl}
                    onUploaded={onCoverUploaded}
                    imageUrl={user.cover}
                    options={{ fieldName: 'cover' }}
                  />
                </div>
                <div>Ratio dimension is 4:1 (eg 1600px:400px). Max upload size is 5MB!</div>
              </div>
            </Form.Item>
          </Col>
          <Col md={24}>
            <Form.Item label="Welcome Video">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <div className="ant-col ant-col-16 ant-form-item-control">
                  <Upload
                    accept={'video/*'}
                    name="welcome-video"
                    showUploadList={false}
                    action={videoUploadUrl}
                    headers={uploadHeaders}
                    onChange={this.handleVideoChange.bind(this)}
                  >
                    {previewVideo && (
                    <video
                      controls
                      id="video"
                      style={{ width: '250px', marginBottom: '10px' }}
                    />
                    )}
                    <div className="clear" />
                    <Button>
                      <UploadOutlined />
                      {' '}
                      Select File
                    </Button>
                  </Upload>

                  {uploadVideoPercentage ? (
                    <Progress percent={Math.round(uploadVideoPercentage)} />
                  ) : null}
                </div>
              </div>
            </Form.Item>
          </Col>
          <Col md={24}>
            <Form.Item>
              <Checkbox
                defaultChecked={!!user.activateWelcomeVideo}
                onChange={this.handleCheckbox.bind(this)}
              >
                Activate welcome video
              </Checkbox>
            </Form.Item>
          </Col> */}
        </Row>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 11 }}>
          <Button
            className="primary"
            type="primary"
            htmlType="submit"
            loading={updating || isUploadingVideo}
            disabled={isUploadingVideo}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
