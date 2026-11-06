import { useState, useEffect } from "react";
import { Plus, Search, Eye, Trash2, Loader2 } from "lucide-react";
import { SlideOver } from "../../components/shared/SlideOver";
import { ConfirmModal } from "../../components/shared/ConfirmModal";
import { toast } from "sonner";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { adminApi } from "../../lib/api/providers";
import InlineLoader from "../../components/shared/InlineLoader";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { validateKenyanPhone } from "../../lib/validation/phone";

const CATEGORIES = [
  "Accounting & Tax Services",
  "Agrovet",
  "Agricultural Cooperative",
  "Art & Craft Business",
  "Bakery",
  "Barber Shop",
  "Cafe",
  "Car Wash",
  "Car Yard",
  "Catering Services",
  "Church",
  "Clinic",
  "College",
  "Community Organization",
  "Construction Services",
  "Consultancy",
  "Cosmetics Shop",
  "Courier Services",
  "Cyber Cafe",
  "Cyber Security",
  "Dairy Business",
  "Daycare",
  "Dental Clinic",
  "Digital Agency",
  "Driving School",
  "E-commerce Business",
  "Electrical Services",
  "Electronics Shop",
  "Farm",
  "Fashion & Boutique",
  "Fast Food",
  "Financial Services",
  "Freelancer",
  "Furniture Workshop",
  "Garage",
  "Guest House",
  "Hardware Store",
  "Hospital",
  "Hotel",
  "Insurance Agency",
  "Interior Design",
  "Internet Service Provider",
  "IT Services",
  "Legal Services",
  "Lounge & Bar",
  "Manufacturing",
  "Marketing Agency",
  "Mechanic Garage",
  "Microfinance",
  "Mini Mart",
  "Mobile Phone Shop",
  "Mosque",
  "NGO",
  "Online Business",
  "Optical Clinic",
  "Other",
  "Pharmacy",
  "Plumbing Services",
  "Poultry Farm",
  "Printing & Branding",
  "Real Estate Agency",
  "Restaurant",
  "Retail Store",
  "SACCO",
  "Salon",
  "School",
  "Software Development",
  "Spa & Beauty",
];

const planLabel = (plan?: string) =>
  plan === "MAX"
    ? "Business Pro"
    : plan === "PLUS"
      ? "Growth"
      : plan === "LITE"
        ? "Starter"
        : "Trial";

const kes = (n: any) => Number(n || 0).toLocaleString();

const inputCls =
  "w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#0D4A3E]";

export default function ProvidersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [providerToDelete, setProviderToDelete] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [planName, setPlanName] = useState("");
  const queryClient = useQueryClient();

  const { data: statsData } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
  });

  // Fetch all providers without pagination limits
  const { data: tenantsRes, isLoading } = useQuery<any>({
    queryKey: ["admin-tenants", search, status, planName],
    queryFn: () =>
      adminApi.getTenants({ search, status, planName, all: true, limit: 1000 }),
    placeholderData: keepPreviousData,
  });

  const stats = statsData?.data || statsData;
  const providers = tenantsRes?.data?.tenants || [];
  const weeklyGrowth: any[] = stats?.trends?.weeklyGrowth || [];
  const totalRegistrations = weeklyGrowth.reduce(
    (sum, w) => sum + Number(w?.value || 0),
    0,
  );
  const latest = stats?.recentRegistrations?.[0];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Business and all associated data permanently deleted");
      setProviderToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete business");
    },
  });

  const filtered = !!(search || status || planName);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {stats?.overview?.totalProviders || 0} businesses on the platform
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900">
            Businesses
          </h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded bg-[#0D4A3E] px-4 text-sm font-medium text-white transition-colors hover:bg-[#0A3D33]"
        >
          <Plus size={16} /> Add business
        </button>
      </header>

      {/* Growth + figures */}
      <section className="grid grid-cols-3 overflow-hidden rounded-md border border-slate-200 bg-white xl:grid-cols-12">
        {/* Registration growth */}
        <div className="col-span-3 bg-[#0D4A3E] p-6 text-white sm:p-8 xl:col-span-8">
          <p className="text-sm text-emerald-100/70">
            New registrations, last 8 weeks
          </p>

          <p className="mt-2 font-serif text-4xl tabular-nums tracking-tight sm:text-5xl">
            {totalRegistrations.toLocaleString()}
          </p>

          <div className="mt-8 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={weeklyGrowth}
                margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6EE7B7" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6EE7B7" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.08)"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "rgba(209,250,229,0.55)" }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "rgba(209,250,229,0.55)" }}
                  width={44}
                />

                <Tooltip
                  cursor={{
                    stroke: "rgba(255,255,255,0.25)",
                    strokeWidth: 1,
                  }}
                  content={({ active, payload, label }: any) =>
                    active && payload?.length ? (
                      <div className="rounded bg-white px-3 py-2 text-xs shadow-lg">
                        <p className="text-slate-500">{label}</p>
                        <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
                          {payload[0].value} new
                        </p>
                      </div>
                    ) : null
                  }
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6EE7B7"
                  strokeWidth={1.75}
                  fill="url(#growthFill)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#0D4A3E",
                    stroke: "#6EE7B7",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key figures */}
        <dl className="col-span-3 grid grid-cols-3 divide-x divide-slate-200 xl:col-span-4 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">
          <div className="min-w-0 p-3 sm:p-6 xl:p-8">
            <dt className="text-xs text-slate-500 sm:text-sm">
              Total businesses
            </dt>
            <dd className="mt-2 break-words font-serif text-2xl tabular-nums tracking-tight text-slate-900 sm:text-3xl">
              {stats?.overview?.totalProviders || 0}
            </dd>
          </div>

          <div className="min-w-0 p-3 sm:p-6 xl:p-8">
            <dt className="text-xs text-slate-500 sm:text-sm">Active today</dt>
            <dd className="mt-2 break-words font-serif text-2xl tabular-nums tracking-tight text-slate-900 sm:text-3xl">
              {stats?.overview?.activeToday || 0}
            </dd>
          </div>

          <div className="min-w-0 p-3 sm:p-6 xl:p-8">
            <dt className="text-xs text-slate-500 sm:text-sm">
              Latest registration
            </dt>
            <dd className="mt-2 break-words text-sm font-medium text-slate-900 sm:text-lg">
              {latest?.name || "None yet"}
            </dd>
            {latest && (
              <p className="mt-1 text-xs text-slate-500">
                {planLabel(latest.plan)} plan
              </p>
            )}
          </div>
        </dl>
      </section>

      {/* Registry */}
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            All businesses
          </h2>
          <div className="flex flex-wrap gap-2">
            <label className="relative block w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search name, slug or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0D4A3E]"
              />
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0D4A3E]"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Suspended</option>
            </select>
            <select
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0D4A3E]"
            >
              <option value="">All plans</option>
              <option value="LITE">Starter</option>
              <option value="PLUS">Growth</option>
              <option value="MAX">Business Pro</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="px-6 py-3 font-medium">Business</th>
                <th className="px-6 py-3 font-medium">Plan</th>
                <th className="px-6 py-3 text-right font-medium">Services</th>
                <th className="px-6 py-3 text-right font-medium">Users</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <InlineLoader message="Loading businesses..." />
                  </td>
                </tr>
              ) : providers.length > 0 ? (
                providers.map((p: any, i: number) => {
                  const active = !!p.isActive;
                  return (
                    <tr
                      key={p.id ?? i}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-sm font-semibold text-slate-600">
                            {p.businessName?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {p.businessName}
                            </p>
                            <p className="text-xs text-slate-400 hl-mono">
                              /{p.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-700">
                        {planLabel(p.planName)}
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm tabular-nums text-slate-700">
                        {p.servicesCount || 0}
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm tabular-nums text-slate-700">
                        {p.usersCount || 0}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-2 text-sm ${
                            active ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`}
                          />
                          {active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedProvider(p)}
                            title="View details"
                            className="rounded p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setProviderToDelete(p)}
                            title="Delete business"
                            className="rounded p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-sm text-slate-400"
                  >
                    No businesses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs text-slate-500">
          <span>
            {providers.length}{" "}
            {providers.length === 1 ? "business" : "businesses"}
          </span>
          {filtered && (
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setPlanName("");
              }}
              className="font-medium text-[#0D4A3E] hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </section>

      <ConfirmModal
        isOpen={!!providerToDelete}
        onClose={() => setProviderToDelete(null)}
        onConfirm={() =>
          providerToDelete && deleteMutation.mutate(providerToDelete.id)
        }
        title={`Delete "${providerToDelete?.businessName}" Permanently?`}
        message="This will completely and permanently erase this business from the entire platform, including all associated accounts, users, sales, products, and subscriptions. This action cannot be undone."
        confirmText="Delete Business Completely"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />

      <SlideOver
        isOpen={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
        title="Business Details"
      >
        {selectedProvider && (
          <ProviderDetailsPanel
            provider={selectedProvider}
            onClose={() => setSelectedProvider(null)}
          />
        )}
      </SlideOver>

      <SlideOver
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Business"
      >
        <AddBusinessForm onClose={() => setIsAddModalOpen(false)} />
      </SlideOver>
    </div>
  );
}

function ProviderDetailsPanel({
  provider,
  onClose,
}: {
  provider: any;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    businessName: provider.businessName,
    slug: provider.slug || "",
    appliedReferralCode: provider.appliedReferralCode || "",
  });

  useEffect(() => {
    setForm({
      businessName: provider.businessName,
      slug: provider.slug || "",
      appliedReferralCode: provider.appliedReferralCode || "",
    });
  }, [provider]);

  const { data: valRes, isLoading: isLoadingVal } = useQuery({
    queryKey: ["provider-financial-value", provider?.id],
    queryFn: () => adminApi.getTenantValue(provider.id),
    enabled: !!provider?.id,
  });
  const financials = valRes?.data;

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteTenant(provider.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Account permanently deleted");
      onClose();
    },
    onError: () => toast.error("Failed to delete account"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: () =>
      provider.isActive
        ? adminApi.suspendTenant(provider.id)
        : adminApi.activateTenant(provider.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      toast.success(
        provider.isActive ? "Provider suspended" : "Provider activated",
      );
      onClose();
    },
    onError: () => toast.error("Failed to update status"),
  });

  const impersonateMutation = useMutation({
    mutationFn: () => adminApi.impersonateUser(provider.primaryUserId),
    onSuccess: (res: any) => {
      // Use storage util + correct keys so AuthContext picks up the session on next load
      import("../../lib/utils/storage").then(({ storage }) => {
        storage.setItem("accessToken", res.data.accessToken);
        if (res.data.refreshToken)
          storage.setItem("refreshToken", res.data.refreshToken);
        storage.setItem("user_profile", JSON.stringify(res.data.user));
        toast.success(`Logged in as ${provider.businessName}`);
        window.location.href = "/provider/dashboard";
      });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to impersonate user"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateTenant(provider.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      toast.success("Business details updated");
      setIsEditing(false);
      onClose();
    },
    onError: (err: any) =>
      toast.error(
        err.response?.data?.message || "Failed to update business details",
      ),
  });

  if (isEditing) {
    return (
      <div className="space-y-5">
        <InputGroup
          label="Business name"
          value={form.businessName}
          onChange={(v: string) => setForm({ ...form, businessName: v })}
        />
        <InputGroup
          label="URL slug"
          value={form.slug}
          onChange={(v: string) => setForm({ ...form, slug: v })}
          mono
        />
        <InputGroup
          label="Referred by (referral code)"
          placeholder="Leave blank if none"
          value={form.appliedReferralCode}
          onChange={(v: string) => setForm({ ...form, appliedReferralCode: v })}
          mono
        />

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 rounded border border-slate-300 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => updateMutation.mutate(form)}
            disabled={updateMutation.isPending}
            className="flex-1 rounded bg-[#0D4A3E] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0A3D33] disabled:opacity-60"
          >
            {updateMutation.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    );
  }

  const net = Number(financials?.netProfit || 0);

  return (
    <div className="space-y-8">
      {/* Identity */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded bg-[#0D4A3E] text-lg font-semibold text-white">
            {provider.businessName?.charAt(0)?.toUpperCase() || "?"}
          </span>
          <div>
            <h3 className="font-serif text-xl text-slate-900">
              {provider.businessName}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Joined {new Date(provider.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm font-medium text-[#0D4A3E] hover:underline"
        >
          Edit
        </button>
      </div>

      {/* Usage */}
      <dl className="grid grid-cols-2 divide-x divide-slate-200 rounded-md border border-slate-200">
        <div className="p-4">
          <dt className="text-xs text-slate-500">Users</dt>
          <dd className="mt-1 font-serif text-2xl tabular-nums text-slate-900">
            {provider._count?.users || 0}
          </dd>
        </div>
        <div className="p-4">
          <dt className="text-xs text-slate-500">Services</dt>
          <dd className="mt-1 font-serif text-2xl tabular-nums text-slate-900">
            {provider._count?.services || 0}
          </dd>
        </div>
      </dl>

      {/* Financials */}
      <section>
        <h4 className="text-sm font-semibold text-slate-900">Financials</h4>
        {isLoadingVal ? (
          <div className="flex items-center gap-2 py-6 text-xs text-slate-400">
            <Loader2 size={14} className="animate-spin" /> Calculating…
          </div>
        ) : financials ? (
          <dl className="mt-3 divide-y divide-slate-100 border-y border-slate-200">
            <FinRow
              label="Stock value"
              value={`KES ${kes(financials.stockValue?.costValue)}`}
              note={`${financials.stockValue?.totalItems || 0} items · ${financials.stockValue?.totalUnits || 0} units`}
            />
            <FinRow
              label="Gross profit"
              value={`KES ${kes(financials.profit?.allTimeGrossProfit)}`}
              note={`Revenue KES ${kes(financials.profit?.totalRevenue)}`}
            />
            <FinRow
              label="Expenses"
              value={`KES ${kes(financials.loss?.totalExpenses)}`}
              note={`${financials.loss?.expenseCount || 0} records`}
            />
            <div className="flex items-center justify-between py-4">
              <dt className="text-sm font-medium text-slate-900">Net result</dt>
              <dd
                className={`text-base font-semibold tabular-nums ${
                  net >= 0 ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {net >= 0 ? "+" : "−"}KES {Math.abs(net).toLocaleString()}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-slate-400">
            No financial data available.
          </p>
        )}
      </section>

      {/* Actions */}
      <section className="space-y-3">
        {provider.primaryUserId && (
          <button
            onClick={() => impersonateMutation.mutate()}
            disabled={impersonateMutation.isPending}
            className="w-full rounded bg-[#0D4A3E] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0A3D33] disabled:opacity-60"
          >
            {impersonateMutation.isPending
              ? "Logging in…"
              : `Log in as ${provider.businessName}`}
          </button>
        )}
        <button
          onClick={() => toggleStatusMutation.mutate()}
          disabled={toggleStatusMutation.isPending}
          className={`w-full rounded border py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${
            provider.isActive
              ? "border-red-200 text-red-600 hover:bg-red-50"
              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          {provider.isActive ? "Suspend business" : "Activate business"}
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          disabled={deleteMutation.isPending}
          className="w-full py-2 text-xs font-medium text-slate-400 transition-colors hover:text-red-600"
        >
          {deleteMutation.isPending ? "Deleting…" : "Delete permanently"}
        </button>
      </section>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Business Permanently"
        message="Are you sure you want to permanently delete this business and all its data? This action is irreversible and will destroy all records, subscriptions, and associated identities."
        confirmText="Delete Business"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function AddBusinessForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    category: "Other",
    planName: "LITE",
  });

  const mutation = useMutation({
    mutationFn: adminApi.createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      toast.success("Business registered successfully");
      onClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to register business"),
  });

  const submit = () => {
    if (!form.businessName.trim() || form.businessName.trim().length < 2) {
      return toast.error("Business name is required (at least 2 characters)");
    }
    if (!form.ownerName.trim()) {
      return toast.error("Owner full name is required");
    }
    const phoneCheck = validateKenyanPhone(form.phone);
    if (!phoneCheck.isValid) {
      return toast.error(
        phoneCheck.error ||
          "A valid 10-digit Kenyan phone number (07xx or 01xx) is required",
      );
    }
    mutation.mutate({ ...form, phone: phoneCheck.normalized });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <InputGroup
          label="Business name"
          placeholder="e.g. Quick Mart"
          value={form.businessName}
          onChange={(v: string) => setForm({ ...form, businessName: v })}
        />
        <InputGroup
          label="Owner full name"
          placeholder="e.g. John Doe"
          value={form.ownerName}
          onChange={(v: string) => setForm({ ...form, ownerName: v })}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <InputGroup
          label="Phone number"
          placeholder="07…"
          mono
          value={form.phone}
          onChange={(v: string) => setForm({ ...form, phone: v })}
        />
        <InputGroup
          label="Email"
          placeholder="owner@business.com"
          value={form.email}
          onChange={(v: string) => setForm({ ...form, email: v })}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "Other" ? "Other / General" : c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Plan</label>
          <select
            value={form.planName}
            onChange={(e) => setForm({ ...form, planName: e.target.value })}
            className={inputCls}
          >
            <option value="LITE">Starter (7-day trial)</option>
            <option value="PLUS">Growth (subscription)</option>
            <option value="MAX">Business Pro (subscription)</option>
          </select>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={mutation.isPending}
        className="mt-2 w-full rounded bg-[#0D4A3E] py-3 text-sm font-medium text-white transition-colors hover:bg-[#0A3D33] disabled:opacity-60"
      >
        {mutation.isPending ? "Registering…" : "Register business"}
      </button>
    </div>
  );
}

function FinRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <dt className="text-sm text-slate-700">{label}</dt>
        <p className="mt-0.5 text-xs text-slate-400">{note}</p>
      </div>
      <dd className="text-sm font-medium tabular-nums text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function InputGroup({
  label,
  placeholder,
  mono = false,
  value,
  onChange,
}: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} ${mono ? "hl-mono" : ""}`}
      />
    </div>
  );
}
