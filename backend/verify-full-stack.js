// End-to-end Full Stack Verification Script
async function verifyFullStack() {
  const API = "http://localhost:5000/api";
  console.log("🧪 Running Comprehensive Full-Stack Verification...\n");

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [${total}] ${testName}: PASSED`);
      passed++;
    } else {
      console.error(`❌ [${total}] ${testName}: FAILED`);
    }
  }

  try {
    // 1. Backend Health
    const health = await (await fetch(`${API}/health`)).json();
    assert(health.status === "ok", "Backend health check");

    // 2. Fetch all products from MySQL
    const prods = await (await fetch(`${API}/products`)).json();
    assert(prods.success && prods.data.length >= 6, `Retrieve all products (${prods.data.length} found)`);

    // 3. Category filtering
    const catProds = await (await fetch(`${API}/products?category=Laptops`)).json();
    assert(catProds.data.every((p) => p.category === "Laptops"), "Category filter (Laptops)");

    // 4. Search filtering
    const searchProds = await (await fetch(`${API}/products?search=Sony`)).json();
    assert(searchProds.data.some((p) => p.name.includes("Sony")), "Product search (Sony)");

    // 5. Product Details by ID
    const single = await (await fetch(`${API}/products/1`)).json();
    assert(single.success && single.data.name === "iPhone 16", "Product Details by ID (#1 iPhone 16)");

    // 6. Invalid Product ID handling
    const invalidProd = await fetch(`${API}/products/99999`);
    assert(invalidProd.status === 404, "Invalid product ID returns 404");

    // 7. Register new user
    const email = `test_${Date.now()}@example.com`;
    const reg = await (
      await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Portfolio Evaluator",
          email,
          password: "password123",
        }),
      })
    ).json();
    assert(reg.success && reg.token && reg.user.name === "Portfolio Evaluator", "User registration & JWT issuance");

    const userToken = reg.token;

    // 8. Duplicate registration prevention
    const dupReg = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate",
        email,
        password: "password123",
      }),
    });
    assert(dupReg.status === 400, "Duplicate email registration rejected (400)");

    // 9. Login user
    const login = await (
      await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" }),
      })
    ).json();
    assert(login.success && login.token, "User login with password comparison");

    // 10. Wrong password rejection
    const badLogin = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "wrongpassword" }),
    });
    assert(badLogin.status === 401, "Invalid password login rejected (401)");

    // 11. Create order with backend price calculation
    const orderPayload = {
      orderItems: [
        { productId: 1, quantity: 2 }, // iPhone 16 (69999 * 2 = 139998)
        { productId: 5, quantity: 1 }, // PS5 (49999 * 1 = 49999)
      ],
      shippingAddress: {
        fullName: "Portfolio Evaluator",
        address: "742 Evergreen Terrace",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        phone: "9876543210",
      },
    };

    const order = await (
      await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(orderPayload),
      })
    ).json();

    const expectedTotal = 69999 * 2 + 49999;
    assert(
      order.success && order.totalAmount === expectedTotal,
      `Create Order with tamper-proof server total (₹${order.totalAmount})`
    );

    // 12. Fetch logged-in user order history
    const userOrders = await (
      await fetch(`${API}/orders`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })
    ).json();
    assert(
      userOrders.success &&
        userOrders.data.length === 1 &&
        userOrders.data[0].items.length === 2,
      "Fetch user order history with relational line items"
    );

    // 13. Unauthorized order creation blocked
    const unauthOrder = await fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    assert(unauthOrder.status === 401, "Unauthorized order creation blocked without JWT (401)");

    // 14. Unauthorized order history access blocked
    const unauthGetOrders = await fetch(`${API}/orders`);
    assert(unauthGetOrders.status === 401, "Unauthorized order history blocked without JWT (401)");

    console.log(`\n=========================================`);
    console.log(`Verification Summary: ${passed}/${total} tests PASSED`);
    console.log(`=========================================`);
  } catch (err) {
    console.error("Test execution failed with error:", err);
  }
}

verifyFullStack();
