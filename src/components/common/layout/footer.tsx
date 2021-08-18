import { PureComponent } from 'react';
import Link from 'next/link';
import { connect } from 'react-redux';
import { IUser, IUIConfig } from 'src/interfaces';

interface IProps {
  currentUser: IUser;
  ui: IUIConfig;
}
class Footer extends PureComponent<IProps, any> {
  render() {
    const linkAuth = (
      <>
      </>
    );
    const { ui, currentUser } = this.props;
    const menus =
      ui.menus && ui.menus.length > 0
        ? ui.menus.filter((m) => m.section === 'footer')
        : [];
    return (
      <div className="main-footer">
        <div className="main-container">
          <div className="copyright-text">
            <ul>
            <li>
              <Link href="/">
                <a>FANZADORE</a>
              </Link>
              ©{new Date().getFullYear()} 
            </li> {' '}
            <li>
              <Link href="/">
              <a>TWITTER</a>
              </Link>{' '}
            </li>
            <li>
              <Link href="/">
              <a>TERMS</a>
              </Link>{' '}
            </li>
            <li>
              <Link href="/">
              <a>PRIVACY</a>
              </Link>{' '}
            </li>
            <li>
              <Link href="/contact">
              <a>CONTACT</a>
              </Link>{' '}
            </li>
            <li>
              <Link href="/">
              <a>USC 2257</a>
              </Link>{' '}
            </li>
            <li>
              <Link href="/">
              <a>DMCA</a>
              </Link>{' '}
            </li>
            <li>
              <Link href="/">
              <a>SUPPORT</a>
              </Link>{' '}
            </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
const mapState = (state: any) => ({
  currentUser: state.user.current,
  ui: state.ui
});
export default connect(mapState)(Footer) as any;
