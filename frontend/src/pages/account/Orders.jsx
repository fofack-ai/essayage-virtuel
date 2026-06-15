import React from "react";

export default function Orders() {
const orders = [
  {
    id: "#TRY-2026-001",
    date: "12 Juin 2026",
    total: 39500,
    status: "Livrée",
    image: "/auth-login.jpg",
  },
  {
    id: "#TRY-2026-002",
    date: "08 Juin 2026",
    total: 18500,
    status: "En préparation",
    image: "/product-2.jpg",
  },
  {
    id: "#TRY-2026-003",
    date: "03 Juin 2026",
    total: 25000,
    status: "Expédiée",
    image: "/product-3.jpg",
  },
];

  const formatPrice = (price) =>
    new Intl.NumberFormat("fr-FR").format(price);

  const getStatusColor = (status) => {
    switch (status) {
      case "Livrée":
        return "#22C55E";
      case "Expédiée":
        return "#3B82F6";
      case "En préparation":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  return (
    <div className="orders-page">
      <style>{styles}</style>

      <section className="orders-hero">
        <span>Compte Client</span>
        <h1>Mes commandes</h1>
        <p>Retrouvez l'historique complet de vos achats.</p>
      </section>

      <section className="orders-container">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div
              className="order-image"
              style={{
                backgroundImage: `url(${order.image})`,
              }}
            />

            <div className="order-content">
              <div>
                <h3>{order.id}</h3>
                <p>{order.date}</p>
              </div>

              <div
                className="status"
                style={{
                  background: getStatusColor(order.status),
                }}
              >
                {order.status}
              </div>

              <div className="price">
                {formatPrice(order.total)} FCFA
              </div>

              <button className="details-btn">
                Voir les détails
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

const styles = `
.orders-page{
background:#F8F8F8;
min-height:100vh;
padding-top:72px;
}

.orders-hero{
text-align:center;
padding:70px 20px;
}

.orders-hero span{
color:#E30613;
font-size:12px;
font-weight:800;
letter-spacing:4px;
text-transform:uppercase;
}

.orders-hero h1{
font-family:'Cormorant Garamond',serif;
font-size:80px;
font-weight:300;
margin:10px 0;
}

.orders-hero p{
color:#6B7280;
font-size:18px;
}

.orders-container{
max-width:1400px;
margin:auto;
padding:0 40px 80px;
display:flex;
flex-direction:column;
gap:25px;
}

.order-card{
background:#fff;
border-radius:30px;
overflow:hidden;
display:grid;
grid-template-columns:300px 1fr;
box-shadow:0 15px 40px rgba(0,0,0,.08);
transition:.3s;
}

.order-card:hover{
transform:translateY(-5px);
}

.order-image{
  height:220px;
  background-size:cover;
  background-position:center;
  background-repeat:no-repeat;
}

.order-content{
padding:35px;
display:flex;
align-items:center;
justify-content:space-between;
gap:20px;
}

.order-content h3{
font-size:26px;
margin-bottom:8px;
}

.order-content p{
color:#6B7280;
}

.status{
padding:10px 18px;
border-radius:999px;
color:white;
font-weight:700;
}

.price{
font-size:28px;
font-weight:900;
}

.details-btn{
border:none;
background:#111;
color:white;
padding:14px 28px;
border-radius:999px;
cursor:pointer;
font-weight:700;
transition:.3s;
}

.details-btn:hover{
background:#E30613;
transform:translateY(-2px);
}

@media(max-width:900px){

.order-card{
grid-template-columns:1fr;
}

.order-content{
flex-direction:column;
align-items:flex-start;
}

.order-image{
height:200px;
}

.orders-hero h1{
font-size:60px;
}

}
`;