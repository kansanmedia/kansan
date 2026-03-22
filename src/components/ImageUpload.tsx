import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, Loader2, Images, Laptop2 } from 'lucide-react';
import { adminJson } from '../lib/api';

const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
const isSupportedImageFile = (file: File) => {
  const mimeType = file.type.toLowerCase();
  const lowerName = file.name.toLowerCase();

  return mimeType.startsWith('image/') || allowedImageExtensions.some((extension) => lowerName.endsWith(extension));
};

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  uploadName?: string;
}

export function ImageUpload({ value, onChange, label = 'Image', uploadName }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'device' | 'library'>('device');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryImages, setLibraryImages] = useState<Array<{ name: string; url: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!libraryOpen) {
      return;
    }

    setLibraryLoading(true);
    adminJson<Array<{ name: string; url: string }>>('/api/admin/upload-library', {}, 'Failed to load image library')
      .then(setLibraryImages)
      .catch((uploadError) => setError(uploadError instanceof Error ? uploadError.message : 'Failed to load image library'))
      .finally(() => setLibraryLoading(false));
  }, [libraryImages.length, libraryOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupportedImageFile(file)) {
      setError('Please select a JPG, PNG, GIF, WEBP, SVG, or ICO image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');
    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploadName', uploadName || label || file.name);

    try {
      const data = await adminJson<{ url: string }>('/api/admin/upload', {
        method: 'POST',
        body: formData
      }, 'Failed to upload image');
      onChange(data.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const openDevicePicker = () => {
    setMode('device');
    setLibraryOpen(false);
    window.setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const openLibrary = () => {
    setMode('library');
    setLibraryOpen(true);
    setError('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openDevicePicker}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${mode === 'device' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Laptop2 className="h-4 w-4" />
          Choose from device
        </button>
        <button
          type="button"
          onClick={openLibrary}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${mode === 'library' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Images className="h-4 w-4" />
          Choose from library
        </button>
      </div>

      {value && (
        <div className="relative mb-3 inline-block">
          <img
            src={value}
            alt="Uploaded preview"
            className="h-32 w-auto rounded-md border border-gray-300 object-cover"
            onError={() => setError('Current image preview load nahi ho pa raha. Aap device ya library se dobara choose kar sakte hain.')}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {mode === 'library' ? (
        <div className="rounded-md border border-gray-200 bg-white p-4">
          {libraryLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading library...
            </div>
          ) : libraryImages.length > 0 ? (
            <div className="grid max-h-72 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
              {libraryImages.map((image) => (
                <button
                  key={image.url}
                  type="button"
                  onClick={() => {
                    onChange(image.url);
                    setLibraryOpen(false);
                  }}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-left transition-colors hover:border-blue-500"
                >
                  <img src={image.url} alt={image.name} className="aspect-square w-full object-cover" />
                  <div className="truncate px-2 py-2 text-xs text-gray-600">{image.name}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-500">Library me abhi koi uploaded image nahi hai.</div>
          )}
        </div>
      ) : (
        <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 bg-white px-6 pb-6 pt-5 transition-colors hover:border-blue-500">
          <div className="space-y-1 text-center">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-500 mt-2">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <button
                    type="button"
                    onClick={openDevicePicker}
                    className="relative rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                  >
                    Upload a file
                  </button>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP, SVG, ICO up to 5MB</p>
              </>
            )}
          </div>
        </div>
      )}
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      
      {/* Hidden input to ensure the form can submit the URL if needed, though we manage it via state */}
      <input type="hidden" value={value} />
    </div>
  );
}
