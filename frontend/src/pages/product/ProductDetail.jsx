import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { api, getImageUrl } from "../../services/api";

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const VIEW_ICONS = ['📷', '🔍', '📐', '✨'];

const COLOR_NAMES = {
  '#c9a96e': 'Or Sable',
  '#c4573a': 'Terracotta',
  '#2d2420': 'Noir Ébène',
  '#7a8c6e': 'Vert Sauge',
  '#f5f0e8': 'Blanc Ivoire',
  '#1a1410': 'Noir Profond',
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
const [loading, setLoading] = useState(true);

  const [activeThumb, setActiveThumb] = useState(0);
  const [selectedColor, setSelectedColor] = useState("#1a1410");
  const [selectedSize, setSelectedSize] = useState("M");
  const [added, setAdded] = useState(false);

useEffect(() => {
  async function loadProduct() {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      const p = response.data;

      if (!p) {
        setProduct(null);
        return;
      }

      const formattedProduct = {
        id: p.id,
        name: p.name,
        brand: p.brand || "TryOn",
        category: p.categoryName || p.category || "Catalogue",
        price: Number(p.price),
        description: p.description || "Description non disponible",
        colors: p.color ? [p.color] : ["#1a1410"],
        sizes: p.sizes?.length
          ? p.sizes.map((s) => ({
              id: s.sizeId || s.id,
              label: s.sizeLabel || s.label || s.size,
              stock: Number(s.stock || 0),
            }))
          : [],
        image: getImageUrl(p.image || p.imageUrl || p.mainImage || p.images?.[0]?.imageUrl),
        rating: 4.8,
        reviews: 12,
      };

      setProduct(formattedProduct);
      setSelectedColor(formattedProduct.colors[0]);
      setSelectedSize(formattedProduct.sizes[0]);
    } catch (error) {
      console.error("Erreur produit :", error.message);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  loadProduct();
}, [id]);

  if (loading) {
    return <div style={{ paddingTop: 140, textAlign: "center" }}>Chargement...</div>;
  }

  if (!product) {
    return (
      <div style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: 32, marginBottom: 12 }}>
          Produit introuvable
        </h2>
        <p style={{ color: '#6A6F78', marginBottom: 24 }}>
          Ce produit n'existe pas ou n'est plus disponible.
        </p>
        <Link to="/catalogue" className="btn-outline">Retour au catalogue</Link>
      </div>
    );
  }

  const productImg = product?.image || "/product-placeholder.jpg";
  const availableSizes = product.sizes.filter((s) => s.stock > 0);
  const sizesToShow = ALL_SIZES;

  const handleAdd = async () => {
    const selectedSizeInfo = product.sizes.find((s) => s.label === selectedSize);

    if (!selectedSizeInfo || selectedSizeInfo.stock <= 0) {
      alert("Veuillez choisir une taille disponible.");
      return;
    }

    try {
      const selectedSizeInfo = product.sizes.find(
        (s) => s.label === selectedSize
      );

      if (!selectedSizeInfo || selectedSizeInfo.stock <= 0) {
        alert("Veuillez choisir une taille disponible.");
        return;
      }

      await addItem({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        image: productImg,
        size: selectedSize,
        sizeStock: selectedSizeInfo.stock,
        color: selectedColor,
        qty: 1,
      });

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      alert(error.message || "Impossible d'ajouter au panier");
    }
  };

  return (
    <div style={{ paddingTop: 64 }}>
      {/* Breadcrumb */}
      <div style={{ padding:'12px 48px', fontSize:12, color:'#6A6F78', display:'flex', gap:8, borderBottom:'1px solid rgba(26,26,26,.105)', background:'#fff' }}>
        <Link to="/" style={{ color:'#355C86', textDecoration:'none' }}>Accueil</Link>
        <span>›</span>
        <Link to="/catalogue" style={{ color:'#355C86', textDecoration:'none' }}>Catalogue</Link>
        <span>›</span>
        <span>{product.name}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:'calc(100vh - 104px)' }}>

        {/* Galerie */}
        <div style={{
          position:'sticky', top:64, height:'calc(100vh - 104px)',
          background:'linear-gradient(160deg,#f5f0e8,#ede5d8)',
          display:'flex', flexDirection:'column',
        }}>
          <div style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center',
            position:'relative', overflow:'hidden',
          }}>
            {activeThumb === 0 ? (
              <img src={productImg} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            ) : (
              <span style={{ fontSize:180, opacity:.2 }}>{VIEW_ICONS[activeThumb]}</span>
            )}
            <div style={{
              position:'absolute', top:24, right:24,
              background:'#1A1A1A', color:'#F9F9F9',
              padding:'8px 16px', borderRadius:100,
              fontSize:11, fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase',
              display:'flex', alignItems:'center', gap:6,
            }}>✨ Vue 3D disponible</div>
          </div>
          <div style={{ display:'flex', gap:8, padding:'16px 24px', borderTop:'1px solid rgba(26,26,26,.105)' }}>
            {VIEW_ICONS.map((icon, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setActiveThumb(i)}
                aria-label={`Vue ${i + 1}`}
                style={{
                  width:72, height:90, borderRadius:10, padding:0,
                  background: i === 0 ? `url(${productImg}) center/cover` : 'rgba(26,20,16,.08)',
                  cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:28,
                  border:`2px solid ${activeThumb === i ? '#1A1A1A' : 'transparent'}`,
                  opacity: activeThumb === i ? 1 : 0.4,
                  transition:'all .2s',
                }}
              >{i !== 0 && icon}</button>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <div style={{ padding:'64px 56px', overflowY:'auto' }}>
          <div style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#355C86', marginBottom:8 }}>
            {product.brand}
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:44, fontWeight:300, lineHeight:1.1, marginBottom:12 }}>
            {product.name}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <span style={{ color:'#355C86', fontSize:14, letterSpacing:2 }}>★★★★★</span>
            <span style={{ fontSize:13, color:'#6A6F78' }}>{product.rating} · {product.reviews} avis</span>
          </div>

          <div style={{ marginBottom:32 }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:600 }}>
              {product.old && (
                <span style={{ fontSize:18, color:'#6A6F78', textDecoration:'line-through', marginRight:10 }}>
                  {product.old.toLocaleString()}
                </span>
              )}
              {product.price.toLocaleString()} <small style={{ fontSize:16, fontWeight:300 }}>FCFA</small>
            </div>
            {product.old && (
              <span style={{ fontSize:12, background:'rgba(184,50,40,.10)', color:'#B83228', padding:'3px 10px', borderRadius:100, fontWeight:600 }}>
                Économisez {(product.old - product.price).toLocaleString()} FCFA
              </span>
            )}
          </div>

          {/* Couleur */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:12, fontWeight:500, letterSpacing:'1.5px', textTransform:'uppercase', color:'#6A6F78', marginBottom:12, display:'flex', justifyContent:'space-between' }}>
              Couleur <span style={{ color:'#355C86', textTransform:'none', letterSpacing:0 }}>
                {COLOR_NAMES[selectedColor] || ''}
              </span>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {product.colors.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  aria-label={COLOR_NAMES[c] || c}
                  style={{
                    width:36, height:36, borderRadius:'50%', background:c, padding:0,
                    cursor:'pointer', border:c==='#f5f0e8' ? '1.5px solid #ddd' : '3px solid transparent',
                    outline: selectedColor===c ? '2px solid #B83228' : '2px solid transparent',
                    outlineOffset:3, transition:'all .2s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Taille */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:12, fontWeight:500, letterSpacing:'1.5px', textTransform:'uppercase', color:'#6A6F78', marginBottom:12, display:'flex', justifyContent:'space-between' }}>
              Taille <Link to="/size-guide" style={{ color:'#355C86', textTransform:'none', letterSpacing:0, textDecoration:'none' }}>Guide des tailles →</Link>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {sizesToShow.map(s => {
                const sizeInfo = product.sizes.find((size) => size.label === s);
                const available = Boolean(sizeInfo && sizeInfo.stock > 0);
                const on = selectedSize === s;
                return (
                  <button type="button" key={s} disabled={!available} onClick={() => available && setSelectedSize(s)} style={{
                    width:52, height:52, borderRadius:10,
                    border:`1.5px solid ${on ? '#1A1A1A' : 'rgba(26,26,26,.11)'}`,
                    background: on ? '#1A1A1A' : '#fff',
                    color: on ? '#F9F9F9' : !available ? '#ccc' : '#1A1A1A',
                    fontSize:14, fontWeight:500, cursor: available ? 'pointer' : 'not-allowed',
                    opacity: available ? 1 : 0.4, transition:'all .2s',
                    textDecoration: available ? 'none' : 'line-through',
                  }}>
                    <>
                      {s}
                      {sizeInfo && (
                        <small
                          style={{
                            display: "block",
                            fontSize: 9,
                            marginTop: 2,
                            opacity: 0.75,
                          }}
                        >
                          {sizeInfo.stock}
                        </small>
                      )}
                    </>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Boutons */}
          <button type="button" onClick={() => navigate(`/tryon?productId=${product.id}`)} style={{
            width:'100%', padding:18, borderRadius:10,
            background:'linear-gradient(135deg,#355C86,#26384D)',
            color:'#F9F9F9', border:'none', cursor:'pointer',
            fontSize:13, fontWeight:600, letterSpacing:2, textTransform:'uppercase',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            marginBottom:12, transition:'all .25s',
          }}>
            <span style={{ fontSize:18 }}>✨</span> Essayer Virtuellement
          </button>

          <button type="button" onClick={handleAdd} style={{
            width:'100%', padding:18, borderRadius:10,
            background: added ? '#06D6A0' : 'transparent',
            color: added ? '#fff' : 'var(--ink)',
            border:'1.5px solid var(--ink)', cursor:'pointer',
            fontSize:13, fontWeight:500, letterSpacing:2, textTransform:'uppercase',
            transition:'all .25s', marginBottom:24,
          }}>
            {added ? '✓ Ajouté au panier' : 'Ajouter au panier'}
          </button>

          {/* Avantages */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, padding:'20px 0', borderTop:'1px solid rgba(26,26,26,.105)' }}>
            {[
              ['🚚','Livraison rapide à Douala'],
              ['↩️','Retour gratuit sous 30 jours'],
              ['🔒','Paiement sécurisé Orange Money & MTN'],
              ['📦','Expédition sous 24h ouvrées'],
            ].map(([icon,text]) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#6A6F78' }}>
                <span style={{ fontSize:16 }}>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}