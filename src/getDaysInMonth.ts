export default function getDaysInMonth(date: Date): number {
  const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return newDate.getDate()
}
