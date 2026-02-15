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
    // Check file type
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/webp'];
    const maxSize = 200 * 1024 * 1024; // 200MB in bytes
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid audio file (WAV, MP3, or WebP)');
      return;
    }
    
    if (file.size > maxSize) {
      alert('File size exceeds 200MB limit');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    
    if (!candidateName.trim()) {
      alert('Please enter candidate name');
      return;
    }
    
    if (!sessionTitle.trim()) {
      alert('Please enter session title');
      return;
    }
    
    if (!jobTitle.trim()) {
      alert('Please enter job title');
      return;
    }
    
    // Prepare the data object
    const importData = {
      candidateName: candidateName.trim(),
      sessionTitle: sessionTitle.trim(),
      jobTitle: jobTitle.trim(),
      qualities: tags, // Already an array
      sessionType: 'Import', // Always "Import" for this modal
      file: selectedFile
    };
    
    console.log('Import data:', importData);
    
    // Call the onConfirm function with the data
    onConfirm(importData);
    
    // You can optionally close the modal here or let the parent handle it
    // onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Helper function to conditionally apply classes based on dark mode
  const getClass = (lightClass, darkClass) => {
    return isDarkMode ? darkClass : lightClass;
  };

  // Reset form when modal closes
  const handleClose = () => {
    setCandidateName('');
    setSessionTitle('');
    setJobTitle('');
    setTags(['Leadership', 'Communication']);
    setInputValue('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={handleClose} />
      
      <div className={`relative ${getClass('bg-white', 'bg-[#1f1f1f]')} w-full max-w-lg rounded-xl shadow-2xl border ${getClass('border-slate-200', 'border-slate-800')} overflow-hidden animate-in fade-in zoom-in duration-200`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${getClass('border-slate-100', 'border-slate-800')}`}>
          <h3 className={`text-lg font-bold ${getClass('text-slate-800', 'text-slate-200')}`}>{t.importTitle}</h3>
          <button onClick={handleClose} className={`${getClass('text-slate-400 hover:text-slate-600', 'text-slate-400 hover:text-slate-200')} transition-colors`}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          <p className={`text-sm ${getClass('text-slate-500', 'text-slate-500')}`}>{t.importDesc}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${getClass('text-slate-500', 'text-slate-400')} uppercase tracking-wider flex items-center gap-1.5`}>
                  <User size={12} /> {t.candidateName}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe" 
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className={`w-full ${getClass('bg-slate-50', 'bg-slate-900/50')} border ${getClass('border-slate-200', 'border-slate-800')} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${getClass('text-slate-800', 'text-slate-100')}`} 
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${getClass('text-slate-500', 'text-slate-400')} uppercase tracking-wider flex items-center gap-1.5`}>
                  <Briefcase size={12} /> {t.jobTitle}
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior Backend Engineer" 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className={`w-full ${getClass('bg-slate-50', 'bg-slate-900/50')} border ${getClass('border-slate-200', 'border-slate-800')} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${getClass('text-slate-800', 'text-slate-100')}`} 
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-semibold ${getClass('text-slate-500', 'text-slate-400')} uppercase tracking-wider`}>
                {t.sessionTitle}
              </label>
              <input 
                type="text" 
                placeholder="e.g. Senior Developer Interview" 
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className={`w-full ${getClass('bg-slate-50', 'bg-slate-900/50')} border ${getClass('border-slate-200', 'border-slate-800')} rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${getClass('text-slate-800', 'text-slate-100')}`} 
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-semibold ${getClass('text-slate-500', 'text-slate-400')} uppercase tracking-wider flex items-center gap-1.5`}>
                <TagIcon size={12} /> {t.qualities}
              </label>
              <div className={`flex flex-wrap gap-2 p-2 ${getClass('bg-slate-50', 'bg-slate-900/50')} border ${getClass('border-slate-200', 'border-slate-800')} rounded min-h-[42px]`}>
                {tags.map((tag, idx) => (
                  <span key={idx} className={`inline-flex items-center gap-1 px-2 py-0.5 ${getClass('bg-blue-50 text-blue-700', 'bg-blue-900/30 text-blue-300')} text-xs font-medium rounded`}>
                    {tag}
                    <X 
                      size={12} 
                      className={`cursor-pointer ${getClass('hover:text-blue-900', 'hover:text-blue-100')}`} 
                      onClick={() => removeTag(idx)} 
                    />
                  </span>
                ))}
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type & press Enter"
                  className={`bg-transparent border-none outline-none text-sm flex-1 min-w-[100px] ${getClass('text-slate-800', 'text-slate-100')} ${getClass('placeholder:text-slate-400', 'placeholder:text-slate-500')}`} 
                />
              </div>
            </div>

            <div className="pt-2">
              <label className={`text-xs font-semibold ${getClass('text-slate-500', 'text-slate-400')} uppercase tracking-wider mb-2 block`}>
                {t.uploadFile}
              </label>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".wav,.mp3,.webp,audio/*"
                className="hidden"
              />
              
              {selectedFile ? (
                <div className={`border ${getClass('border-slate-200', 'border-slate-800')} rounded-lg p-4 ${getClass('bg-slate-50/50', 'bg-slate-900/20')}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${getClass('bg-blue-50', 'bg-blue-900/20')} rounded-full flex items-center justify-center ${getClass('text-blue-600', 'text-blue-400')}`}>
                        <Upload size={20} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${getClass('text-slate-700', 'text-slate-300')}`}>{selectedFile.name}</p>
                        <p className={`text-xs ${getClass('text-slate-400', 'text-slate-500')}`}>
                          {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className={`p-1 ${getClass('text-slate-400 hover:text-slate-600', 'text-slate-400 hover:text-slate-200')}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleUploadClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`group border-2 border-dashed ${getClass('border-slate-200', 'border-slate-800')} ${isDragging ? getClass('border-blue-400', 'border-blue-500') : ''} rounded-lg p-8 flex flex-col items-center justify-center ${getClass('hover:border-blue-400', 'hover:border-blue-500')} transition-colors cursor-pointer ${getClass('bg-slate-50/50', 'bg-slate-900/20')}`}
                >
                  <div className={`w-10 h-10 ${getClass('bg-blue-50', 'bg-blue-900/20')} rounded-full flex items-center justify-center ${getClass('text-blue-600', 'text-blue-400')} mb-3 group-hover:scale-110 transition-transform`}>
                    <Upload size={20} />
                  </div>
                  <p className={`text-sm font-medium ${getClass('text-slate-700', 'text-slate-300')}`}>{t.uploadDesc}</p>
                  <p className={`text-xs ${getClass('text-slate-400', 'text-slate-500')} mt-1`}>WAV, MP3 or webp (Max 200MB)</p>
                  <p className={`text-xs ${getClass('text-slate-400', 'text-slate-500')} mt-2`}>Click to browse or drag & drop</p>
                </div>
              )}
            </div>

            <div className={`flex items-center justify-end gap-3 px-6 py-4 ${getClass('bg-slate-50/50', 'bg-slate-900/30')} border-t ${getClass('border-slate-100', 'border-slate-800')}`}>
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