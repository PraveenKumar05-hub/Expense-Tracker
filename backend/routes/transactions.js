const router = require("express").Router()
const mongoose = require("mongoose")
const Transaction = require("../models/Transaction")

const allowedTypes = new Set(["income", "expense"])

const normalizeType = (value) => {
	const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""

	if (["income", "credit"].includes(normalized)) {
		return "income"
	}

	if (["expense", "debit"].includes(normalized)) {
		return "expense"
	}

	return ""
}

const buildError = (message, status = 400) => {
	const error = new Error(message)
	error.status = status
	return error
}

const normalizeTransactionPayload = (payload = {}) => {
	const type = normalizeType(payload.type || payload.transactionType)
	const category = typeof payload.category === "string" ? payload.category.trim() : ""
	const description = typeof payload.description === "string" ? payload.description.trim() : ""
	const amount = Number(payload.amount)
	const date = payload.date ? new Date(payload.date) : null

	if (!allowedTypes.has(type)) {
		throw buildError("Type must be either income or expense")
	}

	if (!Number.isFinite(amount) || amount <= 0) {
		throw buildError("Amount must be greater than 0")
	}

	if (!category) {
		throw buildError("Category is required")
	}

	if (category.length > 50) {
		throw buildError("Category must be 50 characters or fewer")
	}

	if (description.length > 200) {
		throw buildError("Description must be 200 characters or fewer")
	}

	if (!date || Number.isNaN(date.getTime())) {
		throw buildError("A valid transaction date is required")
	}

	return {
		type,
		amount,
		category,
		description,
		date,
	}
}

const buildFilters = (query) => {
	const filters = {}

	if (query.type && allowedTypes.has(query.type)) {
		filters.type = query.type
	}

	if (query.category) {
		filters.category = query.category
	}

	if (query.startDate || query.endDate) {
		filters.date = {}

		if (query.startDate) {
			const startDate = new Date(query.startDate)
			if (!Number.isNaN(startDate.getTime())) {
				filters.date.$gte = startDate
			}
		}

		if (query.endDate) {
			const endDate = new Date(query.endDate)
			if (!Number.isNaN(endDate.getTime())) {
				endDate.setHours(23, 59, 59, 999)
				filters.date.$lte = endDate
			}
		}

		if (!Object.keys(filters.date).length) {
			delete filters.date
		}
	}

	if (query.search) {
		filters.$or = [
			{ category: { $regex: query.search, $options: "i" } },
			{ description: { $regex: query.search, $options: "i" } },
		]
	}

	return filters
}

router.get("/summary", async (req, res, next) => {
	try {
		const filters = buildFilters(req.query)
		const transactions = await Transaction.find(filters).sort({ date: -1 })
		const monthlyMap = new Map()

		let income = 0
		let expense = 0

		transactions.forEach((transaction) => {
			const parsedDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date)

			if (Number.isNaN(parsedDate.getTime())) {
				return
			}

			const parsedAmount = Number(transaction.amount)
			if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
				return
			}

			const monthKey = parsedDate.toISOString().slice(0, 7)
			const monthEntry = monthlyMap.get(monthKey) || { month: monthKey, income: 0, expense: 0 }

			if (transaction.type === "income") {
				income += parsedAmount
				monthEntry.income += parsedAmount
			} else if (transaction.type === "expense") {
				expense += parsedAmount
				monthEntry.expense += parsedAmount
			}

			monthlyMap.set(monthKey, monthEntry)
		})

		res.json({
			success: true,
			data: {
				totals: {
					income,
					expense,
					balance: income - expense,
					count: transactions.length,
				},
				monthly: Array.from(monthlyMap.values()).sort((left, right) =>
					right.month.localeCompare(left.month)
				),
			},
		})
	} catch (err) {
		next(err)
	}
})

router.get("/:id", async (req, res, next) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			throw buildError("Invalid transaction id", 400)
		}

		const transaction = await Transaction.findById(req.params.id)

		if (!transaction) {
			throw buildError("Transaction not found", 404)
		}

		res.json({
			success: true,
			data: transaction,
		})
	} catch (err) {
		next(err)
	}
})

router.get("/", async (req, res, next) => {
	try {
		const filters = buildFilters(req.query)
		const data = await Transaction.find(filters).sort({ date: -1, createdAt: -1 })

		res.json({
			success: true,
			data,
		})
	} catch (err) {
		next(err)
	}
})

router.post("/", async (req, res, next) => {
	try {
		const payload = normalizeTransactionPayload(req.body)
		const transaction = await Transaction.create(payload)

		res.status(201).json({
			success: true,
			message: "Transaction created successfully",
			data: transaction,
		})
	} catch (err) {
		next(err)
	}
})

router.put("/:id", async (req, res, next) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			throw buildError("Invalid transaction id", 400)
		}

		const payload = normalizeTransactionPayload(req.body)
		const updated = await Transaction.findByIdAndUpdate(req.params.id, payload, {
			new: true,
			runValidators: true,
		})

		if (!updated) {
			throw buildError("Transaction not found", 404)
		}

		res.json({
			success: true,
			message: "Transaction updated successfully",
			data: updated,
		})
	} catch (err) {
		next(err)
	}
})

router.delete("/:id", async (req, res, next) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			throw buildError("Invalid transaction id", 400)
		}

		const deleted = await Transaction.findByIdAndDelete(req.params.id)

		if (!deleted) {
			throw buildError("Transaction not found", 404)
		}

		res.json({
			success: true,
			message: "Transaction deleted successfully",
		})
	} catch (err) {
		next(err)
	}
})

module.exports = router