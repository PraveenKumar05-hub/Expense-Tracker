import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { createTransaction, getErrorMessage, getTransaction, updateTransaction } from "../api"
import { formatCurrency, toInputDate } from "../utils/formatters"

const defaultForm = {
	type: "expense",
	amount: "",
	category: "",
	description: "",
	date: toInputDate(new Date()),
}

const categorySuggestions = {
	income: ["Salary", "Bonus", "Freelance", "Interest", "Refund"],
	expense: ["Food", "Transport", "Rent", "Utilities", "Shopping", "Health", "Entertainment"],
}

const normalizeType = (value) => {
	const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""

	if (["income", "credit"].includes(normalized)) {
		return "income"
	}

	if (["expense", "debit"].includes(normalized)) {
		return "expense"
	}

	return "expense"
}

function AddTransaction() {
	const navigate = useNavigate()
	const { id } = useParams()
	const isEditMode = Boolean(id)
	const [form, setForm] = useState(defaultForm)
	const [initialFormState, setInitialFormState] = useState(defaultForm)
	const [errors, setErrors] = useState({})
	const [loading, setLoading] = useState(isEditMode)
	const [submitting, setSubmitting] = useState(false)
	const [apiError, setApiError] = useState("")

	useEffect(() => {
		if (!isEditMode) {
			return undefined
		}

		let isMounted = true

		const loadTransaction = async () => {
			setLoading(true)
			setApiError("")

			try {
				const transaction = await getTransaction(id)

				if (!isMounted) {
					return
				}

				const nextFormState = {
					type: normalizeType(transaction.type),
					amount: String(transaction.amount),
					category: transaction.category,
					description: transaction.description || "",
					date: toInputDate(transaction.date),
				}

				setForm(nextFormState)
				setInitialFormState(nextFormState)
			} catch (err) {
				if (isMounted) {
					setApiError(getErrorMessage(err))
				}
			} finally {
				if (isMounted) {
					setLoading(false)
				}
			}
		}

		loadTransaction()

		return () => {
			isMounted = false
		}
	}, [id, isEditMode])

	const suggestions = categorySuggestions[form.type] || []

	const validateForm = () => {
		const nextErrors = {}

		if (!["income", "expense"].includes(normalizeType(form.type))) {
			nextErrors.type = "Type is required"
		}

		if (!form.category.trim()) {
			nextErrors.category = "Category is required"
		}

		if (!form.amount || Number(form.amount) <= 0) {
			nextErrors.amount = "Amount must be greater than 0"
		}

		if (!form.date) {
			nextErrors.date = "Date is required"
		}

		if (form.description.length > 200) {
			nextErrors.description = "Description must be 200 characters or fewer"
		}

		return nextErrors
	}

	const handleChange = (event) => {
		const { name, value } = event.target
		const nextValue = name === "type" ? normalizeType(value) : value

		setForm((current) => ({
			...current,
			[name]: nextValue,
		}))

		setErrors((current) => {
			const nextErrors = { ...current }
			delete nextErrors[name]
			return nextErrors
		})
	}

	const handleReset = () => {
		setForm(initialFormState)
		setErrors({})
		setApiError("")
	}

	const handleSubmit = async (event) => {
		event.preventDefault()

		const nextErrors = validateForm()
		setErrors(nextErrors)
		setApiError("")

		if (Object.keys(nextErrors).length) {
			return
		}

		const payload = {
			...form,
			type: normalizeType(form.type),
			amount: Number(form.amount),
			category: form.category.trim(),
			description: form.description.trim(),
		}

		try {
			setSubmitting(true)

			if (isEditMode) {
				await updateTransaction(id, payload)
			} else {
				await createTransaction(payload)
			}

			navigate("/transactions", {
				state: {
					notice: isEditMode ? "Transaction updated successfully." : "Transaction added successfully.",
				},
			})
		} catch (err) {
			setApiError(getErrorMessage(err))
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="form-layout">
			<section className="surface-card section-card">
				<div className="form-header">
					<p className="meta-label">
						{isEditMode ? "Update transaction" : "Create transaction"}
					</p>
					<h1 className="section-title">
						{isEditMode ? "Edit an existing transaction" : "Add a new transaction"}
					</h1>
					<p className="section-subtitle">
						Keep the data clean at entry time so the dashboard and filters stay reliable.
					</p>
				</div>

				{apiError ? <div className="status-banner status-banner-error form-error-banner">{apiError}</div> : null}

				{loading ? (
					<div className="form-skeleton-list">
						{Array.from({ length: 5 }).map((_, index) => (
							<div key={index} className="skeleton-row" />
						))}
					</div>
				) : (
					<form onSubmit={handleSubmit} className="form-stack">
						<div className="form-grid-two">
							<label className="field-shell">
								<span className="field-label">Type</span>
								<select name="type" value={form.type} onChange={handleChange} className="input-shell">
									<option value="expense">Expense</option>
									<option value="income">Income</option>
								</select>
								{errors.type ? <span className="field-error">{errors.type}</span> : null}
							</label>

							<label className="field-shell">
								<span className="field-label">Amount</span>
								<input
									type="number"
									min="0"
									step="0.01"
									name="amount"
									value={form.amount}
									onChange={handleChange}
									placeholder="0.00"
									className="input-shell"
								/>
								{errors.amount ? <span className="field-error">{errors.amount}</span> : null}
							</label>
						</div>

						<div className="form-grid-two">
							<label className="field-shell">
								<span className="field-label">Category</span>
								<input
									list="category-suggestions"
									name="category"
									value={form.category}
									onChange={handleChange}
									placeholder="Choose or type a category"
									className="input-shell"
								/>
								<datalist id="category-suggestions">
									{suggestions.map((suggestion) => (
										<option key={suggestion} value={suggestion} />
									))}
								</datalist>
								{errors.category ? <span className="field-error">{errors.category}</span> : null}
							</label>

							<label className="field-shell">
								<span className="field-label">Date</span>
								<input type="date" name="date" value={form.date} onChange={handleChange} className="input-shell" />
								{errors.date ? <span className="field-error">{errors.date}</span> : null}
							</label>
						</div>

						<label className="field-shell">
							<span className="field-label">Description</span>
							<textarea
								name="description"
								value={form.description}
								onChange={handleChange}
								placeholder="Optional context about the transaction"
								rows="4"
								className="input-shell text-area"
							/>
							<div className="text-muted-row">
								<span>{errors.description ? <span className="field-error">{errors.description}</span> : "Optional but useful for reporting."}</span>
								<span>{form.description.length}/200</span>
							</div>
						</label>

						<div className="form-actions">
							<button type="submit" disabled={submitting} className="button-primary">
								{submitting ? "Saving..." : isEditMode ? "Update transaction" : "Add transaction"}
							</button>
							<button type="button" onClick={handleReset} className="button-secondary">
								Reset form
							</button>
							<Link to="/transactions" className="button-ghost">
								Cancel
							</Link>
						</div>
					</form>
				)}
			</section>

			<aside className="right-panel-stack">
				<section className="surface-card section-card">
					<p className="meta-label">Live preview</p>
					<div className="preview-card">
						<div className="preview-topline">
							<div>
								<p className="preview-label">{form.category || "Category"}</p>
								<p className="preview-value">
									{formatCurrency(form.amount || 0)}
								</p>
							</div>
							<span className={`type-chip ${form.type === "income" ? "type-income" : "type-expense"}`}>
								{form.type}
							</span>
						</div>
						<p className="preview-description">
							{form.description || "Add a short note to remember what this transaction was for."}
						</p>
						<div className="preview-date">
							Transaction date: <span className="total-text">{form.date || "Choose a date"}</span>
						</div>
					</div>
				</section>

				<section className="surface-card section-card">
					<h2 className="section-title">Suggested categories</h2>
					<p className="section-subtitle">Use consistent categories so charts and filters stay useful.</p>
					<div className="chip-row">
						{suggestions.map((suggestion) => (
							<button
								key={suggestion}
								type="button"
								onClick={() => setForm((current) => ({ ...current, category: suggestion }))}
								className="suggestion-chip"
							>
								{suggestion}
							</button>
						))}
					</div>
				</section>
			</aside>
		</div>
	)
}

export default AddTransaction