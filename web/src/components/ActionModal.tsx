import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, IndianRupee } from "lucide-react";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string, date?: string, time?: string) => void;
  title: string;
  description: string;
  placeholder: string;
  type: "price" | "timing";
  initialValue?: string;
}

export default function ActionModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  placeholder,
  type,
  initialValue = "",
}: ActionModalProps) {
  const [value, setValue] = useState(initialValue);
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");

  // Reset value when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    if (type === "price") {
      const parsed = parseFloat(value);
      if (isNaN(parsed) || parsed <= 0) {
        return;
      }
    }
    if (type === "timing") {
      if (!dateValue || !timeValue) return;
      onSubmit(value, dateValue, timeValue);
    } else {
      onSubmit(value);
    }
    setValue("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    {type === "price" ? (
                      <IndianRupee className="w-6 h-6" />
                    ) : (
                      <Clock className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                      {description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <div className="relative">
                    {type === "price" && (
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold">₹</span>
                      </div>
                    )}
                    {type === "price" ? (
                      <input
                        type="number"
                        min="0"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-4 pl-8 pr-4 text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        autoFocus
                        required
                      />
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Select Date</label>
                          <input
                            type="date"
                            value={dateValue}
                            onChange={(e) => setDateValue(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-4 px-4 text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Select Time</label>
                          <input
                            type="time"
                            value={timeValue}
                            onChange={(e) => setTimeValue(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-4 px-4 text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3.5 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={type === "price" ? !value.trim() : (!dateValue || !timeValue)}
                    className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-emerald-500/25"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
