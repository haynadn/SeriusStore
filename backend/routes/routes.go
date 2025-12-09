package routes

import (
	"ecommerce/config"
	"ecommerce/handlers"
	"ecommerce/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, cfg *config.Config) {
	// Handlers
	authHandler := handlers.NewAuthHandler(cfg)
	categoryHandler := handlers.NewCategoryHandler()
	productHandler := handlers.NewProductHandler()
	cartHandler := handlers.NewCartHandler()
	orderHandler := handlers.NewOrderHandler()
	uploadHandler := handlers.NewUploadHandler()
	userHandler := handlers.NewUserHandler()
	sellerHandler := handlers.NewSellerHandler()

	// API routes
	api := app.Group("/api")

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Get("/me", middleware.AuthMiddleware(cfg), authHandler.GetMe)

	// Category routes (public read, admin write)
	categories := api.Group("/categories")
	categories.Get("/", categoryHandler.GetAll)
	categories.Get("/:id", categoryHandler.GetByID)
	categories.Post("/", middleware.AuthMiddleware(cfg), middleware.AdminMiddleware(), categoryHandler.Create)
	categories.Put("/:id", middleware.AuthMiddleware(cfg), middleware.AdminMiddleware(), categoryHandler.Update)
	categories.Delete("/:id", middleware.AuthMiddleware(cfg), middleware.AdminMiddleware(), categoryHandler.Delete)

	// Product routes (public read, seller/admin write)
	products := api.Group("/products")
	products.Get("/", productHandler.GetAll)
	products.Get("/my", middleware.AuthMiddleware(cfg), middleware.SellerMiddleware(), productHandler.GetMyProducts)
	products.Get("/:id", productHandler.GetByID)
	products.Post("/", middleware.AuthMiddleware(cfg), middleware.SellerOrAdminMiddleware(), productHandler.Create)
	products.Put("/:id", middleware.AuthMiddleware(cfg), middleware.SellerOrAdminMiddleware(), productHandler.Update)
	products.Delete("/:id", middleware.AuthMiddleware(cfg), middleware.SellerOrAdminMiddleware(), productHandler.Delete)

	// Cart routes (authenticated)
	cart := api.Group("/cart", middleware.AuthMiddleware(cfg))
	cart.Get("/", cartHandler.GetCart)
	cart.Post("/", cartHandler.AddToCart)
	cart.Put("/:id", cartHandler.UpdateQuantity)
	cart.Delete("/:id", cartHandler.RemoveFromCart)
	cart.Delete("/", cartHandler.ClearCart)

	// Order routes (authenticated)
	orders := api.Group("/orders", middleware.AuthMiddleware(cfg))
	orders.Get("/", orderHandler.GetOrders)
	orders.Get("/:id", orderHandler.GetOrderByID)
	orders.Post("/", orderHandler.CreateOrder)
	orders.Put("/:id/cancel", orderHandler.CancelOrder)
	orders.Put("/:id/status", middleware.AdminMiddleware(), orderHandler.UpdateStatus)

	// Seller approval routes (admin only)
	sellers := api.Group("/sellers", middleware.AuthMiddleware(cfg), middleware.AdminMiddleware())
	sellers.Get("/", sellerHandler.GetAllSellers)
	sellers.Get("/pending", sellerHandler.GetPendingSellers)
	sellers.Put("/:id/approve", sellerHandler.ApproveSeller)
	sellers.Put("/:id/reject", sellerHandler.RejectSeller)
	sellers.Put("/:id/deactivate", sellerHandler.DeactivateSeller)

	// User management routes (admin only)
	users := api.Group("/users", middleware.AuthMiddleware(cfg), middleware.AdminMiddleware())
	users.Get("/", userHandler.GetAllUsers)
	users.Put("/:id/role", userHandler.UpdateRole)
	users.Delete("/:id", userHandler.DeleteUser)

	// Upload route (seller or admin)
	api.Post("/upload", middleware.AuthMiddleware(cfg), middleware.SellerOrAdminMiddleware(), uploadHandler.UploadImage)
}
