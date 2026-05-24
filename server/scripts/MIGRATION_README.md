# Migration scripts

This folder contains helpers to migrate existing data.

migrate-bookings-to-shipments.js
- Converts `Booking` documents to `Shipment` documents. It will create `Location` documents when necessary and link the new `Shipment` via `booking.shipmentId`.

Usage:

```powershell
node migrate-bookings-to-shipments.js --mongoUri="mongodb://localhost:27017/transport_db" --dryRun
node migrate-bookings-to-shipments.js --mongoUri="mongodb://localhost:27017/transport_db" --limit=100
```

Important:
- Always run with `--dryRun` first and create a DB backup using `backup-db.ps1`.
- The script adds `migratedToShipment` and `shipmentId` fields to `Booking` documents.
