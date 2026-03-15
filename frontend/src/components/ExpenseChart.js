import { Doughnut } from "react-chartjs-2"
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js"
import { formatCurrency } from "../utils/formatters"

ChartJS.register(ArcElement, Tooltip, Legend)

const palette = ["#0f766e", "#ea580c", "#0284c7", "#e11d48", "#7c3aed", "#65a30d", "#ca8a04"]

function ExpenseChart({ transactions, loading }) {
	const expenseTransactions = transactions.filter((transaction) => transaction.type === "expense")
	const categoryTotals = {}

	expenseTransactions.forEach((transaction) => {
		categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount
	})

	const labels = Object.keys(categoryTotals)
	const values = Object.values(categoryTotals)
	const isDark = typeof document !== "undefined" && document.documentElement.dataset.theme === "dark"

	const data = {
		labels,
		datasets: [
			{
				data: values,
				backgroundColor: palette.slice(0, Math.max(labels.length, 1)),
				borderWidth: 0,
				hoverOffset: 8,
			},
		],
	}

	const options = {
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "bottom",
				labels: {
					color: isDark ? "#d9e2f1" : "#334155",
					usePointStyle: true,
					padding: 18,
				},
			},
			tooltip: {
				callbacks: {
					label: (context) => `${context.label}: ${formatCurrency(context.raw)}`,
				},
			},
		},
		cutout: "64%",
	}

	return (
		<section className="surface-card p-6">
			<div className="mb-5 flex items-center justify-between gap-3">
				<div>
					<h2 className="text-xl font-semibold text-[var(--text-primary)]">Expense distribution</h2>
					<p className="mt-1 text-sm text-[var(--text-muted)]">See which categories are driving spending.</p>
				</div>
			</div>

			{loading ? (
				<div className="h-[360px] animate-pulse rounded-[32px] bg-[var(--surface-strong)]" />
			) : labels.length ? (
				<div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
					<div className="h-[320px]">
						<Doughnut data={data} options={options} />
					</div>
					<div className="space-y-3">
						{labels.map((label, index) => (
							<div key={label} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 shadow-sm">
								<div className="flex items-center gap-3">
									<span className="h-3 w-3 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
									<span className="font-medium text-[var(--text-primary)]">{label}</span>
								</div>
								<span className="text-sm font-semibold text-[var(--text-secondary)]">{formatCurrency(categoryTotals[label])}</span>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="empty-state">Record at least one expense to generate the category chart.</div>
			)}
		</section>
	)
}

export default ExpenseChart