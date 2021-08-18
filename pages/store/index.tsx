import { PureComponent } from 'react';
import {
  Layout, Button, message, Modal, Alert
} from 'antd';
import { connect } from 'react-redux';
import Head from 'next/head';
import { productService } from '@services/index';
import { PerformerListProduct } from '@components/product/performer-list-product';
import { addCart, removeCart } from '@redux/cart/actions';
import Link from 'next/link';
import _ from 'lodash';
import { IProduct, IUser, IUIConfig } from '../../src/interfaces';
import './store.less';

interface IProps {
  addCart: Function;
  cart: any;
  user: IUser;
  removeCart: Function;
  ui: IUIConfig;
  id: string;
}

const { Content } = Layout;

const ConfirmChangeCart = ({ visible, onOk, onCancel }: any) => (
  <div>
    <Modal
      title="Confirm to switch cart"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Alert
        message="You are ordering product of another model, please confirm that you want to switch?"
        type="warning"
      />
    </Modal>
  </div>
);

class ProductViewPage extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  state = {
    product: null,
    relatedProducts: [],
    modalVisible: false,
    currentItem: null
  };

  async componentDidMount() {
    this.getProduct();
  }

  async componentDidUpdate(prevProps) {
    const { id } = this.props;
    if (prevProps.id !== id) {
      this.getProduct();
    }
  }

  async onAddCart(item: IProduct) {
    const { addCart: addCartHandler } = this.props;
    await this.setState({ currentItem: item });
    const productOf = localStorage.getItem('product_of') as any;
    const { cart } = this.props;
    if (cart && cart.items.length > 0 && productOf !== item.performerId) {
      await this.setState({ modalVisible: true });
      return undefined;
    }
    localStorage.setItem('product_of', item.performerId);
    const index = cart.items.findIndex((element) => element._id === item._id);
    if (index > -1) {
      return message.error('Product is added to cart');
    }
    addCartHandler([{ _id: item._id, quantity: 1 }]);
    message.success('Product is added to cart');
    return this.updateCartLocalStorage({ _id: item._id, quantity: 1 });
  }

  async onConfirmChangeCart() {
    const { removeCart: removeCartHandler, cart } = this.props;
    const { currentItem } = this.state;
    localStorage.setItem('product_of', currentItem.performerId);
    await removeCartHandler(cart.items);
    await this.resetCartLocal();
    this.onAddCart(currentItem);
    this.setState({ modalVisible: false });
  }

  onCancelChangeCart() {
    this.setState({
      modalVisible: false
    });
  }

  async getProduct() {
    const { id } = this.props;
    const product = (await (await productService.userView(id))
      .data) as IProduct;
    if (product) {
      this.setState({ product });
      const relatedProducts = await (
        await productService.userSearch({
          limit: 24,
          excludedId: product._id,
          performerId: product.performerId
        })
      ).data;
      this.setState({
        relatedProducts: relatedProducts.data
      });
    }
  }

  updateCartLocalStorage(item: IProduct) {
    const { user } = this.props;
    let oldCart = localStorage.getItem(`cart_${user._id}`) as any;
    oldCart = oldCart && oldCart.length ? JSON.parse(oldCart) : [];
    const newCart = [...oldCart, ...[item]];
    localStorage.setItem(
      `cart_${user._id}`,
      JSON.stringify(_.uniqBy(newCart, '_id'))
    );
  }

  resetCartLocal() {
    const { user } = this.props;
    localStorage.setItem(`cart_${user._id}`, JSON.stringify([]));
  }

  render() {
    const { user, ui } = this.props;
    const { modalVisible, product, relatedProducts } = this.state;
    return (
      <>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            |
            {product && product.name}
            {' '}
          </title>
        </Head>
        <Layout>
          <Content>
            <div className="prod-main">
              <div className="main-container">
                <div className="prod-card">
                  <ConfirmChangeCart
                    visible={modalVisible}
                    onOk={this.onConfirmChangeCart.bind(this)}
                    onCancel={this.onCancelChangeCart.bind(this)}
                  />
                  {product && (
                    <div className="prod-img">
                      <img
                        alt=""
                        src={
                          product.image ? product.image : '/empty_product.svg'
                        }
                      />
                      {product.stock && (
                        <span className="prod-stock">
                          {product.stock}
                          {' '}
                          in stock
                        </span>
                      )}
                      {!product.stock && (
                        <span className="prod-stock">Out of stock!</span>
                      )}
                      <span className="prod-digital">{product.type}</span>
                    </div>
                  )}
                  {product && (
                    <div className="prod-info">
                      <div className="prod-name">{product.name}</div>
                      <p className="prod-desc">{product.description}</p>
                      <div className="add-cart">
                        <p className="prod-price">
                          $
                          {product.price.toFixed(2)}
                        </p>
                        <Button
                          className="primary"
                          disabled={
                            !product.stock
                            || (user && user._id === product.performerId)
                          }
                          onClick={this.onAddCart.bind(this, product)}
                        >
                          Add to Cart
                        </Button>
                        &nbsp;
                        <Button type="link" className="secondary">
                          <Link href="/cart">
                            <a>Go to Cart</a>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="main-container">
              <div className="related-prod">
                <h4 className="ttl-1">You may also like</h4>
                {relatedProducts.length > 0 && (
                  <PerformerListProduct products={relatedProducts} />
                )}
              </div>
            </div>
          </Content>
        </Layout>
      </>
    );
  }
}
const mapStates = (state: any) => ({
  cart: { ...state.cart },
  user: state.user.current,
  ui: state.ui
});

const mapDispatch = { addCart, removeCart };
export default connect(mapStates, mapDispatch)(ProductViewPage);
