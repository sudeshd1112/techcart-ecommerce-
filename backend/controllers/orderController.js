import pool from "../config/db.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Requires JWT token)
export async function createOrder(req, res) {
  const connection = await pool.getConnection();

  try {
    const { orderItems, shippingAddress } = req.body;
    const userId = req.user.id;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items provided",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    // Format shipping address if it's an object
    const formattedAddress =
      typeof shippingAddress === "object"
        ? `${shippingAddress.fullName || ""}, ${shippingAddress.address || ""}, ${shippingAddress.city || ""}, ${shippingAddress.state || ""} - ${shippingAddress.pincode || ""} (Phone: ${shippingAddress.phone || ""})`
        : String(shippingAddress);

    // 1. Fetch real product prices from database to calculate server-side verified total
    const productIds = orderItems.map((item) => item.productId || item.id);
    const placeholders = productIds.map(() => "?").join(",");

    const [dbProducts] = await connection.query(
      `SELECT id, name, price FROM products WHERE id IN (${placeholders})`,
      productIds
    );

    const productMap = new Map();
    dbProducts.forEach((p) => productMap.set(p.id, parseFloat(p.price)));

    // 2. Validate products and calculate grand total on backend
    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const item of orderItems) {
      const pId = item.productId || item.id;
      const qty = parseInt(item.quantity, 10);

      if (!productMap.has(pId)) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${pId} not found in database`,
        });
      }

      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product ${pId}`,
        });
      }

      const price = productMap.get(pId);
      calculatedTotal += price * qty;

      verifiedItems.push({
        productId: pId,
        quantity: qty,
        price,
      });
    }

    // 3. Start database transaction for atomicity
    await connection.beginTransaction();

    // 4. Insert into 'orders' table
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address)
       VALUES (?, ?, 'Placed', ?)`,
      [userId, calculatedTotal, formattedAddress]
    );

    const orderId = orderResult.insertId;

    // 5. Insert each item into 'order_items' table
    for (const item of verifiedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.price]
      );
    }

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId,
      totalAmount: calculatedTotal,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating order",
    });
  } finally {
    connection.release();
  }
}

// @desc    Get logged in user's order history
// @route   GET /api/orders
// @access  Private (Requires JWT token)
export async function getUserOrders(req, res) {
  try {
    const userId = req.user.id;

    // 1. Fetch orders for this user only
    const [orders] = await pool.query(
      `SELECT id, total_amount AS totalAmount, status, shipping_address AS shippingAddress, created_at AS createdAt
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    if (orders.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // 2. Fetch order items with product details for each order
    const orderIds = orders.map((o) => o.id);
    const placeholders = orderIds.map(() => "?").join(",");

    const [items] = await pool.query(
      `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name, p.image, p.category
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id IN (${placeholders})`,
      orderIds
    );

    // Group items by order_id
    const itemsByOrder = new Map();
    items.forEach((item) => {
      if (!itemsByOrder.has(item.order_id)) {
        itemsByOrder.set(item.order_id, []);
      }
      itemsByOrder.get(item.order_id).push({
        productId: item.product_id,
        name: item.name,
        image: item.image,
        category: item.category,
        quantity: item.quantity,
        price: parseFloat(item.price),
      });
    });

    const ordersWithItems = orders.map((o) => ({
      ...o,
      totalAmount: parseFloat(o.totalAmount),
      items: itemsByOrder.get(o.id) || [],
    }));

    res.json({
      success: true,
      count: ordersWithItems.length,
      data: ordersWithItems,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
}

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [orders] = await pool.query(
      `SELECT id, user_id, total_amount AS totalAmount, status, shipping_address AS shippingAddress, created_at AS createdAt
       FROM orders
       WHERE id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0];

    // Security check: ensure requesting user owns the order
    if (order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this order",
      });
    }

    const [items] = await pool.query(
      `SELECT oi.product_id, oi.quantity, oi.price, p.name, p.image, p.category
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        id: order.id,
        totalAmount: parseFloat(order.totalAmount),
        status: order.status,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        items: items.map((it) => ({
          productId: it.product_id,
          name: it.name,
          image: it.image,
          category: it.category,
          quantity: it.quantity,
          price: parseFloat(it.price),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
}
