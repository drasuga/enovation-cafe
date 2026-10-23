'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const fmt = (n) => n.toLocaleString('fr-FR') + ' FCFA';

export default function MenuClient({ categories, items, initialTable }) {
  const router = useRouter();
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [tableNumber, setTableNumber] = useState(initialTable || '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const cartLines = useMemo(
    () => items.filter((i) => cart[i.id]).map((i) => ({ ...i, quantity: cart[i.id] })),
    [items, cart]
  );
  const total = cartLines.reduce((s, l) => s + l.price * l.quantity, 0);
  const count = cartLines.reduce((s, l) => s + l.quantity, 0);

  function add(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }

  function remove(id) {
    setCart((c) => {
      const next = { ...c };
      const q = (c[id] || 0) - 1;
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!tableNumber.trim()) {
      setError('Veuillez entrer votre numéro de table.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          customerName,
          customerPhone,
          items: cartLines.map((l) => ({ id: l.id, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Une erreur est survenue.');
      router.push(`/order/${data.orderId}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <>
      {categories.map((cat) => (
        <section key={cat.id}>
          <h2 className="category-title">{cat.name}</h2>
          {items
            .filter((item) => item.category_id === cat.id)
            .map((item) => (
              <div className="item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
                <div className="item-side">
                  <div className="price">{fmt(item.price)}</div>
                  <div className="qty">
                    {cart[item.id] ? (
                      <>
                        <button className="minus" onClick={() => remove(item.id)}>−</button>
                        <span>{cart[item.id]}</span>
                      </>
                    ) : null}
                    <button onClick={() => add(item.id)}>+</button>
                  </div>
                </div>
              </div>
            ))}
        </section>
      ))}

      {count > 0 && !showCart && (
        <button className="cart-bar" onClick={() => setShowCart(true)}>
          <span>Voir le panier ({count})</span>
          <span>{fmt(total)}</span>
        </button>
      )}

      {showCart && (
        <>
          <div className="sheet-backdrop" onClick={() => setShowCart(false)} />
          <div className="sheet">
            <h2 className="category-title" style={{ marginTop: 0 }}>Votre commande</h2>

            {cartLines.length === 0 && <p>Votre panier est vide.</p>}

            {cartLines.map((l) => (
              <div className="line" key={l.id}>
                <div>
                  <strong>{l.name}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {fmt(l.price)} × {l.quantity}
                  </div>
                </div>
                <div className="qty">
                  <button className="minus" onClick={() => remove(l.id)}>−</button>
                  <span>{l.quantity}</span>
                  <button onClick={() => add(l.id)}>+</button>
                </div>
              </div>
            ))}

            <div className="total-row">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>

            <form onSubmit={submit}>
              <label className="field">
                <span>Numéro de table *</span>
                <input
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Ex : 5"
                  inputMode="numeric"
                  maxLength={10}
                />
              </label>
              <label className="field">
                <span>Votre nom (optionnel)</span>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  maxLength={60}
                />
              </label>
              <label className="field">
                <span>Téléphone (optionnel)</span>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  inputMode="tel"
                  maxLength={20}
                />
              </label>

              {error && <p className="error">{error}</p>}

              <button className="primary-btn" type="submit" disabled={submitting || cartLines.length === 0}>
                {submitting ? 'Envoi...' : 'Valider la commande'}
              </button>
              <button
                type="button"
                className="primary-btn"
                style={{ background: 'transparent', color: 'var(--brand-dark)', marginTop: 8 }}
                onClick={() => setShowCart(false)}
              >
                Continuer mes achats
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}