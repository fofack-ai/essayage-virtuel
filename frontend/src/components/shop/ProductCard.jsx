import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Clic sur la carte → fiche produit
  const handleOpenProduct = () => navigate(`/product/${product.id}`);

  return (
    <article className="product-card-wrap">
      {/* La carte = juste l'image (cliquable) */}
      <div
        className="product-card"
        onClick={handleOpenProduct}
        style={{ cursor: 'pointer', backgroundImage: `url(${product.image})` }}
      >
        <div className="product-overlay" />
        <div className="product-actions">
          {/* stopPropagation : sinon le clic déclenche AUSSI handleOpenProduct */}
          <Link
            to={`/product/${product.id}`}
            className="action-voir"
            onClick={(e) => e.stopPropagation()}
          >
            {t('shop.productCard.view')}
          </Link>
          <Link
            to={`/tryon?productId=${product.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            {t('shop.productCard.tryOn')}
          </Link>
        </div>
      </div>

      {/* Infos en dessous (cliquables aussi) */}
      <div className="product-info-below" onClick={handleOpenProduct} style={{ cursor: 'pointer' }}>
        <h3>{product.name}</h3>
        <div className="product-price">
          <strong>{product.price}</strong> FCFA
        </div>
      </div>
    </article>
  );
}