package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Order struct {
	ID        uuid.UUID   `gorm:"type:uuid;primary_key" json:"id"`
	UserID    uuid.UUID   `gorm:"type:uuid;not null" json:"user_id"`
	User      User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Items     []OrderItem `gorm:"foreignKey:OrderID" json:"items,omitempty"`
	Total     float64     `gorm:"not null" json:"total"`
	Status    string      `gorm:"default:pending" json:"status"` // pending, processing, shipped, delivered, cancelled
	Address   string      `gorm:"not null" json:"address"`
	Phone     string      `gorm:"not null" json:"phone"`
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`
}

type OrderItem struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	OrderID   uuid.UUID `gorm:"type:uuid;not null" json:"order_id"`
	ProductID uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	Product   Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Quantity  int       `gorm:"not null" json:"quantity"`
	Price     float64   `gorm:"not null" json:"price"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
	o.ID = uuid.New()
	return nil
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
	oi.ID = uuid.New()
	return nil
}
