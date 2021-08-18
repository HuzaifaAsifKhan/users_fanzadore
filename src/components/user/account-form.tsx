import React from 'react';
import {
  Form, Input, Button, Select, Col, Row
} from 'antd';
import { AvatarUpload } from '@components/user/avatar-upload';
import { IUser, IUserFormData } from 'src/interfaces';

interface UserAccountFormIProps {
  user: IUser;
  updating: boolean;
  onFinish(data: IUserFormData): Function;
  // eslint-disable-next-line react/require-default-props
  options?: {
    uploadHeader: any;
    avatarUrl: string;
    uploadAvatar(): Function;
  };
}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};

export const UserAccountForm = ({
  updating,
  onFinish,
  user,
  options
}: UserAccountFormIProps) => (
  <Form
    className="account-form"
    {...layout}
    name="user-account-form"
    onFinish={onFinish}
    initialValues={user}
  >
    <Row>
      <Col xs={24} sm={12}>
        <Form.Item
          labelCol={{ offset: 24 }}
          name="firstName"
          validateTrigger={['onChange', 'onBlur']}
          rules={[
            { required: true, message: 'Please input your first name!' },
            {
              pattern: new RegExp(
                /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
              ),
              message: 'First name can not contain number and special character'
            }
          ]}
        >
          <Input placeholder="First Name" />
        </Form.Item>
        <Form.Item
          labelCol={{ offset: 24 }}
          name="lastName"
          validateTrigger={['onChange', 'onBlur']}
          rules={[
            { required: true, message: 'Please input your last name!' },
            {
              pattern: new RegExp(
                /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
              ),
              message: 'Last name can not contain number and special character'
            }
          ]}
        >
          <Input placeholder="Last Name" />
        </Form.Item>
        <Form.Item name="username" labelCol={{ offset: 24 }}>
          <Input disabled placeholder="username" />
        </Form.Item>
        <Form.Item
          name="email"
          labelCol={{ offset: 24 }}
          rules={[{ type: 'email' }]}
        >
          <Input disabled placeholder="Email Address" />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item name="gender" labelCol={{ offset: 24 }}>
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
        <Form.Item labelCol={{ offset: 24 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <div>
              <AvatarUpload
                imageUrl={user.avatar}
                uploadUrl={options.avatarUrl}
                headers={options.uploadHeader}
                onUploaded={options.uploadAvatar}
              />
            </div>
            <div>Max upload size is 5MB!</div>
          </div>
        </Form.Item>
      </Col>
    </Row>
    <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
      <Button htmlType="submit" className="primary" loading={updating}>
        Update Profile
      </Button>
    </Form.Item>
  </Form>
);
