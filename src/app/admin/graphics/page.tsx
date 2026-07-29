"use client";

import React, { useState, useEffect } from 'react';
import { UploadCloud, Box, Save, Loader2, RefreshCw, Zap } from 'lucide-react';

type GraphicAsset = {
  _id: string;
  title: string;
  category: string;
  modelUrl: string;
  themeColor: string;
  componentRef?: string; 
};

export default function GlobalGraphicsAdmin() {
  const [graphics, setGraphics] = useState<GraphicAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  // NEW: State to track exact upload percentage
  const [uploadProgress, setUploadProgress] = useState(0); 

  const fetchGraphics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/content/graphics');
      if (res.ok) {
        setGraphics(await res.json());
      }
    } catch (error) {
      console.error("Failed to load graphics", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphics();
  }, []);

  const handleGraphicSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0); // Reset progress on new upload
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get('glbFile') as File;
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const themeColor = formData.get('themeColor') as string;
    const componentRef = formData.get('componentRef') as string;

    if (!file || !file.name.endsWith('.glb')) {
      alert("Please upload a valid .glb 3D model file.");
      setIsUploading(false);
      return;
    }

    try {
      // 1. Ask the backend for the R2 Ticket
      const presignedRes = await fetch('/api/admin/r2-presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: 'model/gltf-binary',
          folder: '3d-models',
        }),
      });

      if (!presignedRes.ok) throw new Error('Failed to generate presigned URL.');
      const { uploadUrl, publicUrl, key } = await presignedRes.json();

      // 2. NEW: Upload using XMLHttpRequest to get live progress
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', 'model/gltf-binary');

        // Track live upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(true);
          } else {
            reject(new Error(`Cloudflare rejected upload: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload.'));
        xhr.send(file);
      });

      // 3. Save to MongoDB once the upload hits 100%
      const dbRes = await fetch('/api/content/graphics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, subtitle, category, description, themeColor,
          modelUrl: publicUrl,
          r2Key: key,
          componentRef: componentRef && componentRef.trim() !== '' ? componentRef.trim() : undefined,
          accentColor: 'text-stone-300',
          glowColor: 'shadow-stone-500/20'
        }),
      });

      if (!dbRes.ok) throw new Error("Failed to save to database.");

      (e.target as HTMLFormElement).reset();
      fetchGraphics();

    } catch (error) {
      console.error("Upload process failed:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-stone-900 mb-2">Global 3D Graphics</h1>
          <p className="text-stone-500 font-light">Manage the universal WebXR models for the Virtual Labs metaverse.</p>
        </div>
        <button onClick={fetchGraphics} className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: UPLOAD FORM */}
        <div className="w-full lg:w-1/3 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
            <UploadCloud size={20} className="text-emerald-600"/> Upload New GLB
          </h2>
          
          <form onSubmit={handleGraphicSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Model Title</label>
              <input type="text" name="title" required placeholder="e.g., The Human Brain" className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-400"/>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Category</label>
                <input type="text" name="category" required placeholder="e.g., Biology" className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-400"/>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Theme Class</label>
                <select name="themeColor" className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-400">
                  <option value="from-emerald-900 to-emerald-950">Emerald</option>
                  <option value="from-stone-800 to-stone-950">Stone</option>
                  <option value="from-indigo-900 to-indigo-950">Indigo</option>
                  <option value="from-amber-900 to-amber-950">Amber</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Subtitle</label>
              <input type="text" name="subtitle" required placeholder="Short punchy tagline" className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-400"/>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Description</label>
              <textarea name="description" rows={3} required placeholder="Detailed simulation description..." className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-400 resize-none"/>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Interactive React Pointer (Optional)</label>
              <input type="text" name="componentRef" placeholder="e.g., RocketLaunch3D" className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-stone-400 font-mono text-stone-600"/>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">.GLB File</label>
              <div className="border-2 border-dashed border-stone-200 bg-stone-50 p-6 rounded-xl flex flex-col items-center text-center relative hover:border-emerald-400 transition-colors">
                <Box size={24} className="text-stone-400 mb-2" />
                <span className="text-xs font-medium text-stone-600">Select 3D Asset</span>
                <input type="file" name="glbFile" accept=".glb" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>

            <button type="submit" disabled={isUploading} className="w-full bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 overflow-hidden relative">
              {/* NEW: Background progress bar fill */}
              {isUploading && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-emerald-600 transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
              
              <div className="relative z-10 flex items-center gap-2">
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{isUploading ? `Uploading: ${uploadProgress}%` : 'Save & Publish'}</span>
              </div>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: ACTIVE GRAPHICS LIST */}
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-full py-12 flex justify-center"><Loader2 className="animate-spin text-stone-400" /></div>
            ) : graphics.length === 0 ? (
              <div className="col-span-full p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 font-medium">No 3D models uploaded yet.</div>
            ) : (
              graphics.map((graphic) => (
                <div key={graphic._id} className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-3 group hover:border-stone-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400">{graphic.category}</span>
                      <h3 className="text-lg font-serif font-medium text-stone-900">{graphic.title}</h3>
                    </div>
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${graphic.themeColor} shadow-inner flex-shrink-0`} />
                  </div>
                  <div className="text-xs font-mono text-stone-400 truncate bg-stone-50 p-2 rounded-lg border border-stone-100">
                    {graphic.modelUrl.split('/').pop()}
                  </div>
                  {graphic.componentRef && (
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                        <Zap size={12} className="fill-amber-500" /> {graphic.componentRef}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}