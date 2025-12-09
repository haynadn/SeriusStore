package handlers

import (
	"ecommerce/database"
	"ecommerce/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderHandler struct{}

func NewOrderHandler() *OrderHandler {
	return &OrderHandler{}
}

type CreateOrderRequest struct {
	Address string `json:"address"`
	Phone   string `json:"phone"`
}

func (h *OrderHandler) GetOrders(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	role := c.Locals("role").(string)

	var orders []models.Order
	query := database.DB.Preload("Items").Preload("Items.Product").Preload("User")

	// Admin can see all orders
	if role != "admin" {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.Order("created_at DESC").Find(&orders).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch orders",
		})
	}

	return c.JSON(orders)
}

func (h *OrderHandler) GetOrderByID(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	role := c.Locals("role").(string)
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid order ID",
		})
	}

	var order models.Order
	query := database.DB.Preload("Items").Preload("Items.Product").Preload("User")
	
	if role != "admin" {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.First(&order, "id = ?", orderID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Order not found",
		})
	}

	return c.JSON(order)
}

func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var req CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Address == "" || req.Phone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Address and phone are required",
		})
	}

	// Get cart items
	var cartItems []models.CartItem
	if err := database.DB.Preload("Product").Where("user_id = ?", userID).Find(&cartItems).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch cart",
		})
	}

	if len(cartItems) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cart is empty",
		})
	}

	// Calculate total and create order items
	var total float64
	var orderItems []models.OrderItem
	for _, item := range cartItems {
		// Check stock
		if item.Quantity > item.Product.Stock {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Insufficient stock for " + item.Product.Name,
			})
		}

		itemTotal := item.Product.Price * float64(item.Quantity)
		total += itemTotal

		orderItems = append(orderItems, models.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Product.Price,
		})
	}

	// Create order
	order := models.Order{
		UserID:  userID,
		Total:   total,
		Status:  "pending",
		Address: req.Address,
		Phone:   req.Phone,
		Items:   orderItems,
	}

	tx := database.DB.Begin()

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create order",
		})
	}

	// Update product stock
	for _, item := range cartItems {
		if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).Update("stock", item.Product.Stock-item.Quantity).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update stock",
			})
		}
	}

	// Clear cart
	if err := tx.Where("user_id = ?", userID).Delete(&models.CartItem{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to clear cart",
		})
	}

	tx.Commit()

	// Reload order with items
	database.DB.Preload("Items").Preload("Items.Product").First(&order, "id = ?", order.ID)

	return c.Status(fiber.StatusCreated).JSON(order)
}

func (h *OrderHandler) UpdateStatus(c *fiber.Ctx) error {
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid order ID",
		})
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	validStatuses := map[string]bool{
		"pending":    true,
		"processing": true,
		"shipped":    true,
		"delivered":  true,
		"cancelled":  true,
	}

	if !validStatuses[req.Status] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid status",
		})
	}

	var order models.Order
	if err := database.DB.First(&order, "id = ?", orderID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Order not found",
		})
	}

	order.Status = req.Status
	if err := database.DB.Save(&order).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update order status",
		})
	}

	database.DB.Preload("Items").Preload("Items.Product").First(&order, "id = ?", order.ID)

	return c.JSON(order)
}

// CancelOrder allows users to cancel their own orders if status is pending
func (h *OrderHandler) CancelOrder(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid order ID",
		})
	}

	var order models.Order
	if err := database.DB.Preload("Items").First(&order, "id = ? AND user_id = ?", orderID, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Order not found",
		})
	}

	// Only allow cancellation of pending orders
	if order.Status != "pending" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Hanya pesanan dengan status 'Menunggu Pembayaran' yang bisa dibatalkan",
		})
	}

	tx := database.DB.Begin()

	// Restore product stock
	for _, item := range order.Items {
		if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
			Update("stock", gorm.Expr("stock + ?", item.Quantity)).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to restore stock",
			})
		}
	}

	// Update order status to cancelled
	order.Status = "cancelled"
	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to cancel order",
		})
	}

	tx.Commit()

	database.DB.Preload("Items").Preload("Items.Product").First(&order, "id = ?", order.ID)

	return c.JSON(fiber.Map{
		"message": "Order cancelled successfully",
		"order":   order,
	})
}
