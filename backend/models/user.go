package models

import (
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	Name      string    `gorm:"not null" json:"name"`
	Role      string    `gorm:"type:varchar(20);default:'user';not null" json:"role"`   // user, seller, pending_seller, admin
	Status    string    `gorm:"type:varchar(20);default:'active';not null" json:"status"` // active, pending, rejected
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.ID = uuid.New()
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// IsSeller checks if user is an active seller
func (u *User) IsSeller() bool {
	return u.Role == "seller" && u.Status == "active"
}

// IsAdmin checks if user is admin
func (u *User) IsAdmin() bool {
	return u.Role == "admin"
}

// IsPendingSeller checks if user is waiting for approval
func (u *User) IsPendingSeller() bool {
	return u.Role == "pending_seller"
}
