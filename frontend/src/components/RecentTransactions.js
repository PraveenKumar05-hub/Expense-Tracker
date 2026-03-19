import { formatCurrency, formatDate } from "../utils/formatters"

function RecentTransactions({ transactions, loading }) {
	const recent = transactions.slice(0, 5)

	return (
		<section className="surface-card section-card">
			<div className="section-head">
				<div>
					<h2 className="section-title">Recent transactions</h2>
					<p className="section-subtitle">The latest activity across your ledger.</p>
				</div>
			</div>

			{loading ? (
				<div className="recent-list">
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} className="skeleton-row" />
					))}
				</div>
			) : recent.length ? (
				<ul className="recent-list">
					{recent.map((transaction) => (
						<li key={transaction._id} className="recent-item">
							<div>
								<div className="recent-topline">
									<p className="recent-category">{transaction.category}</p>
									<span className={`type-chip ${transaction.type === "income" ? "type-income" : "type-expense"}`}>
										{transaction.type}
									</span>
								</div>
								<p className="recent-description">{transaction.description || "No description"}</p>
							</div>

							<div className="recent-amount-block">
								<p className={`recent-amount ${transaction.type === "income" ? "income-text" : "expense-text"}`}>
									{transaction.type === "income" ? "+" : "-"}
									{formatCurrency(transaction.amount)}
								</p>
								<p className="recent-date">{formatDate(transaction.date)}</p>
							</div>
						</li>
					))}
				</ul>
			) : (
				<div className="empty-state">Add transactions to populate the recent activity list.</div>
			)}
		</section>
	)
}

export default RecentTransactions