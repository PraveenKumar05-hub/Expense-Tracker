export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

export const formatDate = (value) => {
  if (!value) {
    return "No date"
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export const formatMonthLabel = (value) => {
  if (!value) {
    return "No month"
  }

  const date = new Date(`${value}-01T00:00:00`)

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date)
}

export const toInputDate = (value) => {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)

  return localDate.toISOString().slice(0, 10)
}