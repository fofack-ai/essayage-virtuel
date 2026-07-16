<<<<<<< HEAD
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ProductCard({ product }) {
  const { t } = useTranslation();
=======
import { Link, useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  // Clic sur la carte → fiche produit
  const openProduct = () => navigate(`/product/${product.id}`);
>>>>>>> origin/main

  return (
    <article className="product-card-wrap">
      {/* La carte = juste l'image (cliquable) */}
      <div
        className="product-card"
        style={{ backgroundImage: `url(${product.image})` }}
        onClick={openProduct}
      >
        <div className="product-overlay" />

        <div className="product-actions">
<<<<<<< HEAD
          <Link to={`/product/${product.id}`}>{t('shop.productCard.view')}</Link>
          <Link to={`/tryon?productId=${product.id}`}>{t('shop.productCard.tryOn')}</Link>
=======
          {/* stopPropagation : sinon le clic déclenche AUSSI openProduct */}
          <Link
            to={`/product/${product.id}`}
            className="action-voir"
            onClick={(e) => e.stopPropagation()}
          >
            Voir
          </Link>
          <Link
            to={`/tryon?productId=${product.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            Essayer virtuellement
          </Link>
>>>>>>> origin/main
        </div>
      </div>

      {/* Infos en dessous (cliquables aussi) */}
      <div className="product-info-below" onClick={openProduct}>
        <h3>{product.name}</h3>
        <div className="product-price">
          <strong>{product.price}</strong> FCFA
        </div>
      </div>
    </article>
  );
}