import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-tag">LATEST TECHNOLOGY</p>

        <h1>
          Upgrade Your
          <br />
          <span>Tech Lifestyle</span>
        </h1>

        <p className="hero-description">
          Discover the latest smartphones, laptops, headphones and accessories
          at amazing prices.
        </p>

        <div className="hero-buttons">
          <Link to="/products" className="primary-button hero-link-btn">Shop Now</Link>
          <Link to="/products" className="secondary-button hero-link-btn">Explore Products</Link>
        </div>
      </div>

      <div className="hero-image">
        <div className="hero-circle">💻</div>
      </div>
    </section>
  );
}

export default Hero;
