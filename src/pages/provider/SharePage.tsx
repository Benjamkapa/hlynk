import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SharePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string>('');
  const navigate = useNavigate();

  // When the page loads, attempt to read any files from the POST request via the Service Worker cache
  useEffect(() => {
    // The Service Worker should have stored the shared files in IndexedDB or cache.
    // For simplicity, we try to read from the navigator.shareData if available (not standard).
    // This placeholder can be expanded later.
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      const url = URL.createObjectURL(selected[0]);
      setPreview(url);
    }
  };

  const handleProceed = () => {
    // Navigate to the Products page where the user can create a new item.
    // Pass the selected file via state so the Products page can pre‑fill the image.
    navigate('/products', { state: { sharedFiles: files } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4 text-emerald-800">Add Shared Image</h1>
      {preview && (
        <img src={preview} alt="preview" className="max-w-full h-auto rounded-lg shadow-md mb-4" />
      )}
      <input
        type="file"
        accept="image/*"
        multiple={false}
        onChange={handleFileChange}
        className="mb-4"
      />
      <button
        onClick={handleProceed}
        disabled={files.length === 0}
        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
      >
        Continue to Create Item
      </button>
    </div>
  );
}
