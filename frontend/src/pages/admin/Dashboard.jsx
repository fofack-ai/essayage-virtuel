import { useState } from "react";
import { Link } from "react-router-dom";

const orders = [
  { id: "#0042", client: "Marie Ngo", status: "LIVRÉ", total: "15 000" },
  { id: "#0041", client: "Paul Mbarga", status: "EN COURS", total: "32 000" },
  { id: "#0040", client: "Aline Ebanda", status: "LIVRÉ", total: "9 800" },
  { id: "#0039", client: "Jean Ateba", status: "ANNULÉ", total: "18 500" },
];

const products = [
  { icon: "👗", name: "Robe Évasée Florale", collection: "Collection Printemps", price: "15 000", status: "EN STOCK" },
  { icon: "🧥", name: "Veste Structurée", collection: "Élégance Moderne", price: "19 500", status: "FAIBLE STOCK" },
  { icon: "👕", name: "Chemise Lin Premium", collection: "Casual Chic", price: "9 800", status: "EN STOCK" },
  { icon: "👔", name: "Ensemble Tailleur", collection: "Business Style", price: "32 000", status: "EN STOCK" },
];

const clients = [
  { name: "Marie Ngo", email: "marie@tryon.cm", orders: 3, total: "62 000", status: "Actif" },
];

const tryons = [
  { client: "Marie Ngo", product: "Robe Évasée Florale", score: "94%", action: "AJOUT PANIER" },
  { client: "Aline Ebanda", product: "Ensemble Tailleur", score: "89%", action: "FAVORI" },
  { client: "Paul Mbarga", product: "Blazer Lin Sable", score: "91%", action: "AJOUT PANIER" },
  { client: "Nadia Kenfack", product: "Kimono Wax Court", score: "87%", action: "COMPARAISON" },
];

export default function Dashboard() {
  const [active, setActive] = useState("dashboard");
  const [page, setPage] = useState(1);

  const changeSection = (section) => {
    setActive(section);
    setPage(1);
  };

  return (
    <div className="admin-page">
      <style>{styles}</style>

      <aside className="admin-sidebar">
        <div className="brand-box">
          <div>
            <h2>TryOn</h2>
            <p>Application de mode africaine et cabine d’essayage virtuelle · Douala</p>
          </div>
        </div>

        <div className="side-title">Gestion</div>

        <button className={active === "dashboard" ? "active" : ""} onClick={() => changeSection("dashboard")}>
          <span>📊</span> Tableau de bord
        </button>

        <button className={active === "commandes" ? "active" : ""} onClick={() => changeSection("commandes")}>
          <span>📦</span> Commandes
        </button>

        <button className={active === "produits" ? "active" : ""} onClick={() => changeSection("produits")}>
          <span>👗</span> Produits
        </button>

        <button className={active === "clients" ? "active" : ""} onClick={() => changeSection("clients")}>
          <span>👥</span> Clients
        </button>

        <div className="side-title">Analyse</div>

        <button className={active === "essayages" ? "active" : ""} onClick={() => changeSection("essayages")}>
          <span>✨</span> Essayages
        </button>

        <button className={active === "ventes" ? "active" : ""} onClick={() => changeSection("ventes")}>
          <span>📈</span> Ventes
        </button>

        <div className="admin-mini">
          <div className="avatar">A</div>
          <div>
            <strong>Admin TryOn</strong>
            <small>admin@tryon.cm</small>
          </div>
        </div>

        <Link to="/" className="logout">🚪 Déconnexion</Link>
      </aside>

      <main className="admin-main">
        {active === "dashboard" && <DashboardHome />}
        {active === "produits" && <Products />}
        {active === "essayages" && <Tryons page={page} setPage={setPage} />}
        {active === "ventes" && <Sales />}
        {active === "commandes" && <SimpleTable title="Gestion des commandes" label="Commandes" data={orders} />}
        {active === "clients" && <Clients />}
      </main>
    </div>
  );
}

function DashboardHome() {
  return (
    <>
      <div className="kpi-grid">
        <Kpi title="Ventes du jour" value="142 K" note="↑ +12.5% vs hier" />
        <Kpi title="Nouvelles commandes" value="28" note="↑ +5 vs hier" />
        <Kpi title="Essayages virtuels" value="156" note="↑ +34% ce mois" />
        <Kpi title="Taux conversion" value="68%" note="↓ -2% vs semaine" />
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="card-title">
            <h3>Dernières commandes</h3>
            <span>Voir tout →</span>
          </div>

          {orders.map((order) => (
            <div className="mini-row" key={order.id}>
              <strong>{order.id}</strong>
              <span>{order.client}</span>
              <em className={order.status === "ANNULÉ" ? "red" : ""}>{order.status}</em>
              <b>{order.total}</b>
            </div>
          ))}
        </section>

        <section className="card">
          <div className="card-title">
            <h3>Ventes des 7 derniers jours</h3>
            <span>Rapport complet →</span>
          </div>

          <div className="bars">
            {[45, 70, 55, 92, 65, 40, 82].map((height, i) => (
              <div key={i} style={{ height: `${height}%` }}>
                <span>{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function Products() {
  return (
    <>
      <div className="page-head">
        <div>
          <span>Catalogue</span>
          <h1>Gestion des <em>produits</em></h1>
        </div>
        <button className="dark-btn">+ Nouveau produit</button>
      </div>

      <div className="products-grid">
        {products.map((p) => (
          <div className="product-admin-card" key={p.name}>
            <div className="prod-icon">{p.icon}</div>
            <div>
              <h3>{p.name}</h3>
              <p>{p.collection}</p>
              <strong>{p.price} FCFA</strong>
            </div>
            <span className={p.status === "FAIBLE STOCK" ? "stock low" : "stock"}>{p.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Tryons({ page, setPage }) {
  return (
    <>
      <div className="page-head">
        <div>
          <span>Cabine virtuelle</span>
          <h1>Suivi des <em>essayages</em></h1>
        </div>
        <button className="outline-btn">Voir la cabine</button>
      </div>

      <div className="kpi-grid">
        <Kpi title="Essayages aujourd’hui" value="156" note="↑ +34%" />
        <Kpi title="Score moyen IA" value="91%" note="Très bon" />
        <Kpi title="Ajouts panier après essai" value="64" note="Conversion forte" />
        <Kpi title="Produit le plus essayé" value="Robe" note="Florale" />
      </div>

      <section className="card table-card">
        <h3>Derniers essayages</h3>

        <div className="table">
          <div className="table-row head">
            <span>Client</span>
            <span>Produit</span>
            <span>Score IA</span>
            <span>Action</span>
          </div>

          {tryons.map((t) => (
            <div className="table-row" key={t.client}>
              <span>{t.client}</span>
              <span>{t.product}</span>
              <span>{t.score}</span>
              <em className={t.action === "FAVORI" || t.action === "COMPARAISON" ? "red" : ""}>{t.action}</em>
            </div>
          ))}
        </div>
      </section>

      <Pagination page={page} setPage={setPage} totalPages={2} />
    </>
  );
}

function Sales() {
  return (
    <>
      <div className="page-head">
        <div>
          <span>Performance</span>
          <h1>Analyse des <em>ventes</em></h1>
        </div>
        <button className="dark-btn">Télécharger rapport</button>
      </div>

      <div className="sales-grid">
        <section className="card sales-card">
          <h3>Objectif mensuel</h3>
          <div className="progress">
            <div />
          </div>
          <p>72% de l’objectif atteint · 1 420 000 FCFA / 2 000 000 FCFA</p>
        </section>

        <section className="card sales-card">
          <h3>Répartition</h3>
          {[
            ["Robes", "42%"],
            ["Vestes", "25%"],
            ["Chemises", "18%"],
            ["Accessoires", "15%"],
          ].map(([name, value]) => (
            <div className="split-row" key={name}>
              <strong>{name}</strong>
              <span>{value}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

function Clients() {
  return <SimpleTable title="Gestion des clients" label="Clients" data={clients} />;
}

function SimpleTable({ title, label, data }) {
  return (
    <>
      <div className="page-head">
        <div>
          <span>{label}</span>
          <h1>{title}</h1>
        </div>
      </div>

      <section className="card table-card">
        <div className="table">
          {data.map((item, index) => (
            <div className="table-row simple" key={index}>
              {Object.values(item).map((value, i) => (
                <span key={i}>{value}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <Pagination page={1} setPage={() => {}} totalPages={1} />
    </>
  );
}

function Kpi({ title, value, note }) {
  return (
    <div className="kpi-card">
      <span>{title}</span>
      <h2>{value}</h2>
      <p>{note}</p>
      <div className="kpi-line" />
    </div>
  );
}

function Pagination({ page, setPage, totalPages }) {
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>←</button>
      {Array.from({ length: totalPages }).map((_, i) => (
        <button key={i} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>
          {i + 1}
        </button>
      ))}
      <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</button>
    </div>
  );
}

const styles = `
.admin-page {
  padding-top: 72px;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 230px 1fr;
  background: #F4F7FA;
}

.admin-sidebar {
  background: #030303;
  color: white;
  min-height: calc(100vh - 72px);
  position: sticky;
  top: 72px;
  display: flex;
  flex-direction: column;
  padding: 18px 0;
}

.brand-box {
  display: flex;
  gap: 12px;
  padding: 0 18px 22px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.logo-box {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: white;
  color: #111;
  font-size: 12px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-box h2 {
  font-size: 28px;
  margin: 0;
}

.brand-box p {
  color: rgba(255,255,255,.45);
  font-size: 11px;
  line-height: 1.5;
}

.side-title {
  padding: 18px 22px 8px;
  color: rgba(255,255,255,.28);
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.admin-sidebar button {
  width: 100%;
  border: 0;
  background: transparent;
  color: rgba(255,255,255,.55);
  padding: 14px 22px;
  text-align: left;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  gap: 14px;
  align-items: center;
  border-left: 4px solid transparent;
}

.admin-sidebar button:hover,
.admin-sidebar button.active {
  background: rgba(227,6,19,.25);
  color: white;
  border-left-color: #E30613;
}

.admin-mini {
  margin: auto 18px 12px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255,255,255,.07);
  display: flex;
  gap: 10px;
  align-items: center;
}

.avatar {
  width: 36px;
  height: 36px;
  background: #E30613;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.admin-mini small {
  display: block;
  color: rgba(255,255,255,.45);
  font-size: 11px;
}

.logout {
  margin: 0 18px;
  padding: 13px;
  border-radius: 16px;
  color: white;
  text-decoration: none;
  text-align: center;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  font-weight: 900;
  text-transform: uppercase;
}

.admin-main {
  padding: 32px 38px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 34px;
}

.kpi-card {
  background: white;
  border-radius: 22px;
  padding: 24px;
  min-height: 155px;
  box-shadow: 0 12px 32px rgba(47,83,120,.08);
}

.kpi-card span {
  color: #666;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.kpi-card h2 {
  font-family: 'Cormorant Garamond', serif;
  color: #E30613;
  font-size: 42px;
  font-weight: 300;
  margin: 18px 0 4px;
}

.kpi-card p {
  color: #355C86;
  font-size: 13px;
}

.kpi-line {
  width: 55%;
  height: 4px;
  background: #355C86;
  border-radius: 999px;
  margin-top: 22px;
}

.dashboard-grid,
.sales-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 24px;
  padding: 26px;
  box-shadow: 0 12px 32px rgba(47,83,120,.08);
}

.card-title,
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.page-head {
  margin-bottom: 34px;
}

.page-head span {
  color: #E30613;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.page-head h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 54px;
  font-weight: 300;
  margin-top: 8px;
}

.page-head em {
  color: #E30613;
  font-style: italic;
}

.dark-btn,
.outline-btn {
  padding: 16px 28px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.dark-btn {
  background: #111;
  color: white;
  border: 0;
}

.outline-btn {
  background: transparent;
  color: #355C86;
  border: 1.5px solid #355C86;
}

.mini-row {
  display: grid;
  grid-template-columns: .8fr 1.2fr .8fr .6fr;
  gap: 14px;
  padding: 15px 0;
  border-bottom: 1px solid rgba(26,26,26,.08);
}

.mini-row em,
.table-row em,
.stock {
  width: fit-content;
  background: #eee;
  padding: 6px 12px;
  border-radius: 999px;
  font-style: normal;
  font-size: 11px;
  font-weight: 900;
}

.red,
.low {
  background: #FDECEC !important;
  color: #E30613 !important;
}

.bars {
  height: 210px;
  display: flex;
  align-items: flex-end;
  gap: 14px;
  padding-top: 35px;
}

.bars div {
  flex: 1;
  background: #D9E4EF;
  border-radius: 8px 8px 0 0;
  position: relative;
}

.bars span {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  color: #666;
  font-size: 11px;
}

.products-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.product-admin-card {
  background: white;
  border-radius: 22px;
  padding: 22px;
  display: grid;
  grid-template-columns: 82px 1fr auto;
  gap: 18px;
  align-items: center;
  box-shadow: 0 12px 32px rgba(47,83,120,.08);
}

.prod-icon {
  width: 82px;
  height: 82px;
  border-radius: 16px;
  background: #EEF3F8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
}

.product-admin-card h3 {
  margin: 0 0 6px;
}

.product-admin-card p {
  color: #666;
  margin-bottom: 8px;
}

.table-card h3 {
  margin-bottom: 22px;
}

.table-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 16px 24px;
  border-bottom: 1px solid rgba(26,26,26,.08);
  align-items: center;
}

.table-row.head {
  background: #EEF3F8;
  color: #355C86;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.table-row.simple {
  grid-template-columns: repeat(5, 1fr);
}

.progress {
  height: 14px;
  background: #F1F1F1;
  border-radius: 999px;
  overflow: hidden;
  margin: 28px 0;
}

.progress div {
  width: 72%;
  height: 100%;
  background: linear-gradient(90deg,#111,#E30613);
  border-radius: 999px;
}

.split-row {
  display: flex;
  justify-content: space-between;
  padding: 18px 0;
  border-bottom: 1px solid rgba(26,26,26,.08);
  font-size: 18px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
}

.pagination button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1.5px solid rgba(26,26,26,.12);
  background: white;
  cursor: pointer;
  font-weight: 900;
}

.pagination button.active {
  background: #111;
  color: white;
}

.pagination button:disabled {
  opacity: .35;
}

@media(max-width: 1000px) {
  .admin-page {
    grid-template-columns: 1fr;
  }

  .kpi-grid,
  .dashboard-grid,
  .sales-grid,
  .products-grid {
    grid-template-columns: 1fr;
  }
}
`;