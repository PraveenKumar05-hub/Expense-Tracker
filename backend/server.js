const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 5000
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expenseTracker"
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000"

app.use(
	cors({
		origin: CLIENT_ORIGIN,
	})
)
app.use(express.json({ limit: "1mb" }))

const transactionRoutes = require("./routes/transactions")

app.get("/api/health", (req, res) => {
	res.json({
		success: true,
		message: "Expense Tracker API is running",
	})
})

app.use("/api/transactions", transactionRoutes)

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	})
})

app.use((err, req, res, next) => {
	console.error(err)

	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal server error",
	})
})

mongoose
	.connect(MONGODB_URI)
	.then(() => {
		console.log("MongoDB connected")

		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`)
		})
	})
	.catch((err) => {
		console.error("MongoDB connection failed", err)
		process.exit(1)
	})