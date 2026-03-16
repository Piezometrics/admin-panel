import { apiRequest } from './client'
import type {
  CsvImportResponse,
  CsvPreviewResponse,
  Deposit,
  DepositPatch,
  Drillhole,
  DrillholePatch,
} from '../types'

export async function fetchHealth(): Promise<{ status: string }> {
  return apiRequest('', { service: 'health' })
}

export async function fetchDeposits(): Promise<Deposit[]> {
  return apiRequest('/deposits')
}

export async function createDeposit(data: Deposit): Promise<Deposit> {
  return apiRequest('/deposits', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function patchDeposit(id: string, data: DepositPatch): Promise<Deposit> {
  return apiRequest(`/deposits/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteDeposit(id: string): Promise<void> {
  await apiRequest(`/deposits/${id}`, { method: 'DELETE' })
}

export async function fetchDrillholes(depositId: string): Promise<Drillhole[]> {
  const query = new URLSearchParams({ deposit_id: depositId })
  return apiRequest(`/drillholes?${query.toString()}`)
}

export async function createDrillhole(data: Drillhole): Promise<Drillhole> {
  return apiRequest('/drillholes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function patchDrillhole(id: string, data: DrillholePatch): Promise<Drillhole> {
  return apiRequest(`/drillholes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteDrillhole(id: string): Promise<void> {
  await apiRequest(`/drillholes/${id}`, { method: 'DELETE' })
}

export async function previewDrillholeCsv(depositId: string, file: File): Promise<CsvPreviewResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest(`/drillholes/import/csv/preview?deposit_id=${encodeURIComponent(depositId)}`, {
    method: 'POST',
    body: formData,
  })
}

export async function importDrillholeCsv(depositId: string, file: File): Promise<CsvImportResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest(`/drillholes/import/csv?deposit_id=${encodeURIComponent(depositId)}`, {
    method: 'POST',
    body: formData,
  })
}