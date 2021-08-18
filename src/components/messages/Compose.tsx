/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-did-update-set-state */
import { PureComponent, createRef } from 'react';
import { connect } from 'react-redux';
import { sendMessage, sentFileSuccess } from '@redux/message/actions';
import { SmileOutlined, SendOutlined, DollarOutlined } from '@ant-design/icons';

import { ImageMessageUpload } from '@components/messages/uploadPhoto';
import { authService, messageService, paymentService } from '@services/index';
import Emotions from './emotions';
import './Compose.less';
import { Tooltip, Modal, InputNumber, message } from 'antd';

interface IProps {
  sendMessage: Function;
  sentFileSuccess: Function;
  sendMessageStatus: any;
  conversation: any;
  currentUser: any
}

class Compose extends PureComponent<IProps> {
  _input: any;

  state = { text: '', isTipModalVisible: false, tipValue: 10 };

  componentDidMount() {
    if (!this._input) this._input = createRef();
  }

  componentDidUpdate(previousProps) {
    const { sendMessageStatus } = this.props;
    if (previousProps.sendMessageStatus.success !== sendMessageStatus.success) {
      this.setState({ text: '' });
      this._input && this._input.focus();
    }
  }

  onKeyDown = (evt) => {
    if (evt.keyCode === 13) {
      this.send();
    }
  };

  onChange = (evt) => {
    this.setState({ text: evt.target.value });
  };

  onEmojiClick = (emojiObject) => {
    const { text } = this.state;
    this.setState({ text: text + emojiObject.emoji });
  }

  onPhotoUploaded = (data: any) => {
    if (!data || !data.response) {
      return;
    }
    const imageUrl = (data.response.data && data.response.data.imageUrl) || data.base64;
    this.props.sentFileSuccess({ ...data.response.data, ...{ imageUrl } });
  }

  send() {
    if (!this.state.text) return;
    const { conversation } = this.props;
    this.props.sendMessage({
      conversationId: conversation._id,
      data: {
        text: this.state.text
      }
    });
  }

  sendTipModal = () => {
    this.setState({isTipModalVisible: !this.state.isTipModalVisible})
  }

  async handleOk(performerId, userId) {
    const { tipValue } = this.state;
    try {
      const pay = await (await paymentService.sendTip(performerId, userId, tipValue)).data;
      if (pay) {
        this.setState({isTipModalVisible: false})
        message.success('Redirecting to payment method');
        window.location.href = pay.paymentUrl;
      }
    } catch (e) {
      console.log(e);
      this.setState({isTipModalVisible: false})
    }
  };

  handleCancel = () => {
    this.setState({isTipModalVisible: false})
  };

  onTipChange = (tip) => {
    this.setState({tipValue: tip});
  }

  render() {
    const { text, isTipModalVisible } = this.state;
    const { sendMessageStatus: status, conversation, currentUser } = this.props;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    if (!this._input) this._input = createRef();
    return (
      <>
        <Modal title="Send a Tip" visible={isTipModalVisible} onOk={()=>this.handleOk(conversation.recipientInfo._id, currentUser._id)} onCancel={this.handleCancel}>
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
      <div className="compose">
        <textarea
          value={text}
          className="compose-input"
          placeholder="Write your message..."
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
          disabled={status.sending || !conversation._id}
          autoFocus
          ref={(c) => { this._input = c; }}
        />
        {currentUser && !currentUser.isPerformer && <div className="grp-icons">
        <div className="grp-tip">
        <Tooltip title="Send a Tip">
        <DollarOutlined onClick={this.sendTipModal} />
        </Tooltip>
        </div>
        </div>}
        <div className="grp-icons">
          <div className="grp-emotions">
            <SmileOutlined />
            <Emotions onEmojiClick={this.onEmojiClick.bind(this)} />
          </div>
        </div>

        <div className="grp-icons">
          <div className="grp-file-icon">
            <ImageMessageUpload
              headers={uploadHeaders}
              uploadUrl={messageService.getMessageUploadUrl()}
              onUploaded={this.onPhotoUploaded}
              options={{ fieldName: 'message-photo' }}
              messageData={{
                text: 'sent a photo',
                conversationId: conversation && conversation._id,
                recipientId: conversation && conversation.recipientInfo && conversation.recipientInfo._id,
                recipientType: currentUser && currentUser.isPerformer ? 'user' : 'performer'
              }}
            />
          </div>
        </div>
        <div className="grp-icons" style={{ paddingRight: 0 }}>
          <div className="grp-send" onClick={this.send.bind(this)}>
            <SendOutlined />
          </div>
        </div>
      </div>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  sendMessageStatus: state.message.sendMessage,
  currentUser: state.user.current
});

const mapDispatch = { sendMessage, sentFileSuccess };
export default connect(mapStates, mapDispatch)(Compose);
