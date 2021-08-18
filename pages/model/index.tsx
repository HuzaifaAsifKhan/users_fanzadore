import { PureComponent } from 'react';
import {
  Row, Col, Layout, Pagination
} from 'antd';
import { connect } from 'react-redux';
import { getList } from '@redux/performer/actions';
import PerformerCard from '@components/performer/card';
import Head from 'next/head';
import { SearchFilter } from '@components/common/base/search-filter';
import { DropOption } from '@components/common/base/drop-option';
import { IUIConfig } from 'src/interfaces/';
import '@components/performer/performer.less';

interface IProps {
  getList: Function;
  performerState: any;
  ui: IUIConfig;
}

interface IStates {
  offset: number,
    limit: number,
    currentPage: number
}

const { Content } = Layout;

class Performers extends PureComponent<IProps, IStates> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  constructor(props: IProps) {
    super(props);
    this.state = {
      offset: 0,
      limit: 12,
      currentPage: 1
    };
  }

  componentDidMount() {
    const { getList: getListHandler } = this.props;
    const { limit, offset } = this.state;
    getListHandler({
      limit,
      offset,
      status: 'active'
    });
  }

  async pageChanged(page: number) {
    const { getList: getListHandler } = this.props;
    const { limit } = this.state;
    try {
      await this.setState({ currentPage: page });
      // eslint-disable-next-line react/no-access-state-in-setstate
      // this.setState({ ...this.state, offset: page });
      getListHandler({
        limit,
        offset: (page - 1) * 12,
        status: 'active'
      });
    } catch (error) {
      // console.log(error);
    }
  }

  handleFilter(values: any) {
    const { getList: getListHandler } = this.props;
    const { limit } = this.state;
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, offset: 0 });
    getListHandler({
      limit,
      offset: 0,
      ...values,
      status: 'active'
    });
  }

  handleSort(values: any) {
    const sort = {
      sort: values.key
    };
    const { getList: getListHandler } = this.props;
    const { limit } = this.state;
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, offset: 0 });
    getListHandler({
      limit,
      offset: 0,
      ...sort,
      status: 'active'
    });
  }

  render() {
    const {
      performerState = {
        requesting: false,
        error: null,
        success: false,
        data: null
      },
      ui
    } = this.props;
    const { limit, currentPage } = this.state;
    const performers = performerState.data && performerState.data.data
      ? performerState.data.data
      : [];
    const total = performerState.data && performerState.data.total
      ? performerState.data.total
      : 0;
    const isLoading = performerState.requesting;

    return (
      <>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Models
          </title>
        </Head>
        <Layout>
          <Content>
            <div className="main-container">
              <div
                className="page-heading flex-row-space-between"
                style={{ position: 'relative' }}
              >
                {/* <span>Models ({total})</span> */}
                <span className="sort-model">
                  <DropOption
                    menuOptions={[
                      { key: 'latest', name: 'Latest' },
                      { key: 'oldest', name: 'Oldest' },
                      { key: 'popular', name: 'Popular' }
                    ]}
                    buttonStyle={{
                      height: '40px',
                      border: '1px solid #ccc',
                      padding: '5px 20px',
                      borderRadius: '5px'
                    }}
                    onMenuClick={this.handleSort.bind(this)}
                  />
                </span>
              </div>
              <SearchFilter
                genders={[
                  { key: '', text: 'All' },
                  { key: 'male', text: 'Male' },
                  { key: 'female', text: 'Female' },
                  { key: 'transgender', text: 'Transgender' }
                ]}
                onSubmit={this.handleFilter.bind(this)}
              />
              <div style={{ marginBottom: '20px' }} />
              <div className="main-background">
                <Row>
                  {performers.length > 0
                    && !isLoading
                    && performers.map((p: any) => (
                      <Col xs={12} sm={12} md={6} lg={6} key={p._id}>
                        <PerformerCard performer={p} />
                      </Col>
                    ))}
                  {!total && !isLoading && <p>No model found.</p>}
                  {isLoading && <p>loading...</p>}
                  {total && total > limit && !isLoading ? (
                    <div className="paging">
                      <Pagination
                        current={currentPage}
                        total={total}
                        pageSize={limit}
                        onChange={this.pageChanged.bind(this)}
                      />
                    </div>
                  ) : null}
                </Row>
              </div>
            </div>
          </Content>
        </Layout>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  performerState: { ...state.performer.performerListing },
  ui: { ...state.ui }
});

const mapDispatch = { getList };
export default connect(mapStates, mapDispatch)(Performers);
