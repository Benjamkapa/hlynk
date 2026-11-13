
import { useMemo, useState } from 'react'
import {
  HardDrive,
  Search,
  Trash2,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Database,
  Users,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  Cloud,
  RefreshCw,
  CheckCircle,
  Clock,
  Folder,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import InlineLoader, { ButtonLoader } from '../../components/shared/InlineLoader'
import { adminApi } from '../../lib/api/providers'
import { ConfirmModal } from '../../components/shared/ConfirmModal'

type MediaType = 'ALL' | 'IMAGE' | 'DOCUMENT'
type ViewMode = 'grid' | 'list'

export default function CloudStoragePage() {
  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [filterFolder, setFilterFolder] = useState('all')
  const [filterType, setFilterType] = useState<MediaType>('ALL')
  const [confirmDelete, setConfirmDelete] = useState<any>(null)
  const [triggeringBackup, setTriggeringBackup] = useState(false)

  const queryClient = useQueryClient()

  // Backup status
  const {
    data: backupStatusRes,
    isLoading: isBackupLoading,
    refetch: refetchBackupStatus,
  } = useQuery({
    queryKey: ['admin-cloud-backup-status'],
    queryFn: adminApi.getCloudBackupStatus,
    refetchInterval: 30_000,
  })

  const backupData = backupStatusRes?.data

  // Media files
  const {
    data: mediaRes,
    isLoading,
    isError,
    refetch: refetchMedia,
  } = useQuery({
    queryKey: ['admin-media'],
    queryFn: adminApi.getMedia,
  })

  const media = mediaRes?.data || []

  // Manual backup
  const handleTriggerManualBackup = async () => {
    setTriggeringBackup(true)

    const toastId = toast.loading('Creating database backup...')

    try {
      const res: any = await adminApi.triggerCloudBackup()

      toast.success(
        res?.message || 'Backup completed successfully.',
        { id: toastId }
      )

      await refetchBackupStatus()
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || 'Backup failed.',
        { id: toastId }
      )
    } finally {
      setTriggeringBackup(false)
    }
  }

  // Delete file
  const deleteMutation = useMutation({
    mutationFn: (path: string) => adminApi.deleteMedia(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
      toast.success('File deleted successfully.')
      setConfirmDelete(null)
    },
    onError: () => {
      toast.error('Failed to delete file.')
    },
  })

  // Helpers
  const formatSize = (bytes = 0) => {
    if (!bytes) return '0 B'

    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    )

    return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 2)} ${units[index]}`
  }

  const formatDate = (date?: string) => {
    if (!date) return 'Not available'

    const parsed = new Date(date)

    return Number.isNaN(parsed.getTime())
      ? 'Not available'
      : parsed.toLocaleString()
  }

  const totalSize = media.reduce(
    (total: number, file: any) => total + (file.size || 0),
    0
  )

  const folders = useMemo(() => {
    return [
      'all',
      ...Array.from(
        new Set(
          media
            .map((file: any) => file.folder)
            .filter(Boolean)
        )
      ),
    ] as string[]
  }, [media])

  const filteredMedia = useMemo(() => {
    const term = search.trim().toLowerCase()

    return media.filter((file: any) => {
      const matchesSearch =
        !term ||
        file.name?.toLowerCase().includes(term) ||
        file.path?.toLowerCase().includes(term)

      const matchesFolder =
        filterFolder === 'all' || file.folder === filterFolder

      const matchesType =
        filterType === 'ALL' || file.type === filterType

      return matchesSearch && matchesFolder && matchesType
    })
  }, [media, search, filterFolder, filterType])

  const imageCount = media.filter(
    (file: any) => file.type === 'IMAGE'
  ).length

  const documentCount = media.filter(
    (file: any) => file.type === 'DOCUMENT'
  ).length

  const clearFilters = () => {
    setSearch('')
    setFilterFolder('all')
    setFilterType('ALL')
  }

  const hasActiveFilters =
    search !== '' || filterFolder !== 'all' || filterType !== 'ALL'

  const BackupTarget = ({
    name,
    icon: Icon,
    connected,
    error,
    description,
    accent = false,
  }: {
    name: string
    icon: any
    connected?: boolean
    error?: string
    description: string
    accent?: boolean
  }) => (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            accent
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-white text-gray-600 border border-gray-100'
          }`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800">{name}</p>
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          {error && !connected && (
            <p className="mt-1 text-xs text-amber-700 break-words">
              {error}
            </p>
          )}
        </div>
      </div>

      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${
          connected
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-amber-50 text-amber-700'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            connected ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
        {connected ? 'Connected' : 'Unavailable'}
      </span>
    </div>
  )

  const FileIcon = ({ file }: { file: any }) => (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        file.type === 'IMAGE'
          ? 'bg-emerald-50 text-emerald-600'
          : file.folder === 'certs'
            ? 'bg-blue-50 text-blue-600'
            : 'bg-gray-100 text-gray-500'
      }`}
    >
      {file.type === 'IMAGE' ? (
        <ImageIcon size={19} />
      ) : (
        <FileText size={19} />
      )}
    </div>
  )

  const FileActions = ({ file }: { file: any }) => (
    <div className="flex items-center gap-1">
      <a
        href={file.url}
        target="_blank"
        rel="noreferrer"
        title="Open file"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-700"
      >
        <ExternalLink size={16} />
      </a>

      <button
        type="button"
        onClick={() => setConfirmDelete(file)}
        title="Delete file"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6 pb-12 pt-2">

      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-emerald-700">
            <HardDrive size={14} />
            Storage management
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Cloud Storage
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage uploaded files and monitor your database backups.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            refetchMedia()
            refetchBackupStatus()
          }}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:self-auto"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Storage summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Database size={16} />
            <span className="text-xs font-medium">Total files</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {media.length}
          </p>
          <p className="mt-1 text-xs text-gray-400">Stored objects</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <HardDrive size={16} />
            <span className="text-xs font-medium">Storage used</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900">
            {formatSize(totalSize)}
          </p>
          <p className="mt-1 text-xs text-gray-400">Combined file size</p>
        </div>

        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-4 sm:col-span-1">
          <div className="flex items-center gap-2 text-gray-500">
            <ImageIcon size={16} />
            <span className="text-xs font-medium">File breakdown</span>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div>
              <p className="text-xl font-semibold text-gray-900">{imageCount}</p>
              <p className="text-xs text-gray-400">Images</p>
            </div>
            <div className="h-8 w-px bg-gray-100" />
            <div>
              <p className="text-xl font-semibold text-gray-900">{documentCount}</p>
              <p className="text-xs text-gray-400">Documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup management */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Database size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Database backups
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Automatic backup every 6 hours
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => refetchBackupStatus()}
              disabled={isBackupLoading}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={isBackupLoading ? 'animate-spin' : ''}
              />
              Refresh status
            </button>

            <button
              type="button"
              onClick={handleTriggerManualBackup}
              disabled={triggeringBackup}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {triggeringBackup ? (
                <ButtonLoader size={13} />
              ) : (
                <Cloud size={14} />
              )}
              {triggeringBackup ? 'Creating backup...' : 'Run backup'}
            </button>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          <BackupTarget
            name="MinIO storage"
            icon={HardDrive}
            connected={backupData?.minio?.connected}
            error={backupData?.minio?.error}
            description={`${backupData?.minio?.files?.length || 0} stored snapshots`}
          />

          <BackupTarget
            name="Cloudflare R2"
            icon={Cloud}
            connected={backupData?.cloudflareR2?.connected}
            error={backupData?.cloudflareR2?.error}
            description={`${backupData?.cloudflareR2?.files?.length || 0} offsite snapshots`}
            accent
          />
        </div>

        <div className="flex flex-col gap-1 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p>
            Last backup:{' '}
            <span className="font-medium text-gray-700">
              {backupData?.lastBackupTime
                ? formatDate(backupData.lastBackupTime)
                : 'No backup recorded'}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <Clock size={13} />
            Status refreshes every 30 seconds
          </p>
        </div>
      </section>

      {/* File manager */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        {/* File manager heading */}
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Stored files
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {filteredMedia.length} of {media.length} files
            </p>
          </div>

          <div className="flex items-center gap-1 self-start rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-label="Grid view"
              className={`flex h-8 w-9 items-center justify-center rounded-md transition ${
                view === 'grid'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <LayoutGrid size={16} />
            </button>

            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="List view"
              className={`flex h-8 w-9 items-center justify-center rounded-md transition ${
                view === 'list'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 border-b border-gray-100 bg-gray-50/50 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_200px_auto]">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files or file paths..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            <div className="relative">
              <Folder
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={filterFolder}
                onChange={(e) => setFilterFolder(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-emerald-400"
              >
                {folders.map((folder) => (
                  <option key={folder} value={folder}>
                    {folder === 'all' ? 'All folders' : folder}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {([
              { value: 'ALL', label: 'All files', count: media.length },
              { value: 'IMAGE', label: 'Images', count: imageCount },
              { value: 'DOCUMENT', label: 'Documents', count: documentCount },
            ] as const).map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFilterType(type.value)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  filterType === type.value
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type.label}
                <span
                  className={`text-[10px] ${
                    filterType === type.value
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`}
                >
                  {type.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* File content */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
              <InlineLoader size={36} message="Loading files..." />
              <p className="text-xs text-gray-400">
                Retrieving stored files
              </p>
            </div>
          ) : isError ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <AlertCircle size={30} className="mb-3 text-red-400" />
              <h3 className="text-sm font-semibold text-gray-800">
                Unable to load files
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Something went wrong while retrieving storage objects.
              </p>
              <button
                type="button"
                onClick={() => refetchMedia()}
                className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Try again
              </button>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Folder size={22} />
              </div>

              <h3 className="text-sm font-semibold text-gray-800">
                {hasActiveFilters ? 'No matching files' : 'No files yet'}
              </h3>

              <p className="mt-1 max-w-xs text-xs leading-5 text-gray-500">
                {hasActiveFilters
                  ? 'Try changing your search or filters to find what you need.'
                  : 'Files uploaded to your Hlynk storage will appear here.'}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMedia.map((file: any) => (
                <div
                  key={file.path}
                  className="group min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-emerald-200 hover:shadow-sm"
                >
                  {/* Preview */}
                  <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gray-50">
                    {file.type === 'IMAGE' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileIcon file={file} />
                        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          {file.name?.split('.').pop()} file
                        </span>
                      </div>
                    )}

                    <div className="absolute right-3 top-3 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <FileActions file={file} />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 p-3.5">
                    <div className="min-w-0">
                      <p
                        className="truncate text-sm font-medium text-gray-800"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p
                        className="mt-1 truncate text-xs text-gray-400"
                        title={file.path}
                      >
                        {file.path}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex min-w-0 items-center gap-1.5 text-xs text-gray-500">
                        <Users size={13} className="shrink-0" />
                        <span className="truncate">
                          {file.ownerName || 'Platform'}
                        </span>
                      </div>

                      <span className="shrink-0 text-xs font-medium text-gray-700">
                        {formatSize(file.size)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-3 py-3 text-xs font-medium text-gray-500">
                      File
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-gray-500">
                      Folder
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-gray-500">
                      Type
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-gray-500">
                      Owner
                    </th>
                    <th className="px-3 py-3 text-xs font-medium text-gray-500">
                      Size
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredMedia.map((file: any) => (
                    <tr
                      key={file.path}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="max-w-[280px] px-3 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <FileIcon file={file} />
                          <div className="min-w-0">
                            <p
                              className="truncate text-sm font-medium text-gray-800"
                              title={file.name}
                            >
                              {file.name}
                            </p>
                            <p
                              className="mt-0.5 truncate text-xs text-gray-400"
                              title={file.path}
                            >
                              {file.path}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-xs text-gray-600">
                        {file.folder || '—'}
                      </td>

                      <td className="px-3 py-3">
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                          {file.type}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-xs text-gray-600">
                        {file.ownerName || 'Platform'}
                      </td>

                      <td className="px-3 py-3 text-xs font-medium text-gray-700">
                        {formatSize(file.size)}
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex justify-end">
                          <FileActions file={file} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !isError && media.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-gray-100 bg-gray-50/50 px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span>
              Showing {filteredMedia.length} of {media.length} files
            </span>
            <span>
              Total storage: {formatSize(totalSize)}
            </span>
          </div>
        )}
      </section>

      {/* Storage information */}
      <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <ShieldCheck size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">
            Storage management
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Manage your uploaded media and monitor the status of your configured
            backup destinations from this page. Deleting a file permanently
            removes the stored object and may affect links that reference it.
          </p>
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() =>
          confirmDelete && deleteMutation.mutate(confirmDelete.path)
        }
        title="Delete file?"
        message={`Are you sure you want to permanently delete "${confirmDelete?.name}"? Any links referencing this file may stop working.`}
        confirmText="Delete file"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
