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
		<div className="space-y-6">
			<section className="surface-card p-6 sm:p-8">
				<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-2">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Transaction history</p>
						<h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Search, filter, edit, and manage your ledger</h1>
						<p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
							Filter the collection by category, type, keywords, or date range, then jump straight into edits when something looks off.
						</p>
					</div>

					<Link to="/add" className="button-primary inline-flex items-center gap-2 self-start lg:self-auto">
						<FiPlus />
						Add transaction
					</Link>
				</div>
			</section>

			{notice ? <div className="status-banner status-banner-success">{notice}</div> : null}
			{error ? <div className="status-banner status-banner-error">{error}</div> : null}

			<section className="surface-card p-6">
				<div className="mb-5 flex items-center gap-2 text-[var(--text-primary)]">
					<FiFilter />
					<h2 className="text-lg font-semibold">Filters</h2>
				</div>

				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
					<label className="field-shell xl:col-span-2">
						<span className="field-label">Search</span>
						<div className="relative">
							<FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
							<input
								type="search"
								name="search"
								value={filters.search}
								onChange={handleFilterChange}
								placeholder="Category or description"
								className="input-shell pl-11"
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

					<button type="button" onClick={() => setFilters(initialFilters)} className="button-secondary mt-auto">
						Clear filters
					</button>
				</div>

				<div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<label className="field-shell">
						<span className="field-label">Start date</span>
						<input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input-shell" />
					</label>

					<label className="field-shell">
						<span className="field-label">End date</span>
						<input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input-shell" />
					</label>

					<article className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 shadow-sm">
						<p className="text-sm text-[var(--text-muted)]">Filtered income</p>
						<p className="mt-2 text-2xl font-semibold text-emerald-600">{formatCurrency(filteredIncome)}</p>
					</article>

					<article className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 shadow-sm">
						<p className="text-sm text-[var(--text-muted)]">Filtered balance</p>
						<p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{formatCurrency(filteredIncome - filteredExpense)}</p>
					</article>
				</div>
			</section>

			<section className="surface-card overflow-hidden p-0">
				<div className="hidden overflow-x-auto lg:block">
					<table className="min-w-full text-left">
						<thead className="border-b border-[var(--border)] bg-[var(--surface-strong)] text-sm text-[var(--text-muted)]">
							<tr>
								<th className="px-6 py-4 font-medium">Type</th>
								<th className="px-6 py-4 font-medium">Category</th>
								<th className="px-6 py-4 font-medium">Description</th>
								<th className="px-6 py-4 font-medium">Date</th>
								<th className="px-6 py-4 font-medium">Amount</th>
								<th className="px-6 py-4 font-medium text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan="6" className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">
										Loading transactions...
									</td>
								</tr>
							) : transactions.length ? (
								transactions.map((transaction) => (
									<tr key={transaction._id} className="border-b border-[var(--border)] last:border-b-0">
										<td className="px-6 py-4">
											<span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${transaction.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
												{transaction.type}
											</span>
										</td>
										<td className="px-6 py-4 font-medium text-[var(--text-primary)]">{transaction.category}</td>
										<td className="px-6 py-4 text-[var(--text-secondary)]">{transaction.description || "-"}</td>
										<td className="px-6 py-4 text-[var(--text-secondary)]">{formatDate(transaction.date)}</td>
										<td className={`px-6 py-4 font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
											{transaction.type === "income" ? "+" : "-"}
											{formatCurrency(transaction.amount)}
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center justify-end gap-2">
												<Link to={`/transactions/${transaction._id}/edit`} className="button-ghost inline-flex items-center gap-2 px-3 py-2 text-sm">
													<FiEdit2 />
													Edit
												</Link>
												<button
													type="button"
													onClick={() => handleDelete(transaction._id)}
													disabled={deletingId === transaction._id}
													className="button-danger inline-flex items-center gap-2 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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
									<td colSpan="6" className="px-6 py-10 text-center text-sm text-[var(--text-muted)]">
										No transactions match the current filters.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className="grid gap-4 p-4 lg:hidden">
					{loading ? (
						<div className="empty-state">Loading transactions...</div>
					) : transactions.length ? (
						transactions.map((transaction) => (
							<article key={transaction._id} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-lg font-semibold text-[var(--text-primary)]">{transaction.category}</p>
										<p className="mt-1 text-sm text-[var(--text-secondary)]">{transaction.description || "No description"}</p>
									</div>
									<span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${transaction.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
										{transaction.type}
									</span>
								</div>

								<div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
									<span>{formatDate(transaction.date)}</span>
									<span className={`text-base font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
										{transaction.type === "income" ? "+" : "-"}
										{formatCurrency(transaction.amount)}
									</span>
								</div>

								<div className="mt-4 flex flex-wrap gap-2">
									<Link to={`/transactions/${transaction._id}/edit`} className="button-ghost inline-flex items-center gap-2 px-3 py-2 text-sm">
										<FiEdit2 />
										Edit
									</Link>
									<button
										type="button"
										onClick={() => handleDelete(transaction._id)}
										disabled={deletingId === transaction._id}
										className="button-danger inline-flex items-center gap-2 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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