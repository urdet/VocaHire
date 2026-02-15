import React, { useState } from "react";
import { X } from "lucide-react";
import { DIPLOMAS } from "../constants";

export default function CreateSessionModal({ isOpen, onClose, t, onConfirm }) {
  const [newSessionData, setNewSessionData] = useState({
    jobTitle: "",
    date: "",
    count: 1,
    qualities: ["Leadership"],
    diploma: "Master",
    experience: 0,
    criterias: "",
  });
  const [tagInput, setTagInput] = useState("");

  if (!isOpen) return null;

  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!newSessionData.qualities.includes(tagInput.trim())) {
        setNewSessionData({
          ...newSessionData,
          qualities: [...newSessionData.qualities, tagInput.trim()],
        });
      }
      setTagInput("");
    }
  };

  const handleSubmit = () => {
    if (newSessionData.jobTitle) {
      onConfirm(newSessionData);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1f1f1f] w-full max-w-xl rounded border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-inherit z-10">
          <h3 className="text-sm font-bold uppercase tracking-tight text-blue-700">
            {t.importTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t.jobTitle}
              </label>
              <input
                onChange={(e) =>
                  setNewSessionData({
                    ...newSessionData,
                    jobTitle: e.target.value,
                  })
                }
                type="text"
                placeholder="e.g. UX Designer"
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-blue-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t.candidateCount}
              </label>
              <input
                type="number"
                onChange={(e) =>
                  setNewSessionData({
                    ...newSessionData,
                    count: parseInt(e.target.value),
                  })
                }
                defaultValue={1}
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t.diploma}
              </label>
              <select
                value={newSessionData.diploma}
                onChange={(e) =>
                  setNewSessionData({
                    ...newSessionData,
                    diploma: e.target.value,
                  })
                }
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-blue-400"
              >
                {DIPLOMAS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t.experience}
              </label>
              <input
                type="number"
                placeholder="0"
                onChange={(e) =>
                  setNewSessionData({
                    ...newSessionData,
                    experience: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t.date}
            </label>
            <input
              onChange={(e) =>
                setNewSessionData({ ...newSessionData, date: e.target.value })
              }
              type="date"
              className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-blue-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t.qualities}
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded min-h-[42px]">
              {newSessionData.qualities.map((tag, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded uppercase"
                >
                  {tag}
                  <X
                    size={10}
                    className="cursor-pointer"
                    onClick={() =>
                      setNewSessionData({
                        ...newSessionData,
                        qualities: newSessionData.qualities.filter(
                          (_, i) => i !== idx
                        ),
                      })
                    }
                  />
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="..."
                className="bg-transparent text-sm outline-none flex-1 min-w-[50px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t.criterias}
            </label>
            <textarea
              rows={2}
              onChange={(e) =>
                setNewSessionData({
                  ...newSessionData,
                  criterias: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#1f1f1f]">
          <button
            onClick={onClose}
            className="text-[11px] font-bold uppercase text-slate-500 hover:text-blue-600 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-1.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-[11px] font-semibold rounded shadow-md"
          >
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}