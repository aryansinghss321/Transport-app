# Backup scripts

Two helper scripts are included to create local backups before major migrations.

- `backup-db.ps1` — Uses `mongodump` to export a MongoDB database. Requires MongoDB Database Tools on PATH.
- `backup-repo.ps1` — Creates a timestamped ZIP of the repository using `Compress-Archive`.

Run these from the `server/scripts` folder in PowerShell.

Examples:

```powershell
.ackup-db.ps1 -mongoUri "mongodb://localhost:27017" -dbName "transport_db"
.ackup-repo.ps1
```
