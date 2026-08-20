import { useState, useRef } from "react";
import { Sparkles, Upload, FileText, X, Loader2 } from "lucide-react";
import { api } from "../../lib/api";

export default function IngestionWorkspace({ onSubmitStart, onSubmitSuccess, onSubmitError }) {
  const [mode, setMode] = useState("paste"); // "paste" | "upload"
  const [jobDescription, setJobDescription] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef(null);

  const acceptedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ];

  const handleFile = (file) => {
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) {
      alert("Please upload a .pdf or .docx file");
      return;
    }
    setJdFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const extractTextFromFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/api/extract-text", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.text;
  };

  const handleSubmit = async () => {
    let finalJobDescription = jobDescription;

    if (mode === "upload") {
      setIsExtracting(true);
      try {
        finalJobDescription = await extractTextFromFile(jdFile);
      } catch (err) {
        setIsExtracting(false);
        const message =
          err.response?.data?.error || "Could not extract text from the uploaded file.";
        onSubmitError?.(message);
        return;
      }
      setIsExtracting(false);
    }

    onSubmitStart?.();

    try {
      const response = await api.post("/api/craft", {
        jobDescription: finalJobDescription,
        companyName,
        companyUrl,
      });
      onSubmitSuccess?.(response.data);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        (err.code === "ECONNABORTED"
          ? "Request timed out — the pipeline is taking longer than expected."
          : "Could not reach the server. Is it running on port 5001?");
      onSubmitError?.(message);
    }
  };

  const canSubmit =
    (mode === "paste" ? jobDescription.trim() : !!jdFile) &&
    companyName.trim() &&
    !isExtracting;

  return (
    <div className="glass-card p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Craft My Role Intelligence</h2>
        <p className="text-white/50 text-sm mt-1">
          Paste a job description and tell us the company — we'll handle the rest.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-white/70 font-medium">
            Job Description
          </label>
          <div className="flex bg-black/30 border border-glass-border rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMode("paste")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                mode === "paste" ? "bg-amber/15 text-amber" : "text-white/40 hover:text-white/70"
              }`}
            >
              Paste Text
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                mode === "upload" ? "bg-amber/15 text-amber" : "text-white/40 hover:text-white/70"
              }`}
            >
              Upload File
            </button>
          </div>
        </div>

        {mode === "paste" ? (
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            placeholder="Paste the full job description here..."
            className="w-full bg-black/30 border border-glass-border rounded-xl p-4 text-sm
                       text-white/90 placeholder-white/30 focus:outline-none focus:border-amber/50
                       focus:shadow-glow-amber transition-shadow resize-none font-body"
          />
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center
                        justify-center gap-2 cursor-pointer transition-colors ${
              isDragging
                ? "border-amber bg-amber/5"
                : "border-glass-border hover:border-white/25"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {jdFile ? (
              <div className="flex items-center gap-3 bg-black/30 border border-glass-border rounded-lg px-4 py-2.5">
                <FileText size={18} className="text-teal" />
                <span className="text-sm text-white/80">{jdFile.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setJdFile(null);
                  }}
                  className="text-white/40 hover:text-crimson transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={22} className="text-white/30" />
                <p className="text-sm text-white/50">
                  Drag & drop a <span className="text-white/70">.pdf</span> or{" "}
                  <span className="text-white/70">.docx</span>, or click to browse
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-white/70 font-medium">
            Company Name <span className="text-crimson">*</span>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. JioSaavn"
            className="w-full bg-black/30 border border-glass-border rounded-xl px-4 py-3 text-sm
                       text-white/90 placeholder-white/30 focus:outline-none focus:border-amber/50
                       focus:shadow-glow-amber transition-shadow font-body"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/70 font-medium">
            Company Website <span className="text-white/30">(optional)</span>
          </label>
          <input
            type="text"
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            placeholder="e.g. jiosaavn.com"
            className="w-full bg-black/30 border border-glass-border rounded-xl px-4 py-3 text-sm
                       text-white/90 placeholder-white/30 focus:outline-none focus:border-amber/50
                       focus:shadow-glow-amber transition-shadow font-body"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 bg-amber/10 border border-amber/40
                   text-amber font-semibold rounded-xl py-3.5 transition-all duration-300
                   hover:bg-amber/20 hover:shadow-glow-amber
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-amber/10"
      >
        {isExtracting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Extracting text from file...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Craft My Role Intelligence
          </>
        )}
      </button>
    </div>
  );
}