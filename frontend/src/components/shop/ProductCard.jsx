import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <article
      className="product-card"
      style={{ backgroundImage: `url(${product.image})` }}
    >
      <div className="product-overlay" />

      <span className="product-badge">{product.tag}</span>

      <div className="product-content">
        <div className="product-category">{product.category}</div>
        <h3>{product.name}</h3>

        <div className="product-price">
          <strong>{product.price}</strong> FCFA
        </div>
      </div>

      <div className="product-actions">
        <Link to={`/product/${product.id}`}>Voir</Link>
        <Link to={`/tryon?productId=${product.id}`}>Essayer virtuellement</Link>
      </div>
    </article>
  );
}