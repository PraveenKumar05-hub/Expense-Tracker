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
		<div className="page-stack">
			<section className="surface-card hero-card">
				<div className="hero-grid">
					<div className="hero-content">
						<span className="hero-tag">
							Financial Overview
						</span>
						<div>
							<h1 className="hero-title">
								See where your money is moving before it surprises you.
							</h1>
							<p className="hero-copy">
								Track spending patterns, compare income against expenses, and surface recent activity with a cleaner workflow.
							</p>
						</div>
						<div className="hero-actions">
							<Link to="/add" className="button-primary icon-button">
								Add transaction
								<FiArrowRight />
							</Link>
							<Link to="/transactions" className="button-secondary">
								Review history
							</Link>
						</div>
					</div>

					<div className="hero-aside">
						<div>
							<p className="meta-label">
								Transactions logged
							</p>
							<p className="meta-value">{summary.totals.count}</p>
						</div>
						<div>
							<p className="meta-label">
								Top expense category
							</p>
							<p className="meta-text">
								{transactions.find((transaction) => transaction.type === "expense")?.category || "No expenses yet"}
							</p>
						</div>
						<div>
							<p className="meta-label">
								Active period
							</p>
							<p className="meta-text">
								{summary.monthly[0] ? formatMonthLabel(summary.monthly[0].month) : "No data"}
							</p>
						</div>
					</div>
				</div>
			</section>

			{error ? <div className="status-banner status-banner-error">{error}</div> : null}

			<section className="metrics-grid">
				{metrics.map((metric) => (
					<article key={metric.label} className={`metric-card ${metric.tone} ${loading ? "loading" : ""}`}>
						<div className="metric-header">
							<div>
								<p className="metric-label">{metric.label}</p>
								<p className="metric-value">{loading ? "Loading..." : metric.value}</p>
							</div>
							<div className="metric-icon">{metric.icon}</div>
						</div>
						<p className="metric-description">{metric.description}</p>
					</article>
				))}
			</section>

			<section className="split-grid">
				<ExpenseChart transactions={transactions} loading={loading} />
				<RecentTransactions transactions={transactions} loading={loading} />
			</section>

			<section className="surface-card section-card">
				<div className="section-head">
					<div>
						<h2 className="section-title">Monthly summaries</h2>
						<p className="section-subtitle">Compare how income and expenses are trending month over month.</p>
					</div>
				</div>

				{loading ? (
					<div className="monthly-grid">
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className="skeleton-card" />
						))}
					</div>
				) : summary.monthly.length ? (
					<div className="monthly-grid">
						{summary.monthly.slice(0, 4).map((item) => (
							<article key={item.month} className="monthly-card">
								<p className="monthly-title">{formatMonthLabel(item.month)}</p>
								<div className="monthly-rows">
									<div className="monthly-row">
										<span>Income</span>
										<span className="income-text">{formatCurrency(item.income)}</span>
									</div>
									<div className="monthly-row">
										<span>Expense</span>
										<span className="expense-text">{formatCurrency(item.expense)}</span>
									</div>
									<div className="monthly-row total-row">
										<span>Balance</span>
										<span className="total-text">{formatCurrency(item.income - item.expense)}</span>
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