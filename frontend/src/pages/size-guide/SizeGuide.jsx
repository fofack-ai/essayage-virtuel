import React from 'react';
import { Link } from 'react-router-dom';

const sizes = [
  { s: 'XS', chest: '76–81', waist: '58–63', hip: '84–89' },
  { s: 'S',  chest: '82–87', waist: '64–69', hip: '90–95' },
  { s: 'M',  chest: '88–93', waist: '70–75', hip: '96–101' },
  { s: 'L',  chest: '94–99', waist: '76–81', hip: '102–107' },
  { s: 'XL', chest: '100–105', waist: '82–87', hip: '108–113' },
  { s: 'XXL', chest: '106–111', waist: '88–93', hip: '114–119' },
];

const measures = [
  { icon: '📏', title: 'Tour de poitrine', desc: 'Mesurez autour de la partie la plus forte de votre poitrine, en gardant le ruban horizontal.' },
  { icon: '📐', title: 'Tour de taille',   desc: 'Mesurez autour de la partie la plus fine de votre taille, généralement au niveau du nombril.' },
  { icon: '📏', title: 'Tour de hanches',  desc: 'Mesurez autour de la partie la plus forte de vos hanches et fesses.' },
  { icon: '📏', title: 'Longueur de jambe', desc: 'Mesurez de l\'entrejambe jusqu\'au sol, pieds nus.' },
];

export default function SizeGuide() {
  return (
    <div className="static-page">
      {/* Hero */}
      <section className="static-hero">
        <div className="static-hero-badge">📐 Guide des tailles</div>
        <h1 className="static-hero-title">Trouvez votre taille parfaite</h1>
        <p className="static-hero-sub">
          Pour un ajustement impeccable avec notre cabine d'essayage virtuel, suivez ces étapes simples pour prendre vos mesures.
        </p>
      </section>

      {/* Main */}
      <main className="static-main">
        {/* Comment mesurer */}
        <section className="static-section">
          <h2 className="static-h2">Comment prendre vos mesures</h2>
          <p className="static-p">
            Pour garantir un ajustement parfait avec notre cabine d'essayage virtuel, veuillez suivre ces étapes simples :
          </p>
          <div className="static-grid-2" style={{ marginTop: '1.5rem' }}>
            {measures.map(m => (
              <div key={m.title} className="static-card">
                <div className="static-card-title">{m.icon} {m.title}</div>
                <p className="static-card-text">{m.desc}</p>
              </div>
            ))}
          </div>
          <div className="static-note">
            💡 Conseil : pour plus de précision, demandez à quelqu'un de vous aider à prendre vos mesures.
          </div>
        </section>

        {/* Tableau */}
        <section className="static-section">
          <h2 className="static-h2">Tableau des tailles</h2>
          <p className="static-p" style={{ marginBottom: '1.5rem' }}>
            Toutes les mesures sont en centimètres (cm).
          </p>
          <div style={{ overflowX: 'auto', borderRadius: '14px' }}>
            <table className="size-table">
              <thead>
                <tr>
                  <th>Taille</th>
                  <th>Poitrine (cm)</th>
                  <th>Taille (cm)</th>
                  <th>Hanches (cm)</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map(r => (
                  <tr key={r.s}>
                    <td>{r.s}</td>
                    <td>{r.chest}</td>
                    <td>{r.waist}</td>
                    <td>{r.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="static-note">
            Ces mesures sont indicatives. Pour un ajustement optimal, utilisez notre fonctionnalité d'essayage virtuel.
          </div>
        </section>

        {/* Conseils */}
        <section className="static-section">
          <h2 className="static-h2">Entre deux tailles ?</h2>
          <p className="static-p">
            Si vos mesures se situent entre deux tailles, voici nos recommandations :
          </p>
          <ul className="static-ul">
            <li>Pour les hauts et robes : choisissez la taille supérieure si votre poitrine est plus grande.</li>
            <li>Pour les pantalons et jupes : choisissez la taille supérieure si vos hanches sont plus grandes.</li>
            <li>En cas de doute, n'hésitez pas à nous contacter pour un conseil personnalisé.</li>
          </ul>
        </section>

        {/* Taille internationale */}
        <section>
          <h2 className="static-h2">Correspondances internationales</h2>
          <div style={{ overflowX: 'auto', borderRadius: '14px' }}>
            <table className="size-table">
              <thead>
                <tr>
                  <th>TryOn</th>
                  <th>France (FR)</th>
                  <th>UK</th>
                  <th>US</th>
                  <th>Italie (IT)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['XS','34','6','2','38'],
                  ['S', '36','8','4','40'],
                  ['M', '38','10','6','42'],
                  ['L', '40','12','8','44'],
                  ['XL','42','14','10','46'],
                  ['XXL','44','16','12','48'],
                ].map(([s,fr,uk,us,it]) => (
                  <tr key={s}>
                    <td>{s}</td><td>{fr}</td><td>{uk}</td><td>{us}</td><td>{it}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* CTA */}
      <section className="static-cta">
        <h2 className="static-cta-title">Prêt pour un essayage parfait ?</h2>
        <p className="static-cta-sub">
          Utilisez nos mesures pour trouver votre taille idéale dans notre cabine d'essayage virtuel.
        </p>
        <Link to="/tryon" className="static-cta-btn">✨ Commencer l'essayage</Link>
      </section>
    </div>
  );
}