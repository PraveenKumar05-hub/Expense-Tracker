import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FiArrowRight, FiDollarSign, FiTrendingDown, FiTrendingUp } from "react-icons/fi"
import { getErrorMessage, getTransactionSummary, getTransactions } from "../api"
import ExpenseChart from "../components/ExpenseChart"
import RecentTransactions from "../components/RecentTransactions"
import { formatCurrency, formatMonthLabel } from "../utils/formatters"

function Dashboard() {
	const [transactions, setTransactions] = useState([])
	const [summary, setSummary] = useState({
		totals: { income: 0, expense: 0, balance: 0, count: 0 },
		monthly: [],
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	useEffect(() => {
		let isMounted = true

		const loadDashboard = async () => {
			setLoading(true)
			setError("")

			try {
				const [transactionData, summaryData] = await Promise.all([getTransactions(), getTransactionSummary()])

				if (!isMounted) {
					return
				}

				setTransactions(transactionData)
				setSummary(summaryData)
			} catch (err) {
				if (!isMounted) {
					return
				}

				setError(getErrorMessage(err))
			} finally {
				if (isMounted) {
					setLoading(false)
				}
			}
		}

		loadDashboard()

		return () => {
			isMounted = false
		}
	}, [])

	const metrics = [
		{
			label: "Income",
			value: formatCurrency(summary.totals.income),
			description: "All recorded incoming cash flow",
			icon: <FiTrendingUp />,
			tone: "metric-card-income",
		},
		{
			label: "Expenses",
			value: formatCurrency(summary.totals.expense),
			description: "All recorded outgoing cash flow",
			icon: <FiTrendingDown />,
			tone: "metric-card-expense",
		},
		{
			label: "Balance",
			value: formatCurrency(summary.totals.balance),
			description: `${summary.totals.count} transactions tracked`,
			icon: <FiDollarSign />,
			tone: "metric-card-balance",
		},
	]

	return (
		<div className="space-y-6">
			<section className="surface-card overflow-hidden p-6 sm:p-8">
				<div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
					<div className="space-y-4">
						<span className="inline-flex rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] shadow-sm">
							Financial Overview
						</span>
						<div className="space-y-3">
							<h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
								See where your money is moving before it surprises you.
							</h1>
							<p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
								Track spending patterns, compare income against expenses, and surface recent activity with a cleaner workflow.
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<Link to="/add" className="button-primary inline-flex items-center gap-2">
								Add transaction
								<FiArrowRight />
							</Link>
							<Link to="/transactions" className="button-secondary">
								Review history
							</Link>
						</div>
					</div>

					<div className="grid gap-3 rounded-[28px] border border-[var(--border)] bg-[var(--surface-strong)] p-4 shadow-inner shadow-black/5 sm:grid-cols-3 lg:grid-cols-1">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
								Transactions logged
							</p>
							<p className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{summary.totals.count}</p>
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
								Top expense category
							</p>
							<p className="mt-2 text-lg font-medium text-[var(--text-primary)]">
								{transactions.find((transaction) => transaction.type === "expense")?.category || "No expenses yet"}
							</p>
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
								Active period
							</p>
							<p className="mt-2 text-lg font-medium text-[var(--text-primary)]">
								{summary.monthly[0] ? formatMonthLabel(summary.monthly[0].month) : "No data"}
							</p>
						</div>
					</div>
				</div>
			</section>

			{error ? <div className="status-banner status-banner-error">{error}</div> : null}

			<section className="grid gap-4 md:grid-cols-3">
				{metrics.map((metric) => (
					<article key={metric.label} className={`metric-card ${metric.tone} ${loading ? "animate-pulse" : ""}`}>
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-medium text-white/80">{metric.label}</p>
								<p className="mt-3 text-3xl font-semibold text-white">{loading ? "Loading..." : metric.value}</p>
							</div>
							<div className="rounded-2xl bg-white/15 p-3 text-2xl text-white">{metric.icon}</div>
						</div>
						<p className="mt-4 text-sm text-white/80">{metric.description}</p>
					</article>
				))}
			</section>

			<section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
				<ExpenseChart transactions={transactions} loading={loading} />
				<RecentTransactions transactions={transactions} loading={loading} />
			</section>

			<section className="surface-card p-6">
				<div className="mb-5 flex items-center justify-between gap-3">
					<div>
						<h2 className="text-xl font-semibold text-[var(--text-primary)]">Monthly summaries</h2>
						<p className="mt-1 text-sm text-[var(--text-muted)]">Compare how income and expenses are trending month over month.</p>
					</div>
				</div>

				{loading ? (
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="h-32 animate-pulse rounded-3xl bg-[var(--surface-strong)]" />
						))}
					</div>
				) : summary.monthly.length ? (
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						{summary.monthly.slice(0, 4).map((item) => (
							<article key={item.month} className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 shadow-sm">
								<p className="text-sm font-semibold text-[var(--text-primary)]">{formatMonthLabel(item.month)}</p>
								<div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
									<div className="flex items-center justify-between gap-3">
										<span>Income</span>
										<span className="font-semibold text-emerald-600">{formatCurrency(item.income)}</span>
									</div>
									<div className="flex items-center justify-between gap-3">
										<span>Expense</span>
										<span className="font-semibold text-rose-600">{formatCurrency(item.expense)}</span>
									</div>
									<div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-[var(--text-primary)]">
										<span>Balance</span>
										<span className="font-semibold">{formatCurrency(item.income - item.expense)}</span>
									</div>
								</div>
							</article>
						))}
					</div>
				) : (
					<div className="empty-state">Add a few transactions to generate monthly summaries.</div>
				)}
			</section>
		</div>
	)
}

export default Dashboard