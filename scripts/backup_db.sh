#!/bin/bash
DATE=$(date +"%Y_%m_%d")
BACKUP_DIR="$HOME/CODE/moneyapp/database_backups"
sqlite3 "$HOME/CODE/moneyapp/db.sqlite3" ".backup $BACKUP_DIR/db_backup_$DATE.sqlite3"
