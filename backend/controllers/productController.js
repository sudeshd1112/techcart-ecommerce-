import pool from "../config/db.js";

// Helper to format product data for frontend consistency
function formatProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    oldPrice: row.old_price ? parseFloat(row.old_price) : parseFloat(row.price),
    category: row.category,
    rating: parseFloat(row.rating),
    image: row.image,
    createdAt: row.created_at,
  };
}

// @desc    Get all products
// @route   GET /api/products
export async function getProducts(req, res) {
  try {
    const { category, search } = req.query;

    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (category && category !== "All") {
      query += " AND category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND name LIKE ?";
      params.push(`%${search}%`);
    }

    query += " ORDER BY id ASC";

    const [rows] = await pool.query(query, params);
    const data = rows.map(formatProduct);

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
}

// @desc    Get single product by ID
// @route   GET /api/products/:id
export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: formatProduct(rows[0]),
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
}

// @desc    Create a new product
// @route   POST /api/products
export async function createProduct(req, res) {
  try {
    const { name, description, price, oldPrice, category, rating, image } = req.body;

    if (!name || price === undefined || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, price, category, and image",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, old_price, category, rating, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description || "", price, oldPrice || null, category, rating || 4.5, image]
    );

    const [newProduct] = await pool.query("SELECT * FROM products WHERE id = ?", [result.insertId]);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: formatProduct(newProduct[0]),
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating product",
    });
  }
}

// @desc    Update a product
// @route   PUT /api/products/:id
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, oldPrice, category, rating, image } = req.body;

    const [existing] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await pool.query(
      `UPDATE products 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           old_price = COALESCE(?, old_price),
           category = COALESCE(?, category),
           rating = COALESCE(?, rating),
           image = COALESCE(?, image)
       WHERE id = ?`,
      [name, description, price, oldPrice, category, rating, image, id]
    );

    const [updated] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Product updated successfully",
      data: formatProduct(updated[0]),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating product",
    });
  }
}

// @desc    Delete a product
// @route   DELETE /api/products/:id
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await pool.query("DELETE FROM products WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
}
