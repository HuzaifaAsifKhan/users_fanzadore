import { Row, Col } from 'antd';
import { PureComponent } from 'react';
import Link from 'next/link';
import { IPerformer, IUser } from 'src/interfaces';
import PerformerCard from './card';
import './performer.less';

interface IProps {
  performers: IPerformer[],
  user?: IUser | IPerformer
}

export class HomePerformers extends PureComponent<IProps> {
  render() {
    const { performers, user } = this.props;
    return (
      <div>
        <Row>
          {performers.length > 0 && performers.map((p: any) => {
            if (user && user._id === p._id) {
              return null;
            }
            return (
              <Col xs={12} sm={12} md={6} lg={6} key={p._id}>
                <PerformerCard performer={p} />
              </Col>
            );
          })}
        </Row>
        <div className="show-all">
          <Link href="/model">
            <a>All Model</a>
          </Link>
        </div>
      </div>
    );
  }
}
