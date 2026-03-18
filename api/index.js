const dotenv = require("dotenv")

const app = require("../backend/app")
const { connectDatabase } = require("../backend/lib/db")

dotenv.config({ path: "backend/.env" })

module.exports = async (req, res) => {
	try {
		await connectDatabase()
		return app(req, res)
	} catch (error) {
		console.error("Database connection failed", error)
		res.status(500).json({
			success: false,
			message: "Database connection failed",
		})
	}
}