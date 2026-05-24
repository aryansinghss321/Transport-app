#!/usr/bin/env node
/**
 * Migration: convert Booking documents to Shipment documents.
 *
 * Usage:
 *   node migrate-bookings-to-shipments.js --mongoUri="mongodb://localhost:27017/transport_db" [--dryRun] [--limit=100]
 */

const mongoose = require("mongoose");
const argv = require("minimist")(process.argv.slice(2));

const MONGO_URI = argv.mongoUri || process.env.MONGO_URI || "mongodb://localhost:27017/transport_db";
const DRY_RUN = argv.dryRun || argv.dryrun || false;
const LIMIT = Number(argv.limit) || 0;

async function main() {
  console.log("Connecting to", MONGO_URI);
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const Booking = require("../src/models/Booking");
  const Route = require("../src/models/Route");
  const Location = require("../src/models/Location");
  const Shipment = require("../src/models/Shipment");
  const Vehicle = require("../src/models/Vehicle");

  const query = {};
  const cursor = LIMIT > 0 ? Booking.find(query).limit(LIMIT).cursor() : Booking.find(query).cursor();

  let migrated = 0;
  for (let booking = await cursor.next(); booking != null; booking = await cursor.next()) {
    try {
      const route = await Route.findById(booking.routeId);
      if (!route) {
        console.warn(`Booking ${booking._id}: route ${booking.routeId} not found — skipping`);
        continue;
      }

      // find or create origin/destination locations by name
      const findOrCreateLocation = async (name) => {
        if (!name) return null;
        let loc = await Location.findOne({ name });
        if (!loc) {
          loc = await Location.create({ name, code: name.slice(0, 8).toUpperCase(), type: "warehouse" });
        }
        return loc;
      };

      const origin = await findOrCreateLocation(route.source);
      const destination = await findOrCreateLocation(route.destination);

      // map status
      const statusMap = {
        pending: "pending",
        confirmed: "loading",
        completed: "delivered",
        cancelled: "cancelled",
      };

      const mappedStatus = statusMap[booking.status] || "pending";

      const vehicleId = route.vehicleId ? route.vehicleId : null;

      const shipmentDoc = {
        reference: `SHP-BKG-${booking._id}`,
        description: `Migrated from Booking ${booking._id}`,
        origin: origin ? origin._id : null,
        destination: destination ? destination._id : null,
        vehicle: vehicleId,
        driver: null,
        weightKg: null,
        volumeM3: null,
        cargoType: "passenger",
        status: mappedStatus,
        scheduledAt: booking.travelDate || booking.createdAt,
        metadata: {
          migratedFromBooking: booking._id,
          seats: booking.seats,
          totalFare: booking.totalFare,
          originalStatus: booking.status,
          userId: booking.userId,
        },
      };

      if (DRY_RUN) {
        console.log("DRY RUN - would create shipment:", shipmentDoc.reference);
      } else {
        const created = await Shipment.create(shipmentDoc);
        // tag booking as migrated
        booking.migratedToShipment = true;
        booking.shipmentId = created._id;
        await booking.save();
        console.log(`Migrated booking ${booking._id} -> shipment ${created._id}`);
      }

      migrated += 1;
    } catch (err) {
      console.error(`Error migrating booking ${booking._id}:`, err.message || err);
    }
  }

  console.log(`Done. Migrated ${migrated} bookings.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
