import { PureComponent } from 'react';
import { Layout, message } from 'antd';
import Head from 'next/head';
import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { paymentService } from 'src/services';
import { ITransaction, IUIConfig } from 'src/interfaces';
import { SearchFilter } from '@components/common/search-filter';
import PaymentTableList from '@components/payment/table-list';
import { getResponseError } from '@lib/utils';
import { connect } from 'react-redux';

interface IProps {
  ui: IUIConfig;
}
interface IStates {
  loading: boolean;
  paymentList: ITransaction[];
  searching: boolean;
  pagination: {
    total: number;
    pageSize: number;
    current: number;
  };
  sortBy: string;
  sort: string;
  filter: {};
}

const { Content } = Layout;
class PaymentHistoryPage extends PureComponent<IProps, IStates> {
  state = {
    loading: true,
    searching: false,
    paymentList: [],
    pagination: {
      total: 0,
      pageSize: 10,
      current: 1
    },
    sortBy: 'createdAt',
    sort: 'desc',
    filter: {}
  };

  componentDidMount() {
    this.userSearchTransactions();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const { pagination: paginationVal } = this.state;
    await this.setState({
      pagination: { ...paginationVal, current: pagination.current },
      sortBy: sorter.field || 'createdAt',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order
        ? sorter.order === 'descend'
          ? 'desc'
          : 'asc'
        : 'desc'
    });
    this.userSearchTransactions();
  };

  async handleFilter(filter) {
    this.setState({ filter }, () => this.userSearchTransactions());
  }

  async userSearchTransactions() {
    try {
      const {
        filter, sort, sortBy, pagination
      } = this.state;
      const resp = await paymentService.userSearchTransactions({
        ...filter,
        sort,
        sortBy,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      return await this.setState({
        paymentList: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total
        }
      });
    } catch (error) {
      return message.error(getResponseError(error));
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      loading, paymentList, searching, pagination
    } = this.state;
    const { ui } = this.props;
    const statuses = [
      {
        key: '',
        text: 'All'
      },
      {
        key: 'success',
        text: 'Success'
      },
      {
        key: 'pending',
        text: 'Pending'
      },
      {
        key: 'cancelled',
        text: 'Suspended'
      }
    ];
    const type = [
      {
        key: '',
        text: 'All'
      },
      {
        key: 'product',
        text: 'Store'
      },
      {
        key: 'sale_video',
        text: 'VOD'
      },
      {
        key: 'monthly_subscription',
        text: 'Monthly Subscription'
      },
      {
        key: 'yearly_subscription',
        text: 'Yearly Subscription'
      }
    ];
    return (
      <Layout>
        <Head>
          <title>
            {' '}
            {ui && ui.siteName}
            {' '}
            | Payment History
            {' '}
          </title>
        </Head>
        <Content>
          <div className="main-container">
            {loading ? (
              <Loader />
            ) : (
              <Page>
                <div className="page-heading">Payment History</div>
                <SearchFilter
                  type={type}
                  statuses={statuses}
                  onSubmit={this.handleFilter.bind(this)}
                  searchWithPerformer
                  searchWithKeyword={false}
                />

                <PaymentTableList
                  dataSource={paymentList}
                  pagination={pagination}
                  onChange={this.handleTableChange.bind(this)}
                  rowKey="_id"
                  loading={searching}
                />
              </Page>
            )}
          </div>
        </Content>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(PaymentHistoryPage);
