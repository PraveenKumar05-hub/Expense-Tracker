const dotenv = require("dotenv")
const app = require("./app")
const { connectDatabase } = require("./lib/db")

dotenv.config()

const PORT = Number(process.env.PORT) || 5000

connectDatabase()
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