import { Link, useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  // Redirige vers la page de détails du produit au clic sur l'image ou sur les textes
  const handleOpenProduct = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <article className="product-card-wrap">
      {/* La carte = juste l'image (cliquable) */}
      <div
        className="product-card"
        onClick={handleOpenProduct}
        style={{ cursor: 'pointer', backgroundImage: `url(${product.image})` }}
      >
        <div className="product-overlay" />

        <div className="product-actions" onClick={(e) => e.stopPropagation()}>
          <Link to={`/product/${product.id}`}>Voir</Link>
          <Link to={`/tryon?productId=${product.id}`}>Essayer virtuellement</Link>
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