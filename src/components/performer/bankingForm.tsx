import { PureComponent } from 'react';
import {
  Form, Input, Button, Row, Col, Select
} from 'antd';
import { IPerformer, ICountry } from 'src/interfaces';

const { Option } = Select;
const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

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
  countries?: ICountry[];
}

export class PerformerBankingForm extends PureComponent<IProps> {
  render() {
    const {
      onFinish, user, updating, countries
    } = this.props;
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onFinish.bind(this)}
        validateMessages={validateMessages}
        initialValues={user.bankingInformation}
        labelAlign="left"
        className="account-form"
      >
        <Row>
          <Col xl={12} md={12} xs={24}>
            <Form.Item
              name="bankName"
              rules={[
                { required: true, message: 'Please input your bank name!' }
              ]}
            >
              <Input placeholder="Bank name" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={24}>
            <Form.Item
              name="bankAccount"
              rules={[
                { required: true, message: 'Please input your bank account!' }
              ]}
            >
              <Input placeholder="Bank account" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={24}>
            <Form.Item name="bankRouting">
              <Input placeholder="Bank routing (For USA residents only)" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={24}>
            <Form.Item 
              name="bankSwiftCode"
              rules={[
                { required: true, message: 'Please input Sort Code/Swift Code/BIC Code of bank!' }
              ]}
              >
              <Input placeholder="Bank Sort Code/Swift Code/BIC Code" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={24}>
            <Form.Item
              name="firstName"
              rules={[
                { required: true, message: 'Please input your first name!' }
              ]}
            >
              <Input placeholder="First name" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={24}>
            <Form.Item
              name="lastName"
              rules={[
                { required: true, message: 'Please input your last name!' }
              ]}
            >
              <Input placeholder="Last name" />
            </Form.Item>
          </Col>
          {/* <Col xl={12} md={12} xs={24}>
            <Form.Item name="SSN">
              <Input placeholder="SSN" />
            </Form.Item>
          </Col> */}
          <Col xl={12} md={12} xs={24}>
            <Form.Item 
            name="address"
            rules={[
              { required: true, message: 'Please input bank address!' }
            ]}
            >
              <Input placeholder="Bank address" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={24}>
            <Form.Item
              name="city"
              rules={[{ required: true, message: 'Please input city!' }]}
            >
              <Input placeholder="City" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={24}>
            <Form.Item 
            name="state"
            rules={[
              { required: true, message: 'Please input state!' }
            ]}
            >
              <Input placeholder="State" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={24}>
            <Form.Item
              name="zip"
              rules={[
                { required: true, message: 'Please input Post/Zip Code!' },
                {
                  min: 6,
                  message: 'Username must containt at least 6 characters'
                }
              ]}
            >
              <Input placeholder="Post/Zip Code" />
            </Form.Item>
          </Col>
          <Col xl={12} md={12} xs={24}>
            <Form.Item
              name="country"
              rules={[{ required: true, message: 'Please choose country!' }]}
            >
              <Select
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase())
                  >= 0}
              >
                {countries
                  && countries.length > 0
                  && countries.map((c) => (
                    <Option key={c.code} value={c.code}>
                      {c.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 11 }}>
          <Button
            className="primary"
            type="primary"
            htmlType="submit"
            loading={updating}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
