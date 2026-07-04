'use client'
import { useState } from 'react'
import api from '@/lib/apiClient'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface ImportResult {
  created: number
  errors: { row: number; message: string }[]
}

export default function BulkProductsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [exporting, setExporting] = useState(false)

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/admin/products/bulk-import', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(data.data)
      toast.success(`Imported ${data.data.created} products`)
    } catch {
      toast.error('Import failed.')
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get('/admin/products/bulk-export', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `ecove-products-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-gray-400 hover:text-orange-500">← Back to Products</Link>
        <h1 className="text-xl font-extrabold text-gray-900 mt-2">Bulk Import / Export</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="font-bold text-sm text-gray-700 mb-2">Export Products</h2>
        <p className="text-sm text-gray-400 mb-4">Download a CSV of all products currently on the platform.</p>
        <button onClick={handleExport} disabled={exporting}
          className="px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-sm text-gray-700 mb-2">Import Products</h2>
        <p className="text-sm text-gray-400 mb-4">
          CSV columns: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">name, vendorId, price, stock, sku, categoryId, tags</code> (tags pipe-separated). Products import live immediately.
        </p>
        <input type="file" accept=".csv" aria-label="Upload product CSV" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm mb-4 block" />
        <button onClick={handleImport} disabled={!file || importing}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: '#f68b1f' }}>
          {importing ? 'Importing…' : 'Import CSV'}
        </button>

        {result && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-green-600 mb-2">{result.created} product(s) created</p>
            {result.errors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-red-600 mb-2">{result.errors.length} row(s) failed</p>
                <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-gray-50 text-gray-500"><th className="px-3 py-2 text-left">Row</th><th className="px-3 py-2 text-left">Error</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {result.errors.map((e, i) => (
                        <tr key={i}><td className="px-3 py-2">{e.row}</td><td className="px-3 py-2 text-red-500">{e.message}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
