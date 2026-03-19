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
		<section className="surface-card section-card">
			<div className="section-head">
				<div>
					<h2 className="section-title">Expense distribution</h2>
					<p className="section-subtitle">See which categories are driving spending.</p>
				</div>
			</div>

			{loading ? (
				<div className="chart-skeleton" />
			) : labels.length ? (
				<div className="chart-grid">
					<div className="chart-area">
						<Doughnut data={data} options={options} />
					</div>
					<div className="legend-list">
						{labels.map((label, index) => (
							<div key={label} className="legend-item">
								<div className="legend-left">
									<span className="legend-dot" style={{ backgroundColor: palette[index % palette.length] }} />
									<span className="legend-label">{label}</span>
								</div>
								<span className="legend-value">{formatCurrency(categoryTotals[label])}</span>
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