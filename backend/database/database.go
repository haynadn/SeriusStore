package database

import (
	"fmt"
	"log"

	"ecommerce/config"
	"ecommerce/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect(cfg *config.Config) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")

	// Auto migrate models
	err = DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Product{},
		&models.CartItem{},
		&models.Order{},
		&models.OrderItem{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migrated successfully")

	// Ensure columns exist for new role system
	DB.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL")
	DB.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' NOT NULL")
	DB.Exec("UPDATE users SET role = 'user' WHERE role IS NULL OR role = ''")
	DB.Exec("UPDATE users SET status = 'active' WHERE status IS NULL OR status = ''")

	// Ensure seller_id and is_active exists in products table
	DB.Exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_id UUID")
	DB.Exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true")
	DB.Exec("UPDATE products SET is_active = true WHERE is_active IS NULL")
}
