import { startTransition, useDeferredValue, useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { FiEdit2, FiFilter, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi"
import { deleteTransaction, getErrorMessage, getTransactions } from "../api"
import { formatCurrency, formatDate } from "../utils/formatters"

const initialFilters = {
	search: "",
	type: "",
	category: "",
	startDate: "",
	endDate: "",
}

function Transactions() {
	const location = useLocation()
	const [notice] = useState(location.state?.notice || "")
	const [transactions, setTransactions] = useState([])
	const [categories, setCategories] = useState([])
	const [filters, setFilters] = useState(initialFilters)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [deletingId, setDeletingId] = useState("")
	const deferredSearch = useDeferredValue(filters.search)

	const syncCategories = async () => {
		const allTransactions = await getTransactions()
		const uniqueCategories = Array.from(new Set(allTransactions.map((transaction) => transaction.category))).sort((left, right) =>
			left.localeCompare(right)
		)
		setCategories(uniqueCategories)
	}

	useEffect(() => {
		let isMounted = true

		const loadCategories = async () => {
			try {
				const allTransactions = await getTransactions()

				if (!isMounted) {
					return
				}

				const uniqueCategories = Array.from(new Set(allTransactions.map((transaction) => transaction.category))).sort((left, right) =>
					left.localeCompare(right)
				)
				setCategories(uniqueCategories)
			} catch {
				if (isMounted) {
					setCategories([])
				}
			}
		}

		loadCategories()

		return () => {
			isMounted = false
		}
	}, [])

	useEffect(() => {
		let isMounted = true

		const loadTransactions = async () => {
			setLoading(true)
			setError("")

			try {
				const data = await getTransactions({
					search: deferredSearch,
					type: filters.type,
					category: filters.category,
					startDate: filters.startDate,
					endDate: filters.endDate,
				})

				if (!isMounted) {
					return
				}

				startTransition(() => {
					setTransactions(data)
				})
			} catch (err) {
				if (isMounted) {
					setError(getErrorMessage(err))
				}
			} finally {
				if (isMounted) {
					setLoading(false)
				}
			}
		}

		loadTransactions()

		return () => {
			isMounted = false
		}
	}, [deferredSearch, filters.category, filters.endDate, filters.startDate, filters.type])

	const filteredIncome = transactions
		.filter((transaction) => transaction.type === "income")
		.reduce((total, transaction) => total + transaction.amount, 0)

	const filteredExpense = transactions
		.filter((transaction) => transaction.type === "expense")
		.reduce((total, transaction) => total + transaction.amount, 0)

	const handleFilterChange = (event) => {
		const { name, value } = event.target

		setFilters((current) => ({
			...current,
			[name]: value,
		}))
	}

	const handleDelete = async (id) => {
		if (!window.confirm("Delete this transaction?")) {
			return
		}

		try {
			setDeletingId(id)
			await deleteTransaction(id)
			const [updated] = await Promise.all([
				getTransactions({
					search: deferredSearch,
					type: filters.type,
					category: filters.category,
					startDate: filters.startDate,
					endDate: filters.endDate,
				}),
				syncCategories(),
			])
			setTransactions(updated)
		} catch (err) {
			setError(getErrorMessage(err))
		} finally {
			setDeletingId("")
		}
	}

	return (
		<div className="page-stack">
			<section className="surface-card section-card">
				<div className="section-head split-head">
					<div>
						<p className="meta-label">Transaction history</p>
						<h1 className="section-title">Search, filter, edit, and manage your ledger</h1>
						<p className="section-subtitle wide-copy">
							Filter the collection by category, type, keywords, or date range, then jump straight into edits when something looks off.
						</p>
					</div>

					<Link to="/add" className="button-primary icon-button">
						<FiPlus />
						Add transaction
					</Link>
				</div>
			</section>

			{notice ? <div className="status-banner status-banner-success">{notice}</div> : null}
			{error ? <div className="status-banner status-banner-error">{error}</div> : null}

			<section className="surface-card section-card">
				<div className="section-head icon-head">
					<FiFilter />
					<h2 className="section-title">Filters</h2>
				</div>

				<div className="filters-grid">
					<label className="field-shell search-field">
						<span className="field-label">Search</span>
						<div className="search-wrap">
							<FiSearch className="search-icon" />
							<input
								type="search"
								name="search"
								value={filters.search}
								onChange={handleFilterChange}
								placeholder="Category or description"
								className="input-shell input-search"
							/>
						</div>
					</label>

					<label className="field-shell">
						<span className="field-label">Type</span>
						<select name="type" value={filters.type} onChange={handleFilterChange} className="input-shell">
							<option value="">All types</option>
							<option value="income">Income</option>
							<option value="expense">Expense</option>
						</select>
					</label>

					<label className="field-shell">
						<span className="field-label">Category</span>
						<select name="category" value={filters.category} onChange={handleFilterChange} className="input-shell">
							<option value="">All categories</option>
							{categories.map((category) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</select>
					</label>

					<button type="button" onClick={() => setFilters(initialFilters)} className="button-secondary filter-reset-btn">
						Clear filters
					</button>
				</div>

				<div className="filters-subgrid">
					<label className="field-shell">
						<span className="field-label">Start date</span>
						<input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input-shell" />
					</label>

					<label className="field-shell">
						<span className="field-label">End date</span>
						<input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input-shell" />
					</label>

					<article className="stat-card">
						<p className="meta-label">Filtered income</p>
						<p className="stat-value income-text">{formatCurrency(filteredIncome)}</p>
					</article>

					<article className="stat-card">
						<p className="meta-label">Filtered balance</p>
						<p className="stat-value">{formatCurrency(filteredIncome - filteredExpense)}</p>
					</article>
				</div>
			</section>

			<section className="surface-card transactions-table-shell">
				<div className="desktop-table">
					<table className="transactions-table">
						<thead className="table-head">
							<tr>
								<th className="table-cell-head">Type</th>
								<th className="table-cell-head">Category</th>
								<th className="table-cell-head">Description</th>
								<th className="table-cell-head">Date</th>
								<th className="table-cell-head">Amount</th>
								<th className="table-cell-head table-cell-head-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan="6" className="table-state-cell">
										Loading transactions...
									</td>
								</tr>
							) : transactions.length ? (
								transactions.map((transaction) => (
									<tr key={transaction._id} className="table-row">
										<td className="table-cell">
											<span className={`type-chip ${transaction.type === "income" ? "type-income" : "type-expense"}`}>
												{transaction.type}
											</span>
										</td>
										<td className="table-cell cell-strong">{transaction.category}</td>
										<td className="table-cell cell-muted">{transaction.description || "-"}</td>
										<td className="table-cell cell-muted">{formatDate(transaction.date)}</td>
										<td className={`table-cell amount-cell ${transaction.type === "income" ? "income-text" : "expense-text"}`}>
											{transaction.type === "income" ? "+" : "-"}
											{formatCurrency(transaction.amount)}
										</td>
										<td className="table-cell">
											<div className="table-actions">
												<Link to={`/transactions/${transaction._id}/edit`} className="button-ghost icon-button small-btn">
													<FiEdit2 />
													Edit
												</Link>
												<button
													type="button"
													onClick={() => handleDelete(transaction._id)}
													disabled={deletingId === transaction._id}
													className="button-danger icon-button small-btn"
												>
													<FiTrash2 />
													{deletingId === transaction._id ? "Deleting..." : "Delete"}
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="6" className="table-state-cell">
										No transactions match the current filters.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className="mobile-cards">
					{loading ? (
						<div className="empty-state">Loading transactions...</div>
					) : transactions.length ? (
						transactions.map((transaction) => (
							<article key={transaction._id} className="mobile-card">
								<div className="mobile-card-head">
									<div>
										<p className="mobile-card-title">{transaction.category}</p>
										<p className="mobile-card-subtitle">{transaction.description || "No description"}</p>
									</div>
									<span className={`type-chip ${transaction.type === "income" ? "type-income" : "type-expense"}`}>
										{transaction.type}
									</span>
								</div>

								<div className="mobile-card-meta">
									<span>{formatDate(transaction.date)}</span>
									<span className={`mobile-card-amount ${transaction.type === "income" ? "income-text" : "expense-text"}`}>
										{transaction.type === "income" ? "+" : "-"}
										{formatCurrency(transaction.amount)}
									</span>
								</div>

								<div className="mobile-card-actions">
									<Link to={`/transactions/${transaction._id}/edit`} className="button-ghost icon-button small-btn">
										<FiEdit2 />
										Edit
									</Link>
									<button
										type="button"
										onClick={() => handleDelete(transaction._id)}
										disabled={deletingId === transaction._id}
										className="button-danger icon-button small-btn"
									>
										<FiTrash2 />
										{deletingId === transaction._id ? "Deleting..." : "Delete"}
									</button>
								</div>
							</article>
						))
					) : (
						<div className="empty-state">No transactions match the current filters.</div>
					)}
				</div>
			</section>
		</div>
	)
}

export default Transactions
