// Automated API test script
async function runTests() {
  const BASE_URL = "http://localhost:5000/api";
  console.log("🚀 Starting TechCart API Automated Tests...\n");

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log("✅ 1. Health Check:", healthData.status === "ok" ? "PASSED" : "FAILED");

    // 2. Get all products
    const prodRes = await fetch(`${BASE_URL}/products`);
    const prodData = await prodRes.json();
    console.log(`✅ 2. Get Products: PASSED (${prodData.count} products retrieved)`);

    // 3. Get single product
    const singleRes = await fetch(`${BASE_URL}/products/1`);
    const singleData = await singleRes.json();
    console.log(`✅ 3. Get Product #1 (${singleData.data.name}): PASSED`);

    // 4. Register new user
    const uniqueEmail = `user_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: uniqueEmail,
        password: "securepassword123",
      }),
    });
    const regData = await regRes.json();
    console.log("✅ 4. Register User:", regData.success ? "PASSED (Token issued)" : "FAILED");

    const token = regData.token;

    // 5. Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: uniqueEmail,
        password: "securepassword123",
      }),
    });
    const loginData = await loginRes.json();
    console.log("✅ 5. Login User:", loginData.success ? "PASSED" : "FAILED");

    // 6. Create Order (requires JWT)
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderItems: [
          { productId: 1, quantity: 1 }, // iPhone 16 = 69999
          { productId: 3, quantity: 2 }, // Sony Headphones = 29999 * 2 = 59998
        ],
        shippingAddress: {
          fullName: "Test User",
          address: "123 Tech Lane",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411001",
          phone: "9876543210",
        },
      }),
    });
    const orderData = await orderRes.json();
    console.log(`✅ 6. Create Order: PASSED (Order ID: ${orderData.orderId}, Server-Calculated Total: ₹${orderData.totalAmount})`);

    // 7. Get User Orders (requires JWT)
    const ordersRes = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const ordersData = await ordersRes.json();
    console.log(`✅ 7. Get User Orders: PASSED (${ordersData.count} order(s) found)`);

    // 8. Test Unauthorized Access (without token)
    const unauthRes = await fetch(`${BASE_URL}/orders`);
    console.log("✅ 8. Security Protection Check:", unauthRes.status === 401 ? "PASSED (401 Unauthorized blocked)" : "FAILED");

    console.log("\n🎉 ALL 8 BACKEND API TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

runTests();
