package handlers

import (
	"ecommerce/database"
	"ecommerce/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type CartHandler struct{}

func NewCartHandler() *CartHandler {
	return &CartHandler{}
}

type AddToCartRequest struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

func (h *CartHandler) GetCart(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var items []models.CartItem
	if err := database.DB.Preload("Product").Preload("Product.Category").Where("user_id = ?", userID).Find(&items).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch cart",
		})
	}

	// Calculate total
	var total float64
	for _, item := range items {
		total += item.Product.Price * float64(item.Quantity)
	}

	return c.JSON(fiber.Map{
		"items": items,
		"total": total,
	})
}

func (h *CartHandler) AddToCart(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var req AddToCartRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	productID, err := uuid.Parse(req.ProductID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid product ID",
		})
	}

	// Check if product exists
	var product models.Product
	if err := database.DB.First(&product, "id = ?", productID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	// Check stock
	quantity := req.Quantity
	if quantity <= 0 {
		quantity = 1
	}
	if quantity > product.Stock {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Insufficient stock",
		})
	}

	// Check if item already in cart
	var existingItem models.CartItem
	if err := database.DB.Where("user_id = ? AND product_id = ?", userID, productID).First(&existingItem).Error; err == nil {
		// Update quantity
		existingItem.Quantity += quantity
		if existingItem.Quantity > product.Stock {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Insufficient stock",
			})
		}
		database.DB.Save(&existingItem)
		database.DB.Preload("Product").First(&existingItem, "id = ?", existingItem.ID)
		return c.JSON(existingItem)
	}

	// Create new cart item
	cartItem := models.CartItem{
		UserID:    userID,
		ProductID: productID,
		Quantity:  quantity,
	}

	if err := database.DB.Create(&cartItem).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to add to cart",
		})
	}

	database.DB.Preload("Product").First(&cartItem, "id = ?", cartItem.ID)

	return c.Status(fiber.StatusCreated).JSON(cartItem)
}

func (h *CartHandler) UpdateQuantity(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	itemID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid item ID",
		})
	}

	var req struct {
		Quantity int `json:"quantity"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var item models.CartItem
	if err := database.DB.Preload("Product").Where("id = ? AND user_id = ?", itemID, userID).First(&item).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Cart item not found",
		})
	}

	if req.Quantity <= 0 {
		database.DB.Delete(&item)
		return c.JSON(fiber.Map{
			"message": "Item removed from cart",
		})
	}

	if req.Quantity > item.Product.Stock {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Insufficient stock",
		})
	}

	item.Quantity = req.Quantity
	database.DB.Save(&item)

	return c.JSON(item)
}

func (h *CartHandler) RemoveFromCart(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	itemID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid item ID",
		})
	}

	if err := database.DB.Where("id = ? AND user_id = ?", itemID, userID).Delete(&models.CartItem{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to remove item from cart",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Item removed from cart",
	})
}

func (h *CartHandler) ClearCart(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	if err := database.DB.Where("user_id = ?", userID).Delete(&models.CartItem{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to clear cart",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Cart cleared",
	})
}
