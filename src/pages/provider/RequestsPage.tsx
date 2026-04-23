import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Phone, MessageSquare, Filter } from 'lucide-react'
import { requestsApi } from '../../lib/api/providers'

const STATUSES = ['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED']
const statusColors: Record<string, string> = {
  PENDING: 'badge-pending', ACCEPTED: 'badge-accepted',
  COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled',
}
const nextActions: Record<string, { label: string; status: string; cls: string }[]> = {
  PENDING: [
    { label: 'Accept', status: 'ACCEPTED', cls: 'btn-primary text-xs py-1 px-2.5' },
    { label: 'Decline', status: 'CANCELLED', cls: 'btn-ghost text-xs py-1 px-2.5 hover:!text-destructive' },
  ],
  ACCEPTED: [
    { label: 'Complete', status: 'COMPLETED', cls: 'btn-primary text-xs py-1 px-2.5' },
    { label: 'Cancel', status: 'CANCELLED', cls: 'btn-ghost text-xs py-1 px-2.5 hover:!text-destructive' },
  ],
}

export default function RequestsPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('ALL')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['requests', filter, page],
    queryFn: () => requestsApi.list({ status: filter === 'ALL' ? undefined : filter, page }),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => requestsApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requests'] }); toast.success('Status updated') },
    onError: () => toast.error('Failed to update'),
  })

  const requests = data?.data?.requests || []
  const total = data?.data?.total || 0
  const pages = data?.data?.pages || 1

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Requests</h1>
          <p className="page-subtitle">{total} total incoming service request{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          {/* Filter + stats bar */}
          <div className="px-5 py-4 border-b border-border flex items-center gap-3 flex-wrap">
            <Filter size={15} className="text-muted-foreground" />
            <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
              {STATUSES.map(s => (
                <button key={s} onClick={() => { setFilter(s); setPage(1) }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${filter === s ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-medium text-foreground">No {filter !== 'ALL' ? filter.toLowerCase() : ''} requests</p>
              <p className="text-sm text-muted-foreground mt-1">They'll appear here when received</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Message</th>
                    <th>Received</th>
                    <th>Status</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req: any) => (
                    <tr key={req.id} className="animate-fade-in">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{req.customerName?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{req.customerName}</p>
                            <p className="text-xs text-muted-foreground">{req.customerPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm">{req.service?.name || <span className="text-muted-foreground">General</span>}</td>
                      <td className="max-w-[180px]"><p className="text-sm text-muted-foreground truncate">{req.message || '—'}</p></td>
                      <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(req.createdAt).toLocaleDateString('en-KE')}</td>
                      <td><span className={`badge ${statusColors[req.status] || ''}`}>{req.status}</span></td>
                      <td>
                        <div className="flex gap-1.5">
                          <a href={`tel:${req.customerPhone}`} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Call">
                            <Phone size={13} />
                          </a>
                          <a href={`https://wa.me/${req.customerPhone?.replace(/^0/, '254')}`} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="WhatsApp">
                            <MessageSquare size={13} />
                          </a>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1.5">
                          {(nextActions[req.status] || []).map(({ label, status, cls }) => (
                            <button key={status} onClick={() => updateMut.mutate({ id: req.id, status })}
                              disabled={updateMut.isPending} className={cls}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs py-1.5 px-3">Prev</button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary text-xs py-1.5 px-3">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
