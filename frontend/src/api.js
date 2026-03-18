import axios from "axios"

const API = axios.create({
	baseURL: process.env.REACT_APP_API_URL || "/api",
	timeout: 10000,
})

const cleanParams = (params = {}) =>
	Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined))

const unwrapData = (response) => response.data.data

export const getErrorMessage = (error) =>
	error?.response?.data?.message || error?.message || "Something went wrong"

export const getTransactions = async (params = {}) => {
	const response = await API.get("/transactions", {
		params: cleanParams(params),
	})

	return unwrapData(response)
}

export const getTransaction = async (id) => {
	const response = await API.get(`/transactions/${id}`)
	return unwrapData(response)
}

export const getTransactionSummary = async (params = {}) => {
	const response = await API.get("/transactions/summary", {
		params: cleanParams(params),
	})

	return unwrapData(response)
}

export const createTransaction = async (payload) => {
	const response = await API.post("/transactions", payload)
	return unwrapData(response)
}

export const updateTransaction = async (id, payload) => {
	const response = await API.put(`/transactions/${id}`, payload)
	return unwrapData(response)
}

export const deleteTransaction = async (id) => {
	const response = await API.delete(`/transactions/${id}`)
	return response.data
}

export default API