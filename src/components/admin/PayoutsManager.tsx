import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/providers";
import { toast } from "sonner";
import {
  Banknote,
  Clock,
  AlertCircle,
  Search,
  Star,
  Smartphone,
  Copy,
  Check,
  Phone,
  MessageCircle,
  Building2,
  User,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { formatDate } from "../../lib/utils/date";

// Normalise a Kenyan number to international digits only (e.g. 0712345678 -> 254712345678)
function toInternational(raw: string): string {
  let d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("254")) return d;
  if (d.startsWith("0")) return "254" + d.slice(1);
  if (d.length === 9) return "254" + d;
  return d;
}

function PhoneActions({
  phone,
  copied,
  onCopy,
}: {
  phone: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const intl = toInternational(phone);
  const btn =
    "h-7 w-7 rounded-lg flex items-center justify-center border transition-all active:scale-95 cursor-pointer shrink-0";

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span className="font-mono text-xs font-black text-slate-900 tracking-wide bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
        {phone}
      </span>
      <div className="flex items-center gap-1">
        <a
          href={`tel:+${intl}`}
          title="Direct Call"
          aria-label={`Call ${phone}`}
          className={`${btn} bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs`}
        >
          <Phone size={12} />
        </a>
        <a
          href={`https://wa.me/${intl}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Chat on WhatsApp"
          aria-label={`WhatsApp ${phone}`}
          className={`${btn} bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-xs`}
        >
          <MessageCircle size={12} />
        </a>
        <button
          type="button"
          onClick={onCopy}
          title="Copy phone number"
          aria-label="Copy number"
          className={`${btn} bg-white border-slate-200 text-slate-500 hover:bg-slate-100 shadow-xs`}
        >
          {copied ? (
            <Check size={12} className="text-emerald-600" />
          ) : (
            <Copy size={12} />
          )}
        </button>
      </div>
    </div>
  );
}

export default function PayoutsManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    toast.success("Number copied");
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const { data: payoutData, isLoading } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: () => adminApi.getPayouts(),
  });

  const markPaidMutation = useMutation({
    mutationFn: ({
      tenantId,
      payoutId,
      disburse,
    }: {
      tenantId: string;
      payoutId?: string;
      disburse?: boolean;
    }) => adminApi.markPayoutPaid(tenantId, { payoutId, disburse }),
    onSuccess: (res: any) => {
      toast.success(res.message || "Payout processed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["financial-stats"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to process payout");
    },
  });

  const payouts = payoutData?.data?.payouts || [];
  const accrued = payoutData?.data?.accrued || [];
  const summary = payoutData?.data?.summary || { totalDue: 0, totalAccrued: 0 };

  const filteredPayouts = payouts.filter((p: any) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return [
      p.businessName,
      p.recipientName,
      p.destinationPhone,
      p.referrerName,
      p.referrerPhone,
      p.referrerPayoutPhone,
      p.referrerBusinessName,
      p.referrerCode,
      p.subscriberBusinessName,
      p.subscriberContactName,
      p.subscriberPhone,
      p.message,
    ].some((v) => v && String(v).toLowerCase().includes(q));
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Ready for payout (Dues)
            </p>
            <h4 className="text-xl font-black text-slate-900 hl-mono">
              KES {Number(summary.totalDue || 0).toLocaleString()}
            </h4>
          </div>
          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Banknote size={18} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
              Accruing (Volume)
            </p>
            <h4 className="text-xl font-black text-blue-900 hl-mono">
              KES {Number(summary.totalAccrued || 0).toLocaleString()}
            </h4>
          </div>
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Payouts */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">Payouts due</h3>
            <p className="text-xs text-slate-400 font-medium">
              Disburse direct via M-Pesa B2C or clear manually after offline
              settlement
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search referrer name, phone, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredPayouts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-bold text-slate-300">
                No payouts match your search.
              </p>
            </div>
          ) : (
            filteredPayouts.map((p: any) => {
              const isReferral = p.type === "REFERRAL";

              // STRICT SEPARATION:
              // For referrals, destination phone MUST be the referrer's phone.
              // We NEVER fall back to subscriber's phone or account.
              const destinationPhone: string | undefined = isReferral
                ? p.referrerPayoutPhone ||
                  p.referrerPhone ||
                  p.destinationPhone ||
                  undefined
                : p.destinationPhone ||
                  p.payoutAccount ||
                  p.tenantPhone ||
                  undefined;

              // The person receiving this payout
              const recipientName = isReferral
                ? p.referrerName || p.referrerBusinessName || "Referrer"
                : p.businessName || "Vendor";

              const referrerBusiness = isReferral
                ? p.referrerBusinessName
                : null;
              const subscriberBusiness = isReferral
                ? p.subscriberBusinessName || p.businessName
                : null;
              const subscriberContact = isReferral
                ? p.subscriberContactName || null
                : null;
              const subscriberPhone = isReferral
                ? p.subscriberPhone || null
                : null;

              return (
                <div
                  key={p.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Left: Who gets paid + contact info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isReferral
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {isReferral ? <Star size={20} /> : <Banknote size={20} />}
                    </div>

                    <div className="min-w-0 space-y-2 flex-1">
                      {/* Name + Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="text-sm font-black text-slate-900 truncate">
                          {recipientName}
                        </h5>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isReferral
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isReferral
                            ? "Referral Commission"
                            : "Vendor Settlement"}
                        </span>
                        {isReferral && p.referrerCode && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Code: {p.referrerCode}
                          </span>
                        )}
                        {referrerBusiness &&
                          referrerBusiness !== recipientName && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                              <Building2 size={12} className="text-slate-400" />
                              {referrerBusiness}
                            </span>
                          )}
                      </div>

                      {/* Contact tools: Call, WhatsApp, Copy — specifically for the referrer */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Payout Phone:
                        </span>
                        {destinationPhone ? (
                          <PhoneActions
                            phone={destinationPhone}
                            copied={copiedPhone === destinationPhone}
                            onCopy={() => copyToClipboard(destinationPhone)}
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                            <AlertCircle size={12} /> No referrer phone recorded
                          </span>
                        )}
                      </div>

                      {/* Source context: Exactly who was referred */}
                      {/* {isReferral && subscriberBusiness && (
                        <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1 max-w-lg">
                          <p className="font-bold text-slate-700 flex flex-wrap items-center gap-1.5">
                            <span className="text-slate-400 font-medium">
                              Referred Client:
                            </span>
                            <span className="font-black text-slate-900">
                              {subscriberBusiness}
                            </span>
                            {subscriberContact && (
                              <span className="text-slate-500 font-semibold">
                                ({subscriberContact})
                              </span>
                            )}
                            {subscriberPhone && (
                              <span className="text-slate-400 font-mono text-[11px]">
                                · {subscriberPhone}
                              </span>
                            )}
                          </p>
                          {p.message && (
                            <p className="text-[11px] text-slate-500">
                              {p.message}
                            </p>
                          )}
                        </div>
                      )} */}

                      {!isReferral && p.message && (
                        <p className="text-[11px] text-slate-500 font-medium">
                          {p.message}
                        </p>
                      )}

                      <p className="text-[10px] font-semibold text-slate-400">
                        Logged on {formatDate(p.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount + actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-4 shrink-0 bg-slate-50/80 p-3 sm:px-5 rounded-xl border border-slate-100">
                    <div className="sm:text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                        Commission
                      </p>
                      <p className="text-xl font-black text-emerald-600 hl-mono">
                        KES {Number(p.amount).toLocaleString()}
                      </p>
                      {destinationPhone && (
                        <p className="text-[10px] font-mono text-slate-400">
                          To {destinationPhone}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={
                          markPaidMutation.isPending || !destinationPhone
                        }
                        onClick={() =>
                          markPaidMutation.mutate({
                            tenantId: p.tenantId,
                            payoutId: p.id,
                            disburse: true,
                          })
                        }
                        title={
                          destinationPhone
                            ? `Send KES ${Number(p.amount).toLocaleString()} via M-Pesa B2C to ${destinationPhone}`
                            : "No referrer phone number available"
                        }
                        className="px-4 py-2.5 bg-[#0D4A3E] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#0A3D33] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
                      >
                        {markPaidMutation.isPending ? (
                          "Sending..."
                        ) : (
                          <>
                            <Smartphone size={13} /> M-Pesa B2C
                          </>
                        )}
                      </button>
                      <button
                        disabled={markPaidMutation.isPending}
                        onClick={() =>
                          markPaidMutation.mutate({
                            tenantId: p.tenantId,
                            payoutId: p.id,
                            disburse: false,
                          })
                        }
                        title="Mark as settled manually (no M-Pesa B2C push)"
                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 active:scale-95 transition-all whitespace-nowrap cursor-pointer shadow-xs"
                      >
                        Mark paid
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Accrued */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">
            Accrued (Next weekly settlement)
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Unbatched volume accumulating from merchants using rented paybills
          </p>
        </div>

        {accrued.length === 0 ? (
          <div className="p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-300">
              Nothing accruing right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {accrued.map((a: any) => (
              <div
                key={a.tenantId}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate">
                    {a.businessName}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400">
                    {a.transactionCount} transactions
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-black text-slate-900 hl-mono">
                    KES {Math.floor(a.netSettlement).toLocaleString()}
                  </p>
                  <button
                    disabled={markPaidMutation.isPending}
                    onClick={() =>
                      markPaidMutation.mutate({
                        tenantId: a.tenantId,
                        disburse: false,
                      })
                    }
                    className="mt-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 underline underline-offset-2 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
