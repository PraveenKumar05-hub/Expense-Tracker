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
		<div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
			<section className="surface-card p-6 sm:p-8">
				<div className="mb-6 space-y-2">
					<p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
						{isEditMode ? "Update transaction" : "Create transaction"}
					</p>
					<h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
						{isEditMode ? "Edit an existing transaction" : "Add a new transaction"}
					</h1>
					<p className="text-sm leading-6 text-[var(--text-secondary)]">
						Keep the data clean at entry time so the dashboard and filters stay reliable.
					</p>
				</div>

				{apiError ? <div className="status-banner status-banner-error mb-5">{apiError}</div> : null}

				{loading ? (
					<div className="space-y-4">
						{Array.from({ length: 5 }).map((_, index) => (
							<div key={index} className="h-14 animate-pulse rounded-2xl bg-[var(--surface-strong)]" />
						))}
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="grid gap-5 md:grid-cols-2">
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

						<div className="grid gap-5 md:grid-cols-2">
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
								className="input-shell min-h-28 resize-y"
							/>
							<div className="flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
								<span>{errors.description ? <span className="field-error">{errors.description}</span> : "Optional but useful for reporting."}</span>
								<span>{form.description.length}/200</span>
							</div>
						</label>

						<div className="flex flex-wrap items-center gap-3 pt-2">
							<button type="submit" disabled={submitting} className="button-primary disabled:cursor-not-allowed disabled:opacity-60">
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

			<aside className="space-y-6">
				<section className="surface-card p-6">
					<p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Live preview</p>
					<div className="mt-5 rounded-[28px] border border-[var(--border)] bg-[var(--surface-strong)] p-5 shadow-sm">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm text-[var(--text-muted)]">{form.category || "Category"}</p>
								<p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
									{formatCurrency(form.amount || 0)}
								</p>
							</div>
							<span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${form.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
								{form.type}
							</span>
						</div>
						<p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
							{form.description || "Add a short note to remember what this transaction was for."}
						</p>
						<div className="mt-5 border-t border-[var(--border)] pt-4 text-sm text-[var(--text-muted)]">
							Transaction date: <span className="font-medium text-[var(--text-primary)]">{form.date || "Choose a date"}</span>
						</div>
					</div>
				</section>

				<section className="surface-card p-6">
					<h2 className="text-lg font-semibold text-[var(--text-primary)]">Suggested categories</h2>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">Use consistent categories so charts and filters stay useful.</p>
					<div className="mt-4 flex flex-wrap gap-2">
						{suggestions.map((suggestion) => (
							<button
								key={suggestion}
								type="button"
								onClick={() => setForm((current) => ({ ...current, category: suggestion }))}
								className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
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