import { formatCurrency, formatDate } from "../utils/formatters"

function RecentTransactions({ transactions, loading }) {
	const recent = transactions.slice(0, 5)

	return (
		<section className="surface-card p-6">
			<div className="mb-5 flex items-center justify-between gap-3">
				<div>
					<h2 className="text-xl font-semibold text-[var(--text-primary)]">Recent transactions</h2>
					<p className="mt-1 text-sm text-[var(--text-muted)]">The latest activity across your ledger.</p>
				</div>
			</div>

			{loading ? (
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} className="h-20 animate-pulse rounded-3xl bg-[var(--surface-strong)]" />
					))}
				</div>
			) : recent.length ? (
				<ul className="space-y-3">
					{recent.map((transaction) => (
						<li key={transaction._id} className="flex items-center justify-between gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 shadow-sm">
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<p className="font-medium text-[var(--text-primary)]">{transaction.category}</p>
									<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${transaction.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
										{transaction.type}
									</span>
								</div>
								<p className="mt-1 text-sm text-[var(--text-secondary)]">{transaction.description || "No description"}</p>
							</div>

							<div className="text-right">
								<p className={`text-lg font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
									{transaction.type === "income" ? "+" : "-"}
									{formatCurrency(transaction.amount)}
								</p>
								<p className="mt-1 text-sm text-[var(--text-muted)]">{formatDate(transaction.date)}</p>
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