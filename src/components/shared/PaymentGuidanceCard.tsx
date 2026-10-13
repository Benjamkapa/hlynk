import { useState, useRef } from "react";
import {
  Wallet,
  Copy,
  Check,
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export interface DirectPaymentConfig {
  enabled?: boolean;
  methodType?: "MPESA_PAYBILL" | "MPESA_TILL" | "MPESA_POCHI" | "BANK_TRANSFER" | "CUSTOM";
  businessNumber?: string;
  accountNumber?: string;
  accountName?: string;
  headerLabel?: string;
  instructions?: string;
  footerNote?: string;
}

export interface PaymentEvidence {
  transactionCode: string;
  receiptUrl?: string;
  methodType?: string;
  senderPhone?: string;
  paidAmount?: number;
  note?: string;
}

interface PaymentGuidanceCardProps {
  directPayment?: DirectPaymentConfig;
  amount: number;
  orderReference?: string;
  customerName?: string;
  businessName?: string;
  isInteractive?: boolean;
  evidence?: PaymentEvidence;
  onEvidenceChange?: (evidence: PaymentEvidence) => void;
  onUploadReceipt?: (file: File) => Promise<string | null>;
  uploadingReceipt?: boolean;
  compact?: boolean;
}

export default function PaymentGuidanceCard({
  directPayment,
  amount,
  orderReference,
  customerName,
  businessName,
  isInteractive = false,
  evidence,
  onEvidenceChange,
  onUploadReceipt,
  uploadingReceipt = false,
  compact = false,
}: PaymentGuidanceCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [localTxCode, setLocalTxCode] = useState(evidence?.transactionCode || "");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(evidence?.receiptUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const methodType = directPayment?.methodType || "MPESA_PAYBILL";
  const businessNumber = directPayment?.businessNumber || "";

  // ONLY use the provider-configured account number — never fall back to orderReference
  const configuredAccountNumber = directPayment?.accountNumber?.trim() || "";
  const accountNumber = configuredAccountNumber;

  // Header: show configured accountNumber if set, otherwise businessNumber for TILL/POCHI
  const headerCode = directPayment?.headerLabel || (
    methodType === "MPESA_TILL"
      ? `TILL: ${businessNumber}`
      : methodType === "MPESA_POCHI"
      ? `POCHI: ${businessNumber}`
      : methodType === "BANK_TRANSFER"
      ? `ACC: ${configuredAccountNumber || businessNumber}`
      : configuredAccountNumber // MPESA_PAYBILL: show accountNumber directly, no prefix
  );

  const accountName = directPayment?.accountName || businessName || "";
  const formattedAmount = Number(amount || 0).toLocaleString();

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      toast.success(`Copied: ${text}`);
      setTimeout(() => setCopiedKey(null), 2000);
    }).catch(() => {
      toast.error("Failed to copy");
    });
  };

  const handleTxCodeChange = (val: string) => {
    const formatted = val.toUpperCase().trim();
    setLocalTxCode(formatted);
    if (onEvidenceChange) {
      onEvidenceChange({
        ...evidence,
        transactionCode: formatted,
        methodType,
        paidAmount: amount,
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setReceiptPreview(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (onUploadReceipt) {
      try {
        const uploadedUrl = await onUploadReceipt(file);
        if (uploadedUrl && onEvidenceChange) {
          setReceiptPreview(uploadedUrl);
          onEvidenceChange({
            ...evidence,
            transactionCode: localTxCode,
            receiptUrl: uploadedUrl,
            methodType,
            paidAmount: amount,
          });
        }
      } catch (err) {
        toast.error("Failed to upload receipt screenshot");
      }
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onEvidenceChange) {
      onEvidenceChange({
        ...evidence,
        transactionCode: localTxCode,
        receiptUrl: undefined,
        methodType,
        paidAmount: amount,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* ── PAYMENT GUIDANCE CARD ── */}
      <div className="relative rounded-[24px] border border-slate-200/90 bg-white p-5 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden transition-all duration-300">
        {/* Header: wallet badge left, account ref + due amount right */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-[#394073] text-white shadow-md shadow-[#394073]/20">
            <Wallet size={26} strokeWidth={2.2} />
          </div>

          <div className="text-right">
            <div className="font-mono text-sm sm:text-base font-bold tracking-tight text-slate-800">
              {/* {headerCode || <span className="text-slate-400 font-normal text-xs">No account set</span>}{" "} */}
              <span className="text-slate-500 font-normal">
                [ DUE: <span className="font-semibold text-slate-900">KES {formattedAmount}</span> ]
              </span>
            </div>
            {/* {accountName && (
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                {accountName}
              </p>
            )} */}
          </div>
        </div>

        {/* Step-by-step guidance */}
        <div className="pt-5 pb-3">
          <ol className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 font-normal leading-relaxed">
            {methodType === "MPESA_PAYBILL" && (
              <>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">1.</span>
                  <span>Go to <strong className="font-bold text-slate-900">M-PESA Menu</strong> on your phone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">2.</span>
                  <span>Select <strong className="font-bold text-slate-900">Pay Bill</strong></span>
                </li>
                <li className="flex items-center justify-between gap-2 bg-slate-50/70 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-400 select-none">3.</span>
                    <span>Enter Business Number: <strong className="font-mono font-bold text-slate-950 text-sm">{businessNumber}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(businessNumber, "biz")}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95 transition"
                    title="Copy Business Number"
                  >
                    {copiedKey === "biz" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedKey === "biz" ? "Copied" : "Copy"}
                  </button>
                </li>
                <li className="flex items-center justify-between gap-2 bg-slate-50/70 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-400 select-none">4.</span>
                    <span>Enter Account Number: <strong className="font-mono font-bold text-slate-950 text-sm">{accountNumber}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(accountNumber, "acc")}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95 transition"
                    title="Copy Account Number"
                  >
                    {copiedKey === "acc" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedKey === "acc" ? "Copied" : "Copy"}
                  </button>
                </li>
                <li className="flex items-center justify-between gap-2 bg-slate-50/70 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-400 select-none">5.</span>
                    <span>Enter Amount: <strong className="font-mono font-bold text-slate-950 text-sm">{amount}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(amount), "amt")}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95 transition"
                    title="Copy Amount"
                  >
                    {copiedKey === "amt" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedKey === "amt" ? "Copied" : "Copy"}
                  </button>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">6.</span>
                  <span>Enter your <strong className="font-bold text-slate-900">M-PESA PIN</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">7.</span>
                  <span>Send and wait for SMS receipt.</span>
                </li>
              </>
            )}

            {methodType === "MPESA_TILL" && (
              <>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">1.</span>
                  <span>Go to <strong className="font-bold text-slate-900">M-PESA Menu</strong> on your phone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">2.</span>
                  <span>Select <strong className="font-bold text-slate-900">Lipa Na M-PESA</strong> &gt; <strong className="font-bold text-slate-900">Buy Goods and Services</strong></span>
                </li>
                <li className="flex items-center justify-between gap-2 bg-slate-50/70 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-400 select-none">3.</span>
                    <span>Enter Till Number: <strong className="font-mono font-bold text-slate-950 text-sm">{businessNumber}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(businessNumber, "till")}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95 transition"
                    title="Copy Till Number"
                  >
                    {copiedKey === "till" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedKey === "till" ? "Copied" : "Copy"}
                  </button>
                </li>
                <li className="flex items-center justify-between gap-2 bg-slate-50/70 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-400 select-none">4.</span>
                    <span>Enter Amount: <strong className="font-mono font-bold text-slate-950 text-sm">{amount}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(amount), "amt_till")}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95 transition"
                    title="Copy Amount"
                  >
                    {copiedKey === "amt_till" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedKey === "amt_till" ? "Copied" : "Copy"}
                  </button>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">5.</span>
                  <span>Enter your <strong className="font-bold text-slate-900">M-PESA PIN</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">6.</span>
                  <span>Send and wait for SMS receipt.</span>
                </li>
              </>
            )}

            {methodType === "MPESA_POCHI" && (
              <>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">1.</span>
                  <span>Go to <strong className="font-bold text-slate-900">M-PESA Menu</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">2.</span>
                  <span>Select <strong className="font-bold text-slate-900">Pochi La Biashara</strong> (or Send Money)</span>
                </li>
                <li className="flex items-center justify-between gap-2 bg-slate-50/70 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-400 select-none">3.</span>
                    <span>Enter Phone: <strong className="font-mono font-bold text-slate-950 text-sm">{businessNumber}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(businessNumber, "phone")}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95 transition"
                  >
                    {copiedKey === "phone" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedKey === "phone" ? "Copied" : "Copy"}
                  </button>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">4.</span>
                  <span>Enter Amount: <strong className="font-mono font-bold text-slate-950 text-sm">{amount}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">5.</span>
                  <span>Enter your <strong className="font-bold text-slate-900">M-PESA PIN</strong> and confirm</span>
                </li>
              </>
            )}

            {methodType === "BANK_TRANSFER" && (
              <>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">1.</span>
                  <span>Open your banking app or use M-PESA Paybill transfer</span>
                </li>
                <li className="flex items-center justify-between gap-2 bg-slate-50/70 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-400 select-none">2.</span>
                    <span>Bank / Paybill: <strong className="font-mono font-bold text-slate-950 text-sm">{businessNumber}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(businessNumber, "bank_paybill")}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95 transition"
                  >
                    {copiedKey === "bank_paybill" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedKey === "bank_paybill" ? "Copied" : "Copy"}
                  </button>
                </li>
                <li className="flex items-center justify-between gap-2 bg-slate-50/70 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-slate-400 select-none">3.</span>
                    <span>Account Number: <strong className="font-mono font-bold text-slate-950 text-sm">{accountNumber}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(accountNumber, "bank_acc")}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95 transition"
                  >
                    {copiedKey === "bank_acc" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedKey === "bank_acc" ? "Copied" : "Copy"}
                  </button>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">4.</span>
                  <span>Amount: <strong className="font-mono font-bold text-slate-950 text-sm">{amount}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-400 select-none">5.</span>
                  <span>Complete transaction and keep receipt reference.</span>
                </li>
              </>
            )}

            {methodType === "CUSTOM" && directPayment?.instructions && (
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-100 whitespace-pre-wrap text-slate-800 font-medium">
                {directPayment.instructions}
              </li>
            )}
          </ol>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="grid h-4 w-4 place-items-center rounded bg-emerald-600 text-white text-[10px] font-bold">
              ✔
            </span>
            <span className="font-medium text-slate-700">
              {directPayment?.footerNote || `${accountName} Verified Direct Settlement`}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Direct Merchant
          </span>
        </div>
      </div>

      {/* ── INTERACTIVE: Customer fills in evidence ── */}
      {isInteractive && (
        <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#394073]" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                Provide Evidence of Payment
              </h4>
            </div>
            <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              Required for collection
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-500">
            After paying via M-Pesa, enter your confirmation code or upload a screenshot of your SMS receipt below so your order can be fulfilled immediately.
          </p>

          {/* Transaction Code */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              M-Pesa Transaction Code / Ref *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={localTxCode}
                onChange={(e) => handleTxCodeChange(e.target.value)}
                placeholder="e.g. QK78ABC99X"
                maxLength={20}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 font-mono text-sm uppercase tracking-wider text-slate-950 outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#394073] focus:ring-1 focus:ring-[#394073]"
              />
              {localTxCode.length >= 8 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-bold">
                  ✓ Valid code
                </span>
              )}
            </div>
          </div>

          {/* Screenshot upload */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Attach Receipt Screenshot (Optional)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {receiptPreview ? (
              <div className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                <img
                  src={receiptPreview}
                  alt="Receipt Preview"
                  className="h-14 w-14 rounded-lg object-cover border border-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800">Receipt attached</p>
                  <p className="text-[10px] text-emerald-600 font-medium">
                    Evidence ready for merchant verification
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadingReceipt}
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/80 py-3 px-4 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-white transition active:scale-[0.99] disabled:opacity-50"
              >
                {uploadingReceipt ? (
                  <span className="text-slate-500">Uploading receipt...</span>
                ) : (
                  <span>Upload M-Pesa SMS receipt screenshot</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
