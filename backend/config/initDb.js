import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const initialProducts = [
  {
    name: "iPhone 16",
    price: 69999,
    old_price: 79999,
    category: "Smartphones",
    rating: 4.8,
    image: "/products/iphone.jpg",
    description: "Powerful smartphone with an advanced camera and next-gen performance.",
  },
  {
    name: "MacBook Air",
    price: 99999,
    old_price: 109999,
    category: "Laptops",
    rating: 4.9,
    image: "/products/macbook.jpg",
    description: "Lightweight laptop built for incredible performance and all-day battery life.",
  },
  {
    name: "Sony WH-1000XM5",
    price: 29999,
    old_price: 34999,
    category: "Audio",
    rating: 4.7,
    image: "/products/headphones.jpg",
    description: "Industry-leading wireless noise canceling headphones with superior sound.",
  },
  {
    name: "Apple Watch Series 10",
    price: 44999,
    old_price: 49999,
    category: "Smart Watches",
    rating: 4.6,
    image: "/products/watch.jpg",
    description: "Smartwatch designed for fitness tracking, heart health, and everyday use.",
  },
  {
    name: "PlayStation 5",
    price: 49999,
    old_price: 54999,
    category: "Gaming",
    rating: 4.9,
    image: "/products/ps5.jpg",
    description: "Next-generation gaming console featuring ultra-fast SSD and ray tracing.",
  },
  {
    name: "iPad Air",
    price: 59999,
    old_price: 64999,
    category: "Tablets",
    rating: 4.7,
    image: "/products/ipad.jpg",
    description: "Powerful and portable tablet for work, creativity, and entertainment.",
  },
];

async function initDb() {
  let connection;

  try {
    // 1. Connect without selecting database to allow creating it if needed
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    console.log("Connected to MySQL server successfully.");

    const dbName = process.env.DB_NAME || "techcart";

    // 2. Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' verified/created.`);

    await connection.query(`USE \`${dbName}\`;`);

    // 3. Create 'users' table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'users' ready.");

    // 4. Create 'products' table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        old_price DECIMAL(10, 2),
        category VARCHAR(100) NOT NULL,
        rating DECIMAL(3, 1) DEFAULT 4.5,
        image VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'products' ready.");

    // 5. Create 'orders' table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        shipping_address TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("Table 'orders' ready.");

    // 6. Create 'order_items' table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);
    console.log("Table 'order_items' ready.");

    // 7. Seed initial products if table is empty
    const [rows] = await connection.query("SELECT COUNT(*) AS count FROM products;");
    if (rows[0].count === 0) {
      console.log("Products table is empty. Seeding initial products...");
      for (const item of initialProducts) {
        await connection.query(
          `INSERT INTO products (name, description, price, old_price, category, rating, image)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [
            item.name,
            item.description,
            item.price,
            item.old_price,
            item.category,
            item.rating,
            item.image,
          ]
        );
      }
      console.log(`Seeded ${initialProducts.length} products successfully.`);
    } else {
      console.log(`Products table already contains ${rows[0].count} products.`);
    }

    console.log("\n✅ Database initialization complete!");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
  } finally {
    if (connection) await connection.end();
  }
}

initDb();
