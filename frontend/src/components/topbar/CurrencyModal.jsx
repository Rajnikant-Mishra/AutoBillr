
// import { useEffect, useRef } from "react";

// const DEFAULT_CURRENCIES = [
//   {
//     code: "INR",
//     name: "Indian Rupee",
//     symbol: "₹",
//     flag: "🇮🇳",
//     rate: 1,
//   },
//   {
//     code: "USD",
//     name: "US Dollar",
//     symbol: "$",
//     flag: "🇺🇸",
//     rate: 0.011,
//   },
//   {
//     code: "EUR",
//     name: "Euro",
//     symbol: "€",
//     flag: "🇪🇺",
//     rate: 0.0099,
//   },
//   {
//     code: "GBP",
//     name: "British Pound",
//     symbol: "£",
//     flag: "🇬🇧",
//     rate: 0.0085,
//   },
//   {
//     code: "CAD",
//     name: "Canadian Dollar",
//     symbol: "C$",
//     flag: "🇨🇦",
//     rate: 0.0151,
//   },
//   {
//     code: "AUD",
//     name: "Australian Dollar",
//     symbol: "A$",
//     flag: "🇦🇺",
//     rate: 0.0169,
//   },
//   {
//     code: "JPY",
//     name: "Japanese Yen",
//     symbol: "¥",
//     flag: "🇯🇵",
//     rate: 1.84,
//   },
//   {
//     code: "SGD",
//     name: "Singapore Dollar",
//     symbol: "S$",
//     flag: "🇸🇬",
//     rate: 0.0158,
//   },
// ];

// export default function CurrencyModal({
//   isOpen,
//   currencies = DEFAULT_CURRENCIES,
//   selectedCurrencyCode = "INR",
//   onSelect,
//   onClose,
//   rates = {}, 
//   baseCurrencyCode = "INR",
//   rateUpdatedText = "Rates updated 2 min ago",
//   autoRefreshText = "Auto-refreshed daily",
// }) {
//   const modalRef = useRef(null);

//   // ==================================================
//   // CLOSE ON ESCAPE
//   // ==================================================

//   useEffect(() => {
//     if (!isOpen) return;

//     const handleKeyDown = (event) => {
//       if (event.key === "Escape") {
//         onClose?.();
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [isOpen, onClose]);

//   // ==================================================
//   // CLOSE WHEN CLICKING OUTSIDE
//   // ==================================================

//   useEffect(() => {
//     if (!isOpen) return;

//     const handleOutsideClick = (event) => {
//       if (
//         modalRef.current &&
//         !modalRef.current.contains(event.target)
//       ) {
//         onClose?.();
//       }
//     };

//     document.addEventListener("mousedown", handleOutsideClick);

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleOutsideClick
//       );
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen) {
//     return null;
//   }

//   // ==================================================
//   // CURRENCY CODE
//   // ==================================================

//   const getCurrencyCode = (currency) => {
//     return String(
//       currency?.code ||
//         currency?.currencyCode ||
//         currency?.value ||
//         ""
//     ).toUpperCase();
//   };

//   // ==================================================
//   // CURRENCY RATE
//   // ==================================================

//   const getRate = (currency) => {
//     const code = getCurrencyCode(currency);

//     // Currency object rate
//     if (
//       currency?.rate !== undefined &&
//       currency?.rate !== null
//     ) {
//       return Number(currency.rate);
//     }

//     // External rates object
//     if (
//       rates &&
//       rates[code] !== undefined &&
//       rates[code] !== null
//     ) {
//       return Number(rates[code]);
//     }

//     // Base currency
//     if (
//       code ===
//       String(baseCurrencyCode || "INR").toUpperCase()
//     ) {
//       return 1;
//     }

//     return null;
//   };

//   // ==================================================
//   // FORMAT RATE
//   // ==================================================

//   const formatRate = (rate) => {
//     if (
//       rate === null ||
//       rate === undefined ||
//       rate === ""
//     ) {
//       return "—";
//     }

//     const numericRate = Number(rate);

//     if (!Number.isFinite(numericRate)) {
//       return "—";
//     }

//     if (numericRate === 1) {
//       return "1.00";
//     }

//     if (numericRate >= 100) {
//       return numericRate.toFixed(2);
//     }

//     if (numericRate >= 10) {
//       return numericRate.toFixed(3);
//     }

//     return numericRate.toFixed(3);
//   };

//   // ==================================================
//   // FLAG
//   // ==================================================

//   const getFlag = (currency) => {
//     if (currency?.flag) {
//       return currency.flag;
//     }

//     const code = getCurrencyCode(currency);

//     const flagMap = {
//       INR: "🇮🇳",
//       USD: "🇺🇸",
//       EUR: "🇪🇺",
//       GBP: "🇬🇧",
//       CAD: "🇨🇦",
//       AUD: "🇦🇺",
//       JPY: "🇯🇵",
//       CNY: "🇨🇳",
//       CHF: "🇨🇭",
//       SGD: "🇸🇬",
//       HKD: "🇭🇰",
//       NZD: "🇳🇿",
//       AED: "🇦🇪",
//       SAR: "🇸🇦",
//       QAR: "🇶🇦",
//       KWD: "🇰🇼",
//       BDT: "🇧🇩",
//       PKR: "🇵🇰",
//       MYR: "🇲🇾",
//       THB: "🇹🇭",
//       IDR: "🇮🇩",
//       PHP: "🇵🇭",
//       VND: "🇻🇳",
//       KRW: "🇰🇷",
//       ZAR: "🇿🇦",
//       NGN: "🇳🇬",
//       KES: "🇰🇪",
//       BRL: "🇧🇷",
//       MXN: "🇲🇽",
//       RUB: "🇷🇺",
//       TRY: "🇹🇷",
//       PLN: "🇵🇱",
//       CZK: "🇨🇿",
//       HUF: "🇭🇺",
//       DKK: "🇩🇰",
//       NOK: "🇳🇴",
//       SEK: "🇸🇪",
//       ILS: "🇮🇱",
//       TWD: "🇹🇼",
//       UGX: "🇺🇬",
//     };

//     return flagMap[code] || "🌐";
//   };

//   // ==================================================
//   // NORMALIZE CURRENCIES
//   // ==================================================

//   const currencyList =
//     Array.isArray(currencies) && currencies.length > 0
//       ? currencies
//       : DEFAULT_CURRENCIES;

//   const normalizedSelectedCode = String(
//     selectedCurrencyCode || "INR"
//   ).toUpperCase();

//   return (
//    <>
//     <div 
//       className="fixed inset-0 z-40" 
//       onClick={onClose} 
//     />

//     <div 
//       className="
//         absolute 
//         right-0 
//         top-full 
//         mt-2 
//         w-80 
//         bg-surface 
//         border 
//         border-border 
//         rounded-xl 
//         shadow-2xl 
//         p-4 
//         z-50
//       "
//     >
//       {/* ==================================================
//           HEADER
//       ================================================== */}

//       <div
//         className="
//           px-4
//           py-3
//           border-b
//           border-slate-100
//           flex
//           items-center
//           justify-between
//         "
//       >
//         <div>
//           <div
//             className="
//               text-[11px]
//               font-bold
//               text-slate-500
//               uppercase
//               tracking-widest
//             "
//           >
//             Currency
//           </div>

//           <div
//             className="
//               text-[11px]
//               text-slate-400
//               mt-0.5
//             "
//           >
//             {rateUpdatedText}
//           </div>
//         </div>

//         <span
//           className="
//             text-[10px]
//             font-bold
//             text-teal-700
//             bg-teal-50
//             px-2
//             py-1
//             rounded
//           "
//         >
//           LIVE
//         </span>
//       </div>

//       {/* ==================================================
//           CURRENCY LIST
//       ================================================== */}

//       <div
//         className="
//           max-h-80
//           overflow-auto
//           py-1
//         "
//       >
//         {currencyList.map((currency) => {
//           const code = getCurrencyCode(currency);

//           const name =
//             currency?.name ||
//             currency?.currencyName ||
//             code;

//           const symbol =
//             currency?.symbol ||
//             currency?.currencySymbol ||
//             "";

//           const flag = getFlag(currency);

//           const rate = getRate(currency);

//           const isSelected =
//             code === normalizedSelectedCode;

//           return (
//             <button
//               key={code}
//               type="button"
//               onClick={() => {
//                 onSelect?.(currency);
//                 onClose?.();
//               }}
//               className={`
//                 w-full
//                 flex
//                 items-center
//                 gap-3
//                 px-4
//                 py-2.5
//                 hover:bg-slate-50
//                 transition
//                 text-left
//                 ${
//                   isSelected
//                     ? "bg-teal-50"
//                     : ""
//                 }
//               `}
//             >
//               {/* FLAG */}

//               <span
//                 className="
//                   text-xl
//                   leading-none
//                   shrink-0
//                 "
//               >
//                 {flag}
//               </span>

//               {/* CURRENCY INFO */}

//               <div
//                 className="
//                   flex-1
//                   min-w-0
//                 "
//               >
//                 <div
//                   className="
//                     text-[13px]
//                     font-bold
//                     text-slate-900
//                     flex
//                     items-center
//                     gap-2
//                   "
//                 >
//                   {code}

//                   {symbol && (
//                     <span
//                       className="
//                         text-slate-400
//                         font-normal
//                       "
//                     >
//                       {symbol}
//                     </span>
//                   )}
//                 </div>

//                 <div
//                   className="
//                     text-[11px]
//                     text-slate-500
//                   "
//                 >
//                   {name}
//                 </div>
//               </div>

//               {/* RATE + CHECK */}

//               <div
//                 className="
//                   text-right
//                   shrink-0
//                 "
//               >
//                 <div
//                   className="
//                     text-[11px]
//                     tabular-nums
//                     font-mono
//                     text-slate-500
//                   "
//                 >
//                   {formatRate(rate)}
//                 </div>

//                 {isSelected && (
//                   <span
//                     className="
//                       material-symbols-outlined
//                       text-teal-600
//                       mi-fill
//                       ml-auto
//                       mt-0.5
//                     "
//                     style={{
//                       fontSize: "14px",
//                     }}
//                     aria-hidden="true"
//                   >
//                     check_circle
//                   </span>
//                 )}
//               </div>
//             </button>
//           );
//         })}
//       </div>

//       {/* ==================================================
//           FOOTER
//       ================================================== */}

//       <div
//         className="
//           px-4
//           py-2.5
//           bg-slate-50
//           border-t
//           border-slate-100
//           flex
//           items-center
//           gap-2
//           text-[10.5px]
//           text-slate-500
//         "
//       >
//         <span
//           className="material-symbols-outlined"
//           style={{ fontSize: "12px" }}
//           aria-hidden="true"
//         >
//           info
//         </span>

//         <span>
//           Base:{" "}
//           <span className="font-semibold">
//             {String(
//               baseCurrencyCode || "INR"
//             ).toUpperCase()}
//           </span>

//           {" · "}

//           {autoRefreshText}
//         </span>
//       </div>
//     </div>
//   </>
//   );
// }

import { useEffect, useRef } from "react";

const DEFAULT_CURRENCIES = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", rate: 1 },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rate: 0.011 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", rate: 0.0099 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", rate: 0.0085 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", rate: 0.0151 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", rate: 0.0169 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", rate: 1.84 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", rate: 0.0158 },
];

export default function CurrencyModal({
  isOpen,
  currencies = DEFAULT_CURRENCIES,
  selectedCurrencyCode = "INR",
  onSelect,
  onClose,
  rates = {},
  baseCurrencyCode = "INR",
  rateUpdatedText = "Rates updated 2 min ago",
  autoRefreshText = "Auto-refreshed daily",
}) {
  const modalRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close on Click Outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getCurrencyCode = (currency) => {
    return String(currency?.code || currency?.currencyCode || currency?.value || "").toUpperCase();
  };

  const getRate = (currency) => {
    const code = getCurrencyCode(currency);
    if (currency?.rate !== undefined && currency?.rate !== null) {
      return Number(currency.rate);
    }
    if (rates && rates[code] !== undefined && rates[code] !== null) {
      return Number(rates[code]);
    }
    if (code === String(baseCurrencyCode || "INR").toUpperCase()) {
      return 1;
    }
    return null;
  };

  const formatRate = (rate) => {
    if (rate === null || rate === undefined || rate === "") return "—";
    const numericRate = Number(rate);
    if (!Number.isFinite(numericRate)) return "—";
    if (numericRate === 1) return "1.00";
    if (numericRate >= 100) return numericRate.toFixed(2);
    return numericRate.toFixed(3);
  };

  const getFlag = (currency) => {
    if (currency?.flag) return currency.flag;
    const code = getCurrencyCode(currency);
    const flagMap = {
      INR: "🇮🇳", USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", CAD: "🇨🇦",
      AUD: "🇦🇺", JPY: "🇯🇵", CNY: "🇨🇳", CHF: "🇨🇭", SGD: "🇸🇬",
      AED: "🇦🇪", SAR: "🇸🇦"
    };
    return flagMap[code] || "🌐";
  };

  const currencyList = Array.isArray(currencies) && currencies.length > 0 ? currencies : DEFAULT_CURRENCIES;
  const normalizedSelectedCode = String(selectedCurrencyCode || "INR").toUpperCase();

  return (
    <>
      {/* Invisible backdrop to catch clicks */}
      <div className="fixed inset-0 z-40 bg-black/5" onClick={onClose} />

      {/* Dropdown Box: Button ke theek neeche open hoga */}
      <div
        ref={modalRef}
        className="
          absolute
          right-0
          top-[calc(100%+8px)]
          w-72
          bg-white
          border
          border-border
          rounded-xl
          shadow-2xl
          z-50
          overflow-hidden
          animate-in
          fade-in
          duration-150
        "
      >
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-surface/50">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Select Currency
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {rateUpdatedText}
            </div>
          </div>
          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
            LIVE
          </span>
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto py-1 divide-y divide-border/40">
          {currencyList.map((currency) => {
            const code = getCurrencyCode(currency);
            const name = currency?.name || currency?.currencyName || code;
            const symbol = currency?.symbol || currency?.currencySymbol || "";
            const flag = getFlag(currency);
            const rate = getRate(currency);
            const isSelected = code === normalizedSelectedCode;

            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  onSelect?.(currency);
                  onClose?.();
                }}
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-2.5
                  hover:bg-slate-50
                  transition
                  text-left
                  ${isSelected ? "bg-teal-50/70" : ""}
                `}
              >
                <span className="text-xl shrink-0 leading-none">{flag}</span>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    {code}
                    {symbol && (
                      <span className="text-slate-400 font-normal">
                        ({symbol})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {name}
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">
                    {formatRate(rate)}
                  </span>
                  {isSelected && (
                    <span className="text-teal-600 font-bold text-sm">✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-border flex items-center justify-between text-[10px] text-slate-500">
          <span>Base: <strong>{String(baseCurrencyCode).toUpperCase()}</strong></span>
          <span>{autoRefreshText}</span>
        </div>
      </div>
    </>
  );
}