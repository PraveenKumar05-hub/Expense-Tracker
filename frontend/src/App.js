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
			<div className="app-shell">
				<header className="topbar">
					<div className="topbar-inner">
						<div className="brand-row">
							<div className="brand-badge">
								ET
							</div>
							<div>
								<Link to="/" className="brand-title">
									Expense Tracker
								</Link>
								<p className="brand-subtitle">
									Monitor cash flow, trends, and transaction history from one place.
								</p>
							</div>
						</div>

						<div className="topbar-actions">
							<nav className="main-nav">
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

							<div className="quick-actions">
								<Link to="/add" className="button-primary icon-button">
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

				<main className="page-container">
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