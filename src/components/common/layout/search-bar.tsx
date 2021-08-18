import { PureComponent } from 'react';
import { Input } from 'antd';
import Link from 'next/link';
import { performerService } from '@services/index';
import './search-bar.less';
import { debounce } from 'lodash';

const { Search } = Input;
interface IProps {}

interface IState {
  items: any[];
  searching: boolean;
  searched: boolean;
}

class SearchBar extends PureComponent<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      searching: false,
      searched: false
    };
  }

  onSearch = debounce(async (e) => {
    const value = (e.target && e.target.value) || null;
    if (!value) {
      return this.setState({ searched: false });
    }
    try {
      this.setState({ searching: true, searched: false });
      const data = await (await performerService.search({ q: e.target.value }))
        .data;
      if (data && data.data) {
        this.setState({ searching: false, items: data.data, searched: true });
      }
    } catch (err) {
      this.setState({ searching: false, searched: true });
    }
    return undefined;
  }, 300);

  render() {
    const { searching, items, searched } = this.state;
    return (
      <div className="search-bar">
      </div>
    );
  }
}

export default SearchBar;
