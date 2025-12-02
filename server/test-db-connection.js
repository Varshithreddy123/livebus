require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testConnection() {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 MongoDB Connection Test");
  console.log("=".repeat(60));
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in .env file");
    console.log("\n💡 Add this to your server/.env file:");
    console.log('   DATABASE_URL="mongodb://localhost:27017/ridewave"');
    process.exit(1);
  }

  console.log("✅ DATABASE_URL is set");
  console.log("📍 Connection string:", process.env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")); // Hide credentials

  try {
    console.log("\n🔄 Attempting to connect...");
    await prisma.$connect();
    console.log("✅ Successfully connected to MongoDB!");

    // Test a simple query
    console.log("\n🔄 Testing database query...");
    const driverCount = await prisma.driver.count();
    console.log(`✅ Database query successful! Found ${driverCount} driver(s)`);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 MongoDB connection test PASSED");
    console.log("=".repeat(60) + "\n");
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error.message);
    
    // Provide specific guidance based on error
    if (error.message.includes("DNS") || error.message.includes("ENOTFOUND")) {
      console.error("\n💡 Issue: Cannot resolve MongoDB hostname");
      console.error("   - Check if DATABASE_URL hostname is correct");
      console.error("   - If using localhost, ensure MongoDB is running");
      console.error("   - If using cloud (Atlas), check connection string");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.error("\n💡 Issue: Connection refused");
      console.error("   - MongoDB server is not running");
      console.error("   - Start MongoDB service: Start-Service MongoDB");
      console.error("   - Or check if MongoDB is running on the specified port");
    } else if (error.message.includes("authentication")) {
      console.error("\n💡 Issue: Authentication failed");
      console.error("   - Check username and password in DATABASE_URL");
      console.error("   - Verify database user has correct permissions");
    } else if (error.message.includes("timeout")) {
      console.error("\n💡 Issue: Connection timeout");
      console.error("   - Check network connectivity");
      console.error("   - Verify firewall allows MongoDB port (27017)");
      console.error("   - If using cloud, check IP whitelist");
    } else if (error.message.includes("unreachable")) {
      console.error("\n💡 Issue: Network unreachable");
      console.error("   - Check if MongoDB server is accessible");
      console.error("   - Verify network/firewall settings");
      console.error("   - If using VPN, ensure it's connected");
    }

    console.log("\n" + "=".repeat(60));
    console.log("❌ MongoDB connection test FAILED");
    console.log("=".repeat(60) + "\n");
    
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

testConnection();

