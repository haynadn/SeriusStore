package handlers

import (
	"ecommerce/database"
	"ecommerce/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SellerHandler struct{}

func NewSellerHandler() *SellerHandler {
	return &SellerHandler{}
}

// GetPendingSellers returns all pending seller registrations
func (h *SellerHandler) GetPendingSellers(c *fiber.Ctx) error {
	var pendingSellers []models.User
	if err := database.DB.Where("role = ?", "pending_seller").Find(&pendingSellers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch pending sellers",
		})
	}
	return c.JSON(pendingSellers)
}

// ApproveSeller approves a pending seller
func (h *SellerHandler) ApproveSeller(c *fiber.Ctx) error {
	sellerID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid seller ID",
		})
	}

	var user models.User
	if err := database.DB.First(&user, "id = ?", sellerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	if user.Role != "pending_seller" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "User is not a pending seller",
		})
	}

	user.Role = "seller"
	user.Status = "active"

	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to approve seller",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Seller approved successfully",
		"user":    user,
	})
}

// RejectSeller rejects a pending seller and converts to regular user
func (h *SellerHandler) RejectSeller(c *fiber.Ctx) error {
	sellerID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid seller ID",
		})
	}

	var user models.User
	if err := database.DB.First(&user, "id = ?", sellerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	if user.Role != "pending_seller" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "User is not a pending seller",
		})
	}

	user.Role = "user"
	user.Status = "active"

	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to reject seller",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Seller rejected and converted to regular user",
		"user":    user,
	})
}

// GetAllSellers returns all active sellers
func (h *SellerHandler) GetAllSellers(c *fiber.Ctx) error {
	var sellers []models.User
	if err := database.DB.Where("role = ?", "seller").Find(&sellers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch sellers",
		})
	}
	return c.JSON(sellers)
}

// DeactivateSeller deactivates an active seller and converts to regular user
func (h *SellerHandler) DeactivateSeller(c *fiber.Ctx) error {
	sellerID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid seller ID",
		})
	}

	var user models.User
	if err := database.DB.First(&user, "id = ?", sellerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	if user.Role != "seller" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "User is not an active seller",
		})
	}

	// Hide all products from this seller
	database.DB.Model(&models.Product{}).Where("seller_id = ?", sellerID).Update("is_active", false)

	user.Role = "user"
	user.Status = "active"

	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to deactivate seller",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Seller deactivated and all products hidden",
		"user":    user,
	})
}
