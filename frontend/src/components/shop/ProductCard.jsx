import { Link, useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  // Clic sur la carte → fiche produit
  const openProduct = () => navigate(`/product/${product.id}`);

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