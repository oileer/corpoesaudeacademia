export function cpfToEmail(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  return `${digits}@estacao.app`
}

export function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `tel${digits}@estacao.app`
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function planDueDateFromStart(startDate: string, plan: string): string {
  const date = new Date(startDate)
  const months: Record<string, number> = {
    monthly: 1,
    quarterly: 3,
    semiannual: 6,
    annual: 12,
  }
  date.setMonth(date.getMonth() + (months[plan] ?? 1))
  return date.toISOString().split('T')[0]
}
