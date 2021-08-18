import { PureComponent } from 'react';
import { message, Layout } from 'antd';
import Head from 'next/head';
import Page from '@components/common/layout/page';

import { TableListSubscription } from '@components/subscription/table-list-subscription';
import { ISubscription, IUIConfig } from 'src/interfaces';
import { subscriptionService, paymentService } from '@services/index';
import { getResponseError } from '@lib/utils';
import { connect } from 'react-redux';

interface IProps {
  ui: IUIConfig;
}
interface IStates {
  subscriptionList: ISubscription[];
  loading: boolean;
  pagination: {
    pageSize: number;
    current: number;
    total: number;
  };
  sort: string;
  sortBy: string;
  filter: {};
}

class SubscriptionPage extends PureComponent<IProps, IStates> {
  static authenticate: boolean = true;

  constructor(props: IProps) {
    super(props);
    this.state = {
      subscriptionList: [],
      loading: false,
      pagination: {
        pageSize: 10,
        current: 1,
        total: 0
      },
      sort: 'decs',
      sortBy: 'updatedAt',
      filter: {}
    };
  }

  componentDidMount() {
    this.getData();
  }

  async getData() {
    try {
      const {
        filter, sort, sortBy, pagination
      } = this.state;
      await this.setState({ loading: true });
      const resp = await subscriptionService.userSearch({
        ...filter,
        sort,
        sortBy,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      await this.setState({
        subscriptionList: resp.data.data,
        pagination: { ...pagination, total: resp.data.total }
      });
    } catch (error) {
      message.error(
        getResponseError(error) || 'An error occured. Please try again.'
      );
    } finally {
      this.setState({ loading: false });
    }
  }

  async handleTabChange(data) {
    const { pagination } = this.state;
    await this.setState({
      pagination: { ...pagination, current: data.current }
    });
    this.getData();
  }

  async cancelSubscription(performerId) {
    try {
      const resp = await (await paymentService.cancelSubscription(performerId))
        .data;
      if (resp && !resp.success) {
        return message.error(
          'Cancel subscription has been fail, check our Cancelation Policy or contact us for more information'
        );
      }
      return undefined;
    } catch (e) {
      return message.error('Error occured, please try again later');
    }
  }

  render() {
    const { subscriptionList, pagination, loading } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | My Subscriptions
          </title>
        </Head>
        <div className="main-container">
          <Page>
            <div className="page-heading">
              <span>My subscriptions</span>
            </div>
            <div className="table-responsive">
              <TableListSubscription
                dataSource={subscriptionList}
                pagination={pagination}
                loading={loading}
                onChange={this.handleTabChange.bind(this)}
                rowKey="_id"
                cancelSubscription={this.cancelSubscription.bind(this)}
              />
            </div>
          </Page>
        </div>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({ ui: state.ui });
const mapDispatch = {};
export default connect(mapState, mapDispatch)(SubscriptionPage);
