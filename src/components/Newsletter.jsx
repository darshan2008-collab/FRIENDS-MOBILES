import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export default function Newsletter({ onSubscribe }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      onSubscribe(email);
      setEmail('');
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container newsletter-banner">
        <div className="newsletter-left">
          <div className="mail-icon-badge">
            <Mail size={26} color="#FF5500" />
          </div>
          <div className="newsletter-text">
            <h3>WELCOME TO FRIENDS MOBILE</h3>
            <p>Subscribe to our newsletter for exclusive offers and updates</p>
          </div>
        </div>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <button type="submit" className="btn btn-orange">SUBSCRIBE</button>
        </form>
      </div>
    </section>
  );
}
