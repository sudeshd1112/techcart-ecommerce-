import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import { categories } from "../data/products";
import { fetchProducts } from "../services/api";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchProducts()
      .then((data) => {
        if (isMounted) {
          setFeaturedProducts(data.slice(0, 3));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home-page">
      <Hero />

      {/* Categories section */}
      <section className="categories-section" id="categories">
        <div className="section-header">
          <p>SHOP BY CATEGORY</p>
          <h2>Find What You Need</h2>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              to={`/products?category=${encodeURIComponent(category.name)}`}
              key={category.id}
              className="category-card-wrapper"
            >
              <CategoryCard icon={category.icon} name={category.name} />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products section */}
      <section className="products-section">
        <div className="section-header featured-header">
          <div>
            <p>OUR PRODUCTS</p>
            <h2>Featured Products</h2>
          </div>
          <Link to="/products" className="view-all-link">
            View All Products &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading featured products...</p>
          </div>
        ) : error ? (
          <div className="error-alert">
            <p>Unable to load products from server: {error}</p>
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
