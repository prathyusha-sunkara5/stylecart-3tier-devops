import { useEffect, useMemo, useState } from 'react';

const money = value => `₹${Number(value).toLocaleString('en-IN')}`;

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState({ name: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (search) params.set('search', search);

    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(setProducts)
      .catch(() => setMessage('Unable to connect to the backend.'));
  }, [category, search]);

  const categories = useMemo(
    () => ['All', ...new Set(products.map(p => p.category))],
    [products]
  );

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function addToCart(product) {
    setCart(current => {
      const found = current.find(item => item.id === product.id);
      if (found) {
        return current.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  function updateQuantity(id, delta) {
    setCart(current =>
      current
        .map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
        .filter(item => item.quantity > 0)
    );
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (!customer.name || !customer.email || cart.length === 0) {
      setMessage('Enter your details and add at least one product.');
      return;
    }

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: customer.name,
        customerEmail: customer.email,
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Order failed.');
      return;
    }

    setMessage(`Order #${data.orderId} placed successfully. Total: ${money(data.total)}`);
    setCart([]);
  }

  return (
    <div className="page">
      <header className="hero">
        <nav>
          <div className="logo">StyleCart</div>
          <a href="#shop">Shop</a>
          <a href="#checkout">Checkout</a>
          <span className="cart-badge">Cart: {cart.reduce((s, i) => s + i.quantity, 0)}</span>
        </nav>
        <div className="hero-content">
          <p className="eyebrow">NEW SEASON / EVERYDAY STYLE</p>
          <h1>Wear what feels like you.</h1>
          <p>Curated fashion essentials for workdays, weekends and everything in between.</p>
          <a className="button" href="#shop">Explore collection</a>
        </div>
      </header>

      <main>
        <section id="shop" className="shop">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE COLLECTION</p>
              <h2>Find your everyday favorites</h2>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
            />
          </div>

          <div className="categories">
            {categories.map(item => (
              <button
                key={item}
                className={category === item ? 'active' : ''}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid">
            {products.map(product => (
              <article className="card" key={product.id}>
                <img src={product.imageUrl} alt={product.name} />
                <div className="card-body">
                  <small>{product.category}</small>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="card-footer">
                    <strong>{money(product.price)}</strong>
                    <button className="button small" onClick={() => addToCart(product)}>Add</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="checkout" id="checkout">
          <div>
            <p className="eyebrow">YOUR BAG</p>
            <h2>Checkout</h2>
            {cart.length === 0 ? <p>Your cart is empty.</p> : (
              <div className="cart">
                {cart.map(item => (
                  <div className="cart-row" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{money(item.price)}</span>
                    </div>
                    <div className="quantity">
                      <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
                <h3>Total: {money(total)}</h3>
              </div>
            )}
          </div>

          <form onSubmit={placeOrder}>
            <input
              placeholder="Full name"
              value={customer.name}
              onChange={e => setCustomer({ ...customer, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email address"
              value={customer.email}
              onChange={e => setCustomer({ ...customer, email: e.target.value })}
            />
            <button className="button" type="submit">Place order</button>
            {message && <p className="message">{message}</p>}
          </form>
        </section>
      </main>

      <footer>StyleCart · Three-Tier DevOps Demonstration Project</footer>
    </div>
  );
}
