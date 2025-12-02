require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Seed Driver
    const driver = await prisma.driver.upsert({
      where: { phone_number: "+919182548149" },
      update: {},
      create: {
        name: "Test Driver",
        country: "India",
        phone_number: "+919182548149",
        email: "driver9182548149@example.com",
        vehicle_type: "Sedan",
        vehicle_color: "White",
        vehicleNumber: "DL01AB1234",
        registration_number: "DL01AB1234",
        registration_date: "2024-01-15",
        driving_license: "DL1234567890123",
        rate: "50",
        rating: 4.5,
        ratings: 4.5,
        totalEarning: 0,
        totalRides: 0,
        pendingRides: 0,
        cancelRides: 0,
        status: "active",
        latitude: 28.6139,
        longitude: 77.2090,
      },
    });

    console.log("✅ Driver seeded:", driver.id);

    // Seed User
    const user = await prisma.user.upsert({
      where: { phone_number: "+919182548149" },
      update: {},
      create: {
        name: "Test User",
        email: "user9182548149@example.com",
        phone_number: "+919182548149",
        ratings: 4.0,
        totalRides: 0,
      },
    });

    console.log("✅ User seeded:", user.id);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("📱 Phone number: +919182548149");
    console.log("👤 Driver ID:", driver.id);
    console.log("👥 User ID:", user.id);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase()
  .then(() => {
    console.log("\n✨ Seeding process finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding process failed:", error);
    process.exit(1);
  });

