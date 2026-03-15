import { useState, useRef } from 'react';
import {
  X,
  Upload,
  Hash,
  Briefcase,
  TagIcon,
  User
} from 'lucide-react';

export default function ImportModal({ isOpen, onClose, t, isRtl, isDarkMode, onConfirm }) {
  const [candidateName, setCandidateName] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [tags, setTags] = useState(['Leadership', 'Communication']);
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const allowedTypes = [
      'audio/wav',
      'audio/x-wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/webm'
    ];

    const maxSize = 200 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid audio file (WAV, MP3, or WebM)');
      return;
    }

    if (file.size > maxSize) {
      alert('File size exceeds 200MB limit');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClose = () => {
    setCandidateName('');
    setSessionTitle('');
    setJobTitle('');
    setTags(['Leadership', 'Communication']);
    setInputValue('');
    setSelectedFile(null);
    setIsDragging(false);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onConfirm({
      candidateName,
      sessionTitle,
      jobTitle,
      tags,
      selectedFile
    });

    handleClose();
  };

  const getClass = (light, dark) => (isDarkMode ? dark : light);
  const dir = isRtl ? 'rtl' : 'ltr';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border ${getClass('bg-white border-slate-200', 'bg-slate-950 border-slate-800')}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${getClass('border-slate-100', 'border-slate-800')}`}>
          <div>
            <h2 className={`text-lg font-semibold ${getClass('text-slate-900', 'text-slate-100')}`}>
              {t.importTitle}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${getClass('hover:bg-slate-100 text-slate-500', 'hover:bg-slate-800 text-slate-400')}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`mb-2 flex items-center gap-2 text-sm font-medium ${getClass('text-slate-700', 'text-slate-300')}`}>
                  <User size={16} />
                  Candidate
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className={`w-full rounded-lg px-4 py-3 outline-none border ${getClass('bg-white border-slate-200 text-slate-900', 'bg-slate-900 border-slate-800 text-slate-100')}`}
                />
              </div>

              <div>
                <label className={`mb-2 flex items-center gap-2 text-sm font-medium ${getClass('text-slate-700', 'text-slate-300')}`}>
                  <Hash size={16} />
                  Session title
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className={`w-full rounded-lg px-4 py-3 outline-none border ${getClass('bg-white border-slate-200 text-slate-900', 'bg-slate-900 border-slate-800 text-slate-100')}`}
                />
              </div>

              <div>
                <label className={`mb-2 flex items-center gap-2 text-sm font-medium ${getClass('text-slate-700', 'text-slate-300')}`}>
                  <Briefcase size={16} />
                  Job title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className={`w-full rounded-lg px-4 py-3 outline-none border ${getClass('bg-white border-slate-200 text-slate-900', 'bg-slate-900 border-slate-800 text-slate-100')}`}
                />
              </div>

              <div>
                <label className={`mb-2 flex items-center gap-2 text-sm font-medium ${getClass('text-slate-700', 'text-slate-300')}`}>
                  <TagIcon size={16} />
                  Tags
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleAddTag}
                  className={`w-full rounded-lg px-4 py-3 outline-none border ${getClass('bg-white border-slate-200 text-slate-900', 'bg-slate-900 border-slate-800 text-slate-100')}`}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-2"
                    onClick={() => removeTag(index)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50/30' : getClass('border-slate-200', 'border-slate-800')
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleFileSelect}
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-green-600">{selectedFile.name}</div>
                  <div className="text-xs text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                    <Upload size={20} />
                  </div>
                  <p className={`text-sm font-medium ${getClass('text-slate-700', 'text-slate-300')}`}>
                    {t.uploadDesc}
                  </p>
                  <p className={`text-xs ${getClass('text-slate-400', 'text-slate-500')}`}>
                    WAV, MP3 or WebM (Max 200MB)
                  </p>
                </div>
              )}
            </div>

            <div className={`flex items-center justify-end gap-3 px-0 py-0`}>
              <button
                type="button"
                onClick={handleClose}
                className={`px-4 py-2 text-sm font-medium ${getClass('text-slate-600', 'text-slate-400')} ${getClass('hover:bg-slate-100', 'hover:bg-slate-800')} rounded transition-colors`}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm transition-all active:scale-[0.98]"
              >
                {t.confirm}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}