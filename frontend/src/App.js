import { useEffect, useState } from "react"
import { BrowserRouter, Link, NavLink, Route, Routes } from "react-router-dom"
import { FiMoon, FiPlus, FiSun } from "react-icons/fi"
import Dashboard from "./pages/Dashboard"
import AddTransaction from "./pages/AddTransaction"
import Transactions from "./pages/Transactions"

const getInitialTheme = () => {
	if (typeof window === "undefined") {
		return false
	}

	return window.localStorage.getItem("expense-tracker-theme") === "dark"
}

function App() {
	const [dark, setDark] = useState(getInitialTheme)

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", dark ? "dark" : "light")
		window.localStorage.setItem("expense-tracker-theme", dark ? "dark" : "light")
	}, [dark])

	return (
		<BrowserRouter>
			<div className="min-h-screen">
				<header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--surface-strong)] backdrop-blur-xl">
					<div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
						<div className="flex items-center gap-3">
							<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-lg font-semibold text-white shadow-lg shadow-black/10">
								ET
							</div>
							<div>
								<Link to="/" className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
									Expense Tracker
								</Link>
								<p className="text-sm text-[var(--text-muted)]">
									Monitor cash flow, trends, and transaction history from one place.
								</p>
							</div>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<nav className="flex flex-wrap items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-sm">
								<NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
									Dashboard
								</NavLink>
								<NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
									Transactions
								</NavLink>
								<NavLink to="/add" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
									Add Transaction
								</NavLink>
							</nav>

							<div className="flex items-center gap-2">
								<Link to="/add" className="button-primary inline-flex items-center gap-2">
									<FiPlus />
									New Entry
								</Link>
								<button type="button" onClick={() => setDark((current) => !current)} className="theme-toggle" aria-label="Toggle theme">
									{dark ? <FiSun /> : <FiMoon />}
								</button>
							</div>
						</div>
					</div>
				</header>

				<main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
					<Routes>
						<Route path="/" element={<Dashboard />} />
						<Route path="/add" element={<AddTransaction />} />
						<Route path="/transactions" element={<Transactions />} />
						<Route path="/transactions/:id/edit" element={<AddTransaction />} />
					</Routes>
				</main>
			</div>
		</BrowserRouter>
	)
}

export default App