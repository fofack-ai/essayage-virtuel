import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import LoadingPage from '../../components/common/LoadingPage';

export default function Cart() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { items, removeItem, updateQty, clearCart, total, count } = useCart();

  const formatPrice = (price) => new Intl.NumberFormat("fr-FR").format(price);

  return (
    <div className="cart-page">
      <style>{styles}</style>

      <section className="cart-hero">
        <span>{t('cart.hero.tag')}</span>
        <h1>{t('cart.hero.title')}</h1>
        <p>{t('cart.hero.subtitle')}</p>
      </section>

      {items.length === 0 ? (
        <div className="empty-cart">
          <h2>{t('cart.empty.title')}</h2>
          <p>{t('cart.empty.desc')}</p>
          <Link to="/catalogue">{t('cart.empty.cta')}</Link>
        </div>
      ) : (
        <section className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <article
                className="cart-item"
                key={`${item.id}-${item.size}-${item.color}`}
              >
                <div
                  className="cart-item-bg"
                  style={{
                    backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.72), rgba(0,0,0,.18)), url(${item.image || "/catalog-banner.jpg"})`,
                  }}
                />

                <div className="cart-content">
                  <div>
                    <span className="item-category">{item.category || t('cart.item.categoryFallback')}</span>
                    <h3>{item.name}</h3>

                    <div className="item-meta">
                      <span>{t('cart.item.size', { size: item.size || t('cart.item.sizeFallback') })}</span>
                      <span>{t('cart.item.color', { color: item.color || t('cart.item.colorFallback') })}</span>
                      <p>
                        {t('cart.item.stock', { stock: item.sizeStock || t('cart.item.stockFallback') })}
                      </p>
                    </div>

                    <div className="item-price">
                      <strong>{formatPrice(item.price)}</strong> FCFA
                    </div>
                  </div>

                  <div className="item-actions">
                    <div className="qty">
                      <button
                        onClick={() => {
                          if (item.qty <= 1) {
                            removeItem(item.id, item.size, item.color);
                            return;
                          }
                          updateQty(item.id, item.size, item.color, item.qty - 1);
                        }}
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => {
                          if (item.sizeStock && item.qty >= item.sizeStock) {
                            alert(
                              t('cart.stockAlert', { size: item.size, stock: item.sizeStock })
                            );
                            return;
                          }
                          updateQty(item.id, item.size, item.color, item.qty + 1);
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove"
                      onClick={() => removeItem(item.id, item.size, item.color)}
                    >
                      {t('cart.remove')}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <span className="summary-tag">{t('cart.summary.tag')}</span>
            <h2>{t('cart.summary.title')}</h2>

            <div className="summary-row">
              <span>{t('cart.summary.items')}</span>
              <strong>{count}</strong>
            </div>

            <div className="summary-row">
              <span>{t('cart.summary.subtotal')}</span>
              <strong>{formatPrice(total)} FCFA</strong>
            </div>

            <div className="summary-row">
              <span>{t('cart.summary.shipping')}</span>
              <strong>{t('cart.summary.shippingTBD')}</strong>
            </div>

            <div className="summary-total">
              <span>{t('cart.summary.total')}</span>
              <strong>{formatPrice(total)} FCFA</strong>
            </div>

            <button className="checkout" onClick={() => navigate("/checkout")}>
              {t('cart.summary.checkout')}
            </button>

            <button className="clear" onClick={clearCart}>
              {t('cart.summary.clear')}
            </button>

            <Link to="/catalogue" className="continue">
              {t('cart.summary.continue')}
            </Link>
          </aside>
        </section>
      )}
    </div>
  );
}

const styles = `
.cart-page {
  padding-top: 72px;
  min-height: 100vh;
  background: linear-gradient(180deg,#F9F9F9,#EEF2F6);
}

.cart-hero {
  text-align: center;
  padding: 70px 24px 45px;
}

.cart-hero span,
.summary-tag {
  color: #E30613;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.cart-hero h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(54px, 6vw, 88px);
  font-weight: 300;
  margin: 10px 0;
}

.cart-hero p {
  color: #6A6F78;
  font-size: 17px;
}

.cart-layout {
  max-width: 1450px;
  margin: 0 auto;
  padding: 20px 70px 90px;
  display: grid;
  grid-template-columns: 1.7fr .9fr;
  gap: 34px;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cart-item {
  min-height: 245px;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 18px 45px rgba(0,0,0,.12);
  transition: all .28s ease;
}

.cart-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 26px 60px rgba(0,0,0,.18);
}

.cart-item-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform .35s ease;
}

.cart-item:hover .cart-item-bg {
  transform: scale(1.04);
}

.cart-content {
  position: relative;
  z-index: 2;
  min-height: 245px;
  padding: 34px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}

.item-category {
  color: #E30613;
  background: rgba(255,255,255,.92);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.cart-content h3 {
  font-size: 34px;
  margin: 20px 0 10px;
  max-width: 520px;
}

.item-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: rgba(255,255,255,.86);
  font-size: 14px;
}

.item-price {
  margin-top: 22px;
  font-size: 14px;
}

.item-price strong {
  font-size: 30px;
  font-weight: 950;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}

.qty {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,.92);
  padding: 8px;
  border-radius: 999px;
  color: #111;
}

.qty button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #111;
  color: #fff;
  cursor: pointer;
  font-size: 18px;
  transition: all .25s ease;
}

.qty button:hover {
  background: #E30613;
  transform: translateY(-2px);
}

.qty span {
  font-weight: 900;
  min-width: 18px;
  text-align: center;
}

.remove {
  border: none;
  background: rgba(255,255,255,.92);
  color: #E30613;
  padding: 11px 18px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 900;
  transition: all .25s ease;
}

.remove:hover {
  background: #E30613;
  color: #fff;
  transform: translateY(-2px);
}

.cart-summary {
  background: #fff;
  border-radius: 30px;
  padding: 34px;
  height: fit-content;
  position: sticky;
  top: 100px;
  box-shadow: 0 18px 45px rgba(0,0,0,.09);
}

.cart-summary h2 {
  font-size: 34px;
  margin: 8px 0 28px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid rgba(26,26,26,.08);
  color: #4B5563;
}

.summary-row strong {
  color: #111;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 26px 0;
  font-size: 18px;
}

.summary-total strong {
  font-size: 28px;
  font-weight: 950;
}

.checkout,
.clear {
  width: 100%;
  height: 58px;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  font-weight: 900;
  font-size: 15px;
  transition: all .25s ease;
}

.checkout {
  background: #111;
  color: #fff;
  box-shadow: 0 16px 35px rgba(227,6,19,.16);
}

.checkout:hover {
  background: #E30613;
  transform: translateY(-2px);
}

.clear {
  margin-top: 12px;
  background: #F1F1F1;
  color: #111;
}

.clear:hover {
  background: #eee;
  transform: translateY(-2px);
}

.continue {
  display: block;
  text-align: center;
  margin-top: 22px;
  color: #111;
  text-decoration: none;
  font-weight: 800;
}

.continue:hover {
  color: #E30613;
}

.empty-cart {
  max-width: 780px;
  margin: 30px auto 90px;
  background: #fff;
  border-radius: 34px;
  text-align: center;
  padding: 70px 40px;
  box-shadow: 0 18px 45px rgba(0,0,0,.08);
}

.empty-cart h2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 52px;
  font-weight: 300;
}

.empty-cart p {
  color: #6A6F78;
  margin: 12px 0 26px;
}

.empty-cart a {
  display: inline-block;
  background: #111;
  color: #fff;
  padding: 15px 28px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 900;
  transition: all .25s ease;
}

.empty-cart a:hover {
  background: #E30613;
  transform: translateY(-2px);
}

/* ============================================================
   RESPONSIVE — CONTENU QUI COMMENCE EN HAUT SUR MOBILE
   ============================================================ */

@media (max-width: 950px) {
  .cart-layout {
    grid-template-columns: 1fr;
    padding: 20px 32px 80px;
  }

  .cart-summary {
    position: static;
    top: auto;
  }
}

@media (max-width: 768px) {
  .cart-page {
    padding-top: 0 !important;
  }

  .cart-hero {
    padding: 16px 16px 20px !important;
  }

  .cart-hero h1 {
    font-size: 28px !important;
  }

  .cart-hero p {
    font-size: 13px !important;
    margin-top: 4px;
  }

  .cart-hero span {
    font-size: 9px !important;
    letter-spacing: 2px !important;
  }
}

@media (max-width: 640px) {
  .cart-layout {
    padding: 12px 12px 80px !important;
  }

  .cart-item {
    min-height: 180px;
    border-radius: 18px;
  }

  .cart-content {
    padding: 16px !important;
    gap: 10px;
    flex-direction: column;
    align-items: flex-start;
    min-height: 180px;
  }

  .cart-content h3 {
    font-size: 20px !important;
    margin: 8px 0 6px;
  }

  .item-category {
    font-size: 8px;
    padding: 4px 10px;
  }

  .item-meta {
    font-size: 12px !important;
    gap: 8px;
  }

  .item-meta p {
    font-size: 11px !important;
    margin: 0;
  }

  .item-price {
    margin-top: 10px;
    font-size: 12px;
  }

  .item-price strong {
    font-size: 20px !important;
  }

  .item-actions {
    flex-direction: row !important;
    align-items: center;
    gap: 10px;
    width: 100%;
    margin-top: 4px;
  }

  .qty {
    padding: 3px 4px;
    gap: 8px;
  }

  .qty button {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .qty span {
    min-width: 14px;
    font-size: 13px;
  }

  .remove {
    padding: 6px 12px;
    font-size: 10px;
  }

  .cart-summary {
    padding: 16px !important;
    border-radius: 18px !important;
  }

  .cart-summary h2 {
    font-size: 22px !important;
    margin: 4px 0 16px !important;
  }

  .summary-row {
    padding: 10px 0 !important;
    font-size: 13px !important;
  }

  .summary-total {
    margin: 16px 0 !important;
    font-size: 15px !important;
  }

  .summary-total strong {
    font-size: 20px !important;
  }

  .checkout,
  .clear {
    height: 44px !important;
    font-size: 12px !important;
  }

  .continue {
    font-size: 12px !important;
    margin-top: 14px !important;
  }

  .empty-cart {
    padding: 30px 20px !important;
    margin: 16px 12px 60px !important;
    border-radius: 20px !important;
  }

  .empty-cart h2 {
    font-size: 28px !important;
  }

  .empty-cart p {
    font-size: 13px !important;
  }

  .empty-cart a {
    padding: 12px 20px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 380px) {
  .cart-item {
    min-height: 150px;
  }

  .cart-content {
    padding: 12px !important;
  }

  .cart-content h3 {
    font-size: 17px !important;
  }

  .item-price strong {
    font-size: 17px !important;
  }

  .item-actions {
    flex-wrap: wrap;
    gap: 6px;
  }

  .qty button {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .remove {
    padding: 4px 10px;
    font-size: 9px;
  }

  .cart-summary h2 {
    font-size: 18px !important;
  }

  .summary-total strong {
    font-size: 17px !important;
  }

  .checkout,
  .clear {
    height: 38px !important;
    font-size: 11px !important;
  }
}
`;