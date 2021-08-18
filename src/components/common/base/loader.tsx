import { PureComponent } from 'react';
import { } from 'antd';
import { connect } from 'react-redux';
import './loader.less';
import { IUIConfig } from '@interface/index';

interface IProps {
  ui: IUIConfig
}

class Loader extends PureComponent<IProps> {
  render() {
    const { ui } = this.props;
    return (
      <div className="loading-screen">
        <img alt="loading-ico" src={ui?.logo || '/loading-ico1.gif'} />
      </div>
    );
  }
}
const mapStatesToProps = (state) => ({
  ui: { ...state.ui }
});
export default connect(mapStatesToProps)(Loader) as any;
