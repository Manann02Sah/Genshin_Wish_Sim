"""
Database setup script for Genshin Impact Wish Simulator
Run this script to initialize the database with sample data
"""

import sqlite3
import os

def setup_database():
    # Create database connection
    db_path = 'genshin_wishes.db'
    
    # Remove existing database if it exists
    if os.path.exists(db_path):
        os.remove(db_path)
        print("Removed existing database")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(80) UNIQUE NOT NULL,
            password_hash VARCHAR(120) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE item (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            rarity INTEGER NOT NULL,
            item_type VARCHAR(20) NOT NULL,
            banner_type VARCHAR(20) NOT NULL,
            is_featured BOOLEAN DEFAULT 0,
            image_url VARCHAR(200) DEFAULT ''
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE wish (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            banner_type VARCHAR(20) NOT NULL,
            pity_count INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES user (id),
            FOREIGN KEY (item_id) REFERENCES item (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE user_banner_state (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            banner_type VARCHAR(20) NOT NULL,
            pity_5star INTEGER DEFAULT 0,
            pity_4star INTEGER DEFAULT 0,
            guaranteed_featured BOOLEAN DEFAULT 0,
            fate_points INTEGER DEFAULT 0,
            selected_weapon_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES user (id),
            FOREIGN KEY (selected_weapon_id) REFERENCES item (id)
        )
    ''')
    
    print("Created database tables")
    
    # Insert sample items
    items_data = [
        # 5-star featured characters
        ('Zhongli', 5, 'character', 'character', 1, ''),
        ('Venti', 5, 'character', 'character', 1, ''),
        ('Childe', 5, 'character', 'character', 1, ''),
        ('Hu Tao', 5, 'character', 'character', 1, ''),
        ('Ganyu', 5, 'character', 'character', 1, ''),
        
        # 5-star standard characters
        ('Diluc', 5, 'character', 'standard', 0, ''),
        ('Qiqi', 5, 'character', 'standard', 0, ''),
        ('Keqing', 5, 'character', 'standard', 0, ''),
        ('Mona', 5, 'character', 'standard', 0, ''),
        ('Jean', 5, 'character', 'standard', 0, ''),
        
        # 4-star characters
        ('Bennett', 4, 'character', 'standard', 0, ''),
        ('Xingqiu', 4, 'character', 'standard', 0, ''),
        ('Fischl', 4, 'character', 'standard', 0, ''),
        ('Sucrose', 4, 'character', 'standard', 0, ''),
        ('Diona', 4, 'character', 'standard', 0, ''),
        ('Razor', 4, 'character', 'standard', 0, ''),
        ('Chongyun', 4, 'character', 'standard', 0, ''),
        ('Noelle', 4, 'character', 'standard', 0, ''),
        ('Barbara', 4, 'character', 'standard', 0, ''),
        ('Xiangling', 4, 'character', 'standard', 0, ''),
        
        # 5-star featured weapons
        ('Staff of Homa', 5, 'weapon', 'weapon', 1, ''),
        ('Elegy for the End', 5, 'weapon', 'weapon', 1, ''),
        ('Primordial Jade Winged-Spear', 5, 'weapon', 'weapon', 1, ''),
        ('Vortex Vanquisher', 5, 'weapon', 'weapon', 1, ''),
        
        # 5-star standard weapons
        ("Wolf's Gravestone", 5, 'weapon', 'standard', 0, ''),
        ('Skyward Harp', 5, 'weapon', 'standard', 0, ''),
        ('Skyward Blade', 5, 'weapon', 'standard', 0, ''),
        ('Skyward Atlas', 5, 'weapon', 'standard', 0, ''),
        ('Skyward Pride', 5, 'weapon', 'standard', 0, ''),
        ('Amos Bow', 5, 'weapon', 'standard', 0, ''),
        ('Lost Prayer to the Sacred Winds', 5, 'weapon', 'standard', 0, ''),
        
        # 4-star weapons
        ('Sacrificial Sword', 4, 'weapon', 'standard', 0, ''),
        ('The Widsith', 4, 'weapon', 'standard', 0, ''),
        ('Rust', 4, 'weapon', 'standard', 0, ''),
        ('Favonius Warbow', 4, 'weapon', 'standard', 0, ''),
        ('Dragon\'s Bane', 4, 'weapon', 'standard', 0, ''),
        ('Eye of Perception', 4, 'weapon', 'standard', 0, ''),
        ('Favonius Codex', 4, 'weapon', 'standard', 0, ''),
        ('Favonius Greatsword', 4, 'weapon', 'standard', 0, ''),
        ('Favonius Lance', 4, 'weapon', 'standard', 0, ''),
        ('Sacrificial Bow', 4, 'weapon', 'standard', 0, ''),
        
        # 3-star weapons
        ('Cool Steel', 3, 'weapon', 'standard', 0, ''),
        ('Harbinger of Dawn', 3, 'weapon', 'standard', 0, ''),
        ('Magic Guide', 3, 'weapon', 'standard', 0, ''),
        ('Slingshot', 3, 'weapon', 'standard', 0, ''),
        ('Thrilling Tales of Dragon Slayers', 3, 'weapon', 'standard', 0, ''),
        ('Debate Club', 3, 'weapon', 'standard', 0, ''),
        ('Bloodtainted Greatsword', 3, 'weapon', 'standard', 0, ''),
        ('White Iron Greatsword', 3, 'weapon', 'standard', 0, ''),
        ('Black Tassel', 3, 'weapon', 'standard', 0, ''),
        ('White Tassel', 3, 'weapon', 'standard', 0, ''),
    ]
    
    cursor.executemany('''
        INSERT INTO item (name, rarity, item_type, banner_type, is_featured, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', items_data)
    
    conn.commit()
    print(f"Inserted {len(items_data)} items into database")
    
    # Create a test user
    from werkzeug.security import generate_password_hash
    test_password_hash = generate_password_hash('password123')
    
    cursor.execute('''
        INSERT INTO user (username, password_hash)
        VALUES (?, ?)
    ''', ('testuser', test_password_hash))
    
    conn.commit()
    print("Created test user: testuser / password123")
    
    conn.close()
    print("Database setup complete!")

if __name__ == "__main__":
    setup_database()
