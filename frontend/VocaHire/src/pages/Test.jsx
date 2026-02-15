import  { useState } from 'react';
import { Upload, File, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * React Component for File Upload to FastAPI
 * 
 * Compatible with FastAPI endpoint:
 * @router.post("/upload")
 * def upload_audio(
 *     job_title: str = Query(...),
 *     qualities: str = Query(...),
 *     file: UploadFile = File(...),
 * )
 */

const Test = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [qualities, setQualities] = useState('Communication,Technical Skills');

  // Constants
  const API_ENDPOINT = "http://localhost:5000/audio/upload"; // Change to your FastAPI URL and route

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResponse(null);
      setError(null);
      setStatus('idle');
    }
  };

  const handleJobTitleChange = (e) => {
    setJobTitle(e.target.value);
  };

  const handleQualitiesChange = (e) => {
    setQualities(e.target.value);
  };

  const uploadWithRetry = async (formData, retries = 5, delay = 1000) => {
    try {
      const params = new URLSearchParams({
        job_title: jobTitle,
        qualities: qualities
      });
      const queryString = params.toString();

      const res = await fetch(`${API_ENDPOINT}?${queryString}`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      
      return await res.json();
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return uploadWithRetry(formData, retries - 1, delay * 2);
      }
      throw err;
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await uploadWithRetry(formData);
      setResponse(data);
      setStatus('success');
    } catch (err) {
      setError(err.message || "Failed to connect to the FastAPI server. Ensure CORS is enabled.");
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Audio Analysis Tester</h1>
        <p className="text-slate-500 mb-8 text-sm">Upload a file to test your API endpoint connectivity.</p>

        {/* Parameter Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 mb-1">
              Job Title
            </label>
            <input
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={handleJobTitleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter job title"
            />
          </div>
          
          <div>
            <label htmlFor="qualities" className="block text-sm font-medium text-slate-700 mb-1">
              Qualities (comma-separated)
            </label>
            <input
              id="qualities"
              type="text"
              value={qualities}
              onChange={handleQualitiesChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter comma-separated qualities"
            />
            <p className="text-xs text-slate-500 mt-1">Example: Communication,Technical Skills,Problem Solving</p>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="space-y-6">
          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center
              ${file ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-slate-50'}`}
          >
            <input 
              type="file" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="text-center">
                <File className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Click or drag to select file</p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
              ${!file || status === 'uploading' 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-200'}`}
          >
            {status === 'uploading' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {status === 'uploading' ? 'Sending...' : 'Send to API'}
          </button>
        </div>

        {/* Results Area */}
        <div className="mt-8 space-y-4">
          {status === 'success' && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg animate-in fade-in duration-500">
              <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
                <CheckCircle className="w-4 h-4" />
                Success
              </div>
              <pre className="text-xs text-emerald-800 bg-emerald-100/50 p-3 rounded overflow-x-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg animate-in fade-in duration-500">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                <AlertCircle className="w-4 h-4" />
                Error
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-6 text-slate-400 text-xs">
        Endpoint: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{API_ENDPOINT}</code>
        <br className="mt-1" />
        Default Parameters: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">job_title={jobTitle}</code> • 
        <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 ml-1">qualities={qualities}</code>
      </p>
    </div>
  );
};

export default Test;