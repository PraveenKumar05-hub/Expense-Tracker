const express = require("express")
const cors = require("cors")

const transactionRoutes = require("./routes/transactions")

const app = express()

const configuredOrigins = (process.env.CLIENT_ORIGIN || "")
	.split(",")
	.map((value) => value.trim())
	.filter(Boolean)

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || configuredOrigins.length === 0) {
				callback(null, true)
				return
			}

			if (configuredOrigins.includes(origin)) {
				callback(null, true)
				return
			}

			callback(new Error("Not allowed by CORS"))
		},
	})
)

app.use(express.json({ limit: "1mb" }))

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

module.exports = app