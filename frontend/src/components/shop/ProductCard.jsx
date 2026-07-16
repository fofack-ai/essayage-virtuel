import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
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
          <Link to={`/product/${product.id}`}>Voir</Link>
          <Link to={`/tryon?productId=${product.id}`}>Essayer virtuellement</Link>
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