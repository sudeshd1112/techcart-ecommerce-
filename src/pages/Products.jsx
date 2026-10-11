import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { categories } from "../data/products";
import { fetchProducts } from "../services/api";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync category if URL param changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Fetch products from backend API whenever filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Debounce search query slightly
    const timer = setTimeout(() => {
      fetchProducts(selectedCategory, searchQuery)
        .then((data) => {
          if (isMounted) {
            setProductsList(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message);
            setLoading(false);
          }
        });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedCategory, searchQuery]);

  function handleCategoryChange(categoryName) {
    setSelectedCategory(categoryName);
    if (categoryName === "All") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: categoryName });
    }
  }

  return (
    <div className="products-page">
      <div className="products-page-header">
        <div className="page-title-box">
          <p className="page-subtitle">EXPLORE CATALOG</p>
          <h1>All Products</h1>
          <p className="page-desc">
            Browse our complete selection of cutting-edge technology and gadgets.
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-bar-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="filter-container">
        <button
          className={`filter-btn ${selectedCategory === "All" ? "active" : ""}`}
          onClick={() => handleCategoryChange("All")}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-btn ${
              selectedCategory === cat.name ? "active" : ""
            }`}
            onClick={() => handleCategoryChange(cat.name)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid, Loading, or Empty State */}
      <div className="products-results-info">
        {!loading && (
          <span>
            Showing {productsList.length} product{productsList.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading products from database...</p>
        </div>
      ) : error ? (
        <div className="error-alert">
          <p>Unable to load products. {error}</p>
        </div>
      ) : productsList.length > 0 ? (
        <div className="products-grid">
          {productsList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-results">
          <div className="empty-icon">🔎</div>
          <h3>No products found</h3>
          <p>
            We couldn't find any products matching your search or filter. Try a different term or reset filters.
          </p>
          <button
            className="primary-button"
            onClick={() => {
              setSearchQuery("");
              handleCategoryChange("All");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default Products;
