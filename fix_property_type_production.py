#!/usr/bin/env python3
"""
Fix Property Type in Production Database
This script adds the property_type field to the Lead model in production
"""

import sqlite3
import sys

def fix_property_type():
    """Add property_type column to leads table if it doesn't exist"""
    
    # Connect to production database
    db_path = "/opt/proconnectsa/backend/db.sqlite3"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if property_type column exists
        cursor.execute("PRAGMA table_info(leads_lead)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'property_type' not in columns:
            print("Adding property_type column to leads_lead table...")
            cursor.execute("""
                ALTER TABLE leads_lead 
                ADD COLUMN property_type VARCHAR(20) DEFAULT 'residential'
            """)
            conn.commit()
            print("✅ property_type column added successfully!")
        else:
            print("✅ property_type column already exists!")
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(leads_lead)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Current columns: {columns}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Fixing Property Type in Production Database...")
    success = fix_property_type()
    if success:
        print("🎉 Property type fix completed!")
    else:
        print("💥 Property type fix failed!")
        sys.exit(1)



