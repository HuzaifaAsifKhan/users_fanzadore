import { PureComponent } from 'react';
import {
  Layout, message, Row, Col
} from 'antd';

import Head from 'next/head';
import { performerService } from '@services/performer.service';
import { getResponseError } from '@lib/utils';
import { IPerformer, IUIConfig } from 'src/interfaces';
import Loader from '@components/common/base/loader';
import PerformerCard from '@components/performer/card';
import { connect } from 'react-redux';
import '@components/performer/performer.less';

const { Content } = Layout;
interface TopPerformerPageIProps {
  ui: IUIConfig;
}
interface TopPerformerPageStates {
  limit: number;
  loading: boolean;
  topPerformers: IPerformer[];
}
class TopPerformerPage extends PureComponent<
  TopPerformerPageIProps,
  TopPerformerPageStates
> {
  static authenticate = false;

  constructor(props: TopPerformerPageIProps) {
    super(props);
    this.state = {
      loading: true,
      limit: 10,
      topPerformers: []
    };
  }

  componentDidMount() {
    this.getTopPerformer();
  }

  async getTopPerformer() {
    try {
      const { limit } = this.state;
      const resp = await performerService.getTopPerformer({
        limit: 7
      });
      await this.setState({ topPerformers: resp.data.data });
    } catch (error) {
      message.error(getResponseError(error));
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, topPerformers } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>
            {' '}
            {ui && ui.siteName}
            {' '}
            | Top Models
            {' '}
          </title>
        </Head>
        <Content>
          {loading ? (
            <Loader />
          ) : (
            <div className="main-container">
              <div className="page-heading">
                <span>Top 10 Models</span>
              </div>
              <Row>
                {topPerformers
                  && topPerformers.length > 0
                  && topPerformers.map((p) => (
                    <Col xs={24} sm={12} md={8} lg={6} xl={6} key={p._id}>
                      <PerformerCard performer={p} />
                    </Col>
                  ))}
                {!topPerformers && <p>No model found!</p>}
              </Row>
            </div>
          )}
        </Content>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(TopPerformerPage);
