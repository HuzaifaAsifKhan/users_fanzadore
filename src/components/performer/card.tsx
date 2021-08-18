import { PureComponent } from 'react';
import { IPerformer } from 'src/interfaces';
import Link from 'next/link';
import './performer.less';
import { Button, Modal, Radio, message } from 'antd';
import { paymentService } from 'src/services';

interface IProps {
  performer: IPerformer;
}

export default class PerformerCard extends PureComponent<IProps> {
  state = {
    isAdoreMeModalVisible: false,
    defaultSubscription: 'yearly',
  }
  adoreMePopup = () => {
    this.setState({isAdoreMeModalVisible: true})
  }

  handleOk = (performerId: any) => {
    this.setState({isAdoreMeModalVisible: false});
    this.subscribe(performerId, this.state.defaultSubscription);
  }

  handleCancel = () => {
    this.setState({isAdoreMeModalVisible: false})
  }

  onSubscriptionChange = (subscriptionSelected: any) => {
    this.setState({defaultSubscription: subscriptionSelected.target.value});
  }

  async subscribe(performerId: string, type: string)
  {
    try {
      const subscription = await (
        await paymentService.subscribe({ type, performerId })
      ).data;

      if (subscription) {
        message.success('Redirecting to payment method.');
        window.location.href = subscription.paymentUrl;
      }
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    }
  }

  render() {
    const { performer } = this.props;
    const { isAdoreMeModalVisible, defaultSubscription } = this.state;
    return (
      <>
      <Modal title="Choose subscription" visible={isAdoreMeModalVisible} onOk={()=>this.handleOk(performer._id)} onCancel={this.handleCancel}>
      <Radio.Group onChange={this.onSubscriptionChange} value={defaultSubscription}>
      <Radio value='monthly'>Monthly</Radio>
      <Radio value='yearly'>Yearly</Radio>
    </Radio.Group>
      </Modal>
      <div className="model-card">          
            <div className="card-img">
            <Link
          href={{
            pathname: '/model/profile',
            query: { username: performer.username }
          }}
          as={`/model/${performer.username}`}
        ><img alt="avatar" src={performer.avatar || '/no-avatar.png'} /></Link>
            </div>
            <div className="card-stat">
              <div className="cardUserName">
              <span>{performer.name}</span>
                <span>
                  {`@${performer?.username}`}
                  {' '}
                </span>
              </div>
              
              <span>
                {performer?.monthlyPrice && `${performer?.monthlyPrice}$/month` || ''}
                {' '}                
              </span>
            </div>          
          {/* <a>
          <div className="model-name">{!performer.isSubscribed ? 'Adore Me' : 'Adored'}</div>
          </a> */}
          {!performer.isSubscribed ? <Button onClick={this.adoreMePopup}>Adore Me</Button> : <Button>Adored</Button>}
        {/* <div className="hovering">
          <Link href={{ pathname: '/model/profile', query: { username: per.username } }} as={'/model/' + per.username}>
            <a>{per.username}</a>
          </Link>
        </div> */}
      </div>
      </>
    );
  }
}
