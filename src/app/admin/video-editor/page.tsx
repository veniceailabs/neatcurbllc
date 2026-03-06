"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play, Pause, Download, ChevronRight, ChevronLeft,
  CheckCircle2, Film, RotateCcw, Loader2,
} from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

// ─── Types ───────────────────────────────────────────────────────────────────

type Style = "social-promo" | "clean-caption" | "announcement";

type TextFields = {
  headline: string;
  tagline:  string;
  cta:      string;
};

type Layer = {
  text:       string;
  startTime:  number;
  endTime:    number;
  x:          number;    // % canvas width
  y:          number;    // % canvas height
  fontSize:   number;    // px at 480px reference height
  color:      string;
  bgColor:    string;
  bold:       boolean;
  align:      "left" | "center" | "right";
  animation:  "none" | "fade-in" | "slide-up" | "word-by-word";
  uppercase:  boolean;
  fontFamily: string;
};

type ExportFormat = {
  id:        string;
  icon:      string;
  label:     string;
  dims:      string;    // e.g. "1080 × 1920"
  platforms: string;    // short platform list
  note:      string;    // file size / quality hint
  width:     number;
  height:    number;
  popular?:  boolean;
};

// ─── Export formats ───────────────────────────────────────────────────────────
//  All export to MP4 (H.264) via server-side ffmpeg.
//  Dimensions shown are OUTPUT dimensions — source is letterboxed/pillarboxed.

const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: "tiktok",
    icon: "📱",
    label: "TikTok / Reels / Shorts",
    dims: "1080 × 1920",
    platforms: "TikTok · Instagram Reels · YouTube Shorts · Facebook Stories",
    note: "Vertical 9:16 · 1080p · ~30–60 MB",
    width: 1080, height: 1920,
    popular: true,
  },
  {
    id: "ig-square",
    icon: "⬜",
    label: "Instagram Feed",
    dims: "1080 × 1080",
    platforms: "Instagram Feed · Facebook Feed · LinkedIn",
    note: "Square 1:1 · 1080p · ~25–50 MB",
    width: 1080, height: 1080,
  },
  {
    id: "youtube-hd",
    icon: "🖥️",
    label: "YouTube / Facebook HD",
    dims: "1920 × 1080",
    platforms: "YouTube · Facebook Video · LinkedIn · Twitter/X",
    note: "Landscape 16:9 · 1080p HD · ~40–80 MB",
    width: 1920, height: 1080,
  },
  {
    id: "youtube-4k",
    icon: "✨",
    label: "YouTube 4K",
    dims: "3840 × 2160",
    platforms: "YouTube 4K · High-quality archive",
    note: "Landscape 16:9 · 4K UHD · ~150–400 MB · slow render",
    width: 3840, height: 2160,
  },
  {
    id: "web-720",
    icon: "⚡",
    label: "Web / Quick Share",
    dims: "1280 × 720",
    platforms: "YouTube · Twitter/X · Email · Small file",
    note: "Landscape 16:9 · 720p · ~10–20 MB · fastest",
    width: 1280, height: 720,
  },
];

// ─── Style templates ─────────────────────────────────────────────────────────

const STYLES = [
  {
    id:   "social-promo" as Style,
    icon: "🔥",
    name: "Social Promo",
    desc: "Big bold text reveals word-by-word, tagline slides up, CTA pops at the end. Perfect for TikTok & Reels.",
  },
  {
    id:   "clean-caption" as Style,
    icon: "📝",
    name: "Clean Caption",
    desc: "Clean subtitle-style text drifts in at the bottom throughout. Professional and easy to read.",
  },
  {
    id:   "announcement" as Style,
    icon: "📣",
    name: "Announcement",
    desc: "Centered bold text fades in over the video. Great for seasonal deals or new service launches.",
  },
];

const BRAND_COLORS = [
  { name: "Neat Curb Green", value: "#1C7C20" },
  { name: "Navy",            value: "#1e3a5f" },
  { name: "Black",           value: "#111111" },
  { name: "Crimson",         value: "#c0392b" },
];

const DEFAULTS: TextFields = {
  headline: "Buffalo Homeowners – Your Lawn Is Handled",
  tagline:  "Landscape · Snow Removal · Property Maintenance",
  cta:      "Call (716) 241-1499 for a free quote",
};

// ─── Layer builder ────────────────────────────────────────────────────────────

function buildLayers(f: TextFields, style: Style, dur: number, brand: string): Layer[] {
  if (!dur || dur < 1) return [];

  const base = {
    color:      "#ffffff",
    bgColor:    "transparent",
    bold:       false,
    align:      "center" as const,
    fontFamily: "Arial, Helvetica, sans-serif",
    uppercase:  false,
  };

  if (style === "social-promo") return [
    { ...base, text: f.headline, startTime: 0.5,      endTime: dur * 0.52, x: 50, y: 42, fontSize: 56,
      bold: true, animation: "word-by-word", uppercase: true,
      fontFamily: "Impact, Arial Black, sans-serif", bgColor: "transparent" },
    { ...base, text: f.tagline,  startTime: dur * 0.50, endTime: dur * 0.80, x: 50, y: 85, fontSize: 21,
      animation: "slide-up",    bgColor: "rgba(0,0,0,0.58)" },
    { ...base, text: f.cta,      startTime: dur * 0.78, endTime: dur - 0.3,  x: 50, y: 88, fontSize: 25,
      bold: true, animation: "fade-in", bgColor: brand },
  ];

  if (style === "clean-caption") return [
    { ...base, text: f.headline, startTime: 0.4,       endTime: dur * 0.55, x: 50, y: 87, fontSize: 24,
      animation: "fade-in", bgColor: "rgba(0,0,0,0.62)" },
    { ...base, text: f.tagline,  startTime: dur * 0.53, endTime: dur * 0.85, x: 50, y: 87, fontSize: 24,
      animation: "fade-in", bgColor: "rgba(0,0,0,0.62)" },
    { ...base, text: f.cta,      startTime: dur * 0.83, endTime: dur - 0.3,  x: 50, y: 87, fontSize: 26,
      bold: true, animation: "slide-up", bgColor: brand },
  ];

  // announcement
  return [
    { ...base, text: f.headline, startTime: 0.8,       endTime: dur * 0.60, x: 50, y: 44, fontSize: 40,
      bold: true, animation: "fade-in", bgColor: "rgba(0,0,0,0.48)" },
    { ...base, text: f.tagline,  startTime: dur * 0.38, endTime: dur * 0.78, x: 50, y: 60, fontSize: 22,
      animation: "fade-in" },
    { ...base, text: f.cta,      startTime: dur * 0.76, endTime: dur - 0.3,  x: 50, y: 80, fontSize: 26,
      bold: true, animation: "slide-up", bgColor: brand },
  ];
}

// ─── Canvas drawing ───────────────────────────────────────────────────────────

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawVideoFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  cw: number,
  ch: number
) {
  // Black background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cw, ch);
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return;
  // Letterbox / pillarbox to fit canvas exactly
  const videoAR  = vw / vh;
  const canvasAR = cw / ch;
  let dx = 0, dy = 0, dw = cw, dh = ch;
  if (videoAR > canvasAR) { dh = cw / videoAR;  dy = (ch - dh) / 2; }
  else                    { dw = ch * videoAR;   dx = (cw - dw) / 2; }
  ctx.drawImage(video, dx, dy, dw, dh);
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  t: number,
  cw: number,
  ch: number
) {
  const elapsed  = t - layer.startTime;
  const layerDur = layer.endTime - layer.startTime;
  if (layerDur <= 0) return;

  let opacity = 1, offsetY = 0;
  if (layer.animation === "fade-in") {
    opacity = Math.min(1, elapsed / Math.min(0.45, layerDur * 0.28));
  } else if (layer.animation === "slide-up") {
    const p = Math.min(1, elapsed / Math.min(0.45, layerDur * 0.3));
    offsetY = (1 - p) * 30 * (ch / 480);
    opacity = p;
  } else if (layer.animation === "word-by-word") {
    const words = layer.text.split(" ");
    const count = Math.max(1, Math.ceil((elapsed / layerDur) * words.length));
    layer = { ...layer, text: words.slice(0, count).join(" ") };
  }
  if (layer.uppercase) layer = { ...layer, text: layer.text.toUpperCase() };

  const scale    = ch / 480;
  const fontSize = Math.round(layer.fontSize * scale);
  const pad      = Math.round(10 * scale);

  ctx.save();
  ctx.globalAlpha  = Math.max(0, Math.min(1, opacity));
  ctx.font         = `${layer.bold ? "bold " : ""}${fontSize}px ${layer.fontFamily}`;
  ctx.textAlign    = layer.align;
  ctx.textBaseline = "middle";

  const px   = (layer.x / 100) * cw;
  const py   = (layer.y / 100) * ch + offsetY;
  const maxW = cw * 0.88;
  const lines  = wrapText(ctx, layer.text, maxW);
  const lineH  = fontSize * 1.28;
  const totalH = lines.length * lineH;

  if (layer.bgColor && layer.bgColor !== "transparent") {
    ctx.fillStyle = layer.bgColor;
    let maxLW = 0;
    for (const ln of lines) maxLW = Math.max(maxLW, ctx.measureText(ln).width);
    const bgW = Math.min(maxLW + pad * 2.4, cw - 12 * scale);
    const bgX = layer.align === "center" ? px - bgW / 2
              : layer.align === "left"   ? px - pad
              : px - bgW + pad;
    const r   = Math.min(10 * scale, (totalH + pad * 1.4) / 2);
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: (...a: unknown[]) => void })
      .roundRect(bgX, py - totalH / 2 - pad * 0.7, bgW, totalH + pad * 1.4, r);
    ctx.fill();
  }

  ctx.shadowColor   = "rgba(0,0,0,0.9)";
  ctx.shadowBlur    = layer.bgColor === "transparent" ? 8 * scale : 0;
  ctx.shadowOffsetX = layer.bgColor === "transparent" ? 2 * scale : 0;
  ctx.shadowOffsetY = layer.bgColor === "transparent" ? 2 * scale : 0;
  ctx.fillStyle     = layer.color;
  lines.forEach((ln, i) => ctx.fillText(ln, px, py - totalH / 2 + i * lineH + lineH / 2, maxW));
  ctx.restore();
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function VideoEditorPage() {
  const [step,         setStep]         = useState<1 | 2 | 3 | 4>(1);
  const [videoUrl,     setVideoUrl]     = useState<string | null>(null);
  const [duration,     setDuration]     = useState(0);
  const [style,        setStyle]        = useState<Style>("social-promo");
  const [fields,       setFields]       = useState<TextFields>(DEFAULTS);
  const [brand,        setBrand]        = useState("#1C7C20");
  const [playing,      setPlaying]      = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [formatId,     setFormatId]     = useState("tiktok");
  const [exportPhase,  setExportPhase]  = useState<"idle" | "recording" | "converting" | "done">("idle");
  const [exportErr,    setExportErr]    = useState("");

  const videoRef     = useRef<HTMLVideoElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rafRef       = useRef<number>(0);

  const layers     = buildLayers(fields, style, duration, brand);
  const selFormat  = EXPORT_FORMATS.find((f) => f.id === formatId) ?? EXPORT_FORMATS[0];
  const exporting  = exportPhase === "recording" || exportPhase === "converting";

  // ── Canvas composite loop ─────────────────────────────────────────────────
  // Draws video frame + text overlays onto canvas. Canvas IS the player display.

  const drawFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const cont   = containerRef.current;

    if (canvas && cont) {
      // Keep canvas pixel resolution = native video resolution (sharp text)
      const nw = video?.videoWidth  || cont.clientWidth;
      const nh = video?.videoHeight || cont.clientHeight;
      if (canvas.width !== nw || canvas.height !== nh) {
        canvas.width  = nw;
        canvas.height = nh;
      }
    }

    if (canvas && video) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawVideoFrame(ctx, video, canvas.width, canvas.height);
        const t = video.currentTime;
        for (const layer of layers) {
          if (t >= layer.startTime && t <= layer.endTime) {
            drawLayer(ctx, layer, t, canvas.width, canvas.height);
          }
        }
      }
    }
    rafRef.current = requestAnimationFrame(drawFrame);
  }, [layers]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawFrame]);

  // ── Video events ──────────────────────────────────────────────────────────

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    const onTime = () => setCurrentTime(v.currentTime);
    const onMeta = () => { setDuration(v.duration); };
    const onEnd  = () => setPlaying(false);
    v.addEventListener("timeupdate",      onTime);
    v.addEventListener("loadedmetadata",  onMeta);
    v.addEventListener("ended",           onEnd);
    return () => {
      v.removeEventListener("timeupdate",     onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended",          onEnd);
    };
  }, [videoUrl]);

  // ── File upload ───────────────────────────────────────────────────────────

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(file));
    setExportPhase("idle");
    setExportErr("");
    setCurrentTime(0);
    setStep(2);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else          { v.play();  setPlaying(true); }
  };

  // ── Export ────────────────────────────────────────────────────────────────
  //  Phase 1 (client): Canvas composites video+text → MediaRecorder → WebM blob
  //  Phase 2 (server): POST WebM to /api/video-editor/convert → MP4 download

  const handleExport = async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setExportPhase("recording");
    setExportErr("");

    try {
      // ── Phase 1: record canvas as WebM ──
      const canvasStream = (canvas as HTMLCanvasElement & { captureStream(fps: number): MediaStream })
        .captureStream(30);
      const audioStream  = (video as HTMLVideoElement & { captureStream(fps: number): MediaStream })
        .captureStream(30);

      const combined = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9" : "video/webm";

      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(combined, { mimeType });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      await new Promise<void>((res) => { video.onseeked = () => res(); video.currentTime = 0; });
      recorder.start(100);
      video.play();
      setPlaying(true);
      await new Promise<void>((res) => { video.onended = () => res(); });
      await new Promise((res) => setTimeout(res, 400));
      recorder.stop();
      video.pause();
      setPlaying(false);
      await new Promise<void>((res) => { recorder.onstop = () => res(); });

      const webmBlob = new Blob(chunks, { type: "video/webm" });

      // ── Phase 2: convert to MP4 on server ──
      setExportPhase("converting");

      const form = new FormData();
      form.append("file",   webmBlob, "input.webm");
      form.append("width",  selFormat.width.toString());
      form.append("height", selFormat.height.toString());

      const res = await fetch("/api/video-editor/convert", { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? "Conversion failed.");
      }

      const mp4Blob    = await res.blob();
      const downloadUrl = URL.createObjectURL(mp4Blob);
      const a          = document.createElement("a");
      a.href           = downloadUrl;
      a.download       = `neat-curb-${selFormat.width}x${selFormat.height}.mp4`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);

      setExportPhase("done");

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed.";
      setExportErr(msg);
      setExportPhase("idle");
    }
  };

  const restart = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setDuration(0);
    setCurrentTime(0);
    setPlaying(false);
    setExportPhase("idle");
    setExportErr("");
    setFields(DEFAULTS);
    setStyle("social-promo");
    setBrand("#1C7C20");
    setFormatId("tiktok");
    setStep(1);
  };

  // ─── UI ───────────────────────────────────────────────────────────────────

  // Hidden video — source only; canvas is the actual display
  const hiddenVideo = (
    <video
      ref={videoRef}
      src={videoUrl ?? undefined}
      playsInline
      preload="auto"
      style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
    />
  );

  // ── Step 1: Upload ────────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="panel" style={{ position: "relative" }}>
      {hiddenVideo}
      <SectionHeader
        title="Video Editor"
        subtitle="Upload a clip, pick a vibe, type your message — your finished video downloads in under a minute."
      />
      <div
        className="ve-upload-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Film size={52} className="ve-upload-icon" />
        <div className="ve-upload-title">Drop your video here</div>
        <div className="note" style={{ marginTop: 6 }}>or click to browse</div>
        <div className="note ve-upload-hint">MP4 · MOV · WebM · Any length · Shot on your phone is perfect</div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
    </div>
  );

  // ── Step 2: Style picker ──────────────────────────────────────────────────
  if (step === 2) return (
    <div className="panel">
      {hiddenVideo}
      <SectionHeader
        title="Choose a Style"
        subtitle="Pick how your text overlays look and animate. You can always go back."
      />
      <div className="ve-style-grid">
        {STYLES.map((s) => (
          <button
            key={s.id}
            className={`ve-style-card ${style === s.id ? "active" : ""}`}
            onClick={() => setStyle(s.id)}
          >
            <div className="ve-style-icon">{s.icon}</div>
            <div className="ve-style-name">{s.name}</div>
            <div className="ve-style-desc">{s.desc}</div>
            {style === s.id && <div className="ve-style-check">✓ Selected</div>}
          </button>
        ))}
      </div>
      <div className="ve-nav-row">
        <button className="btn-outline" onClick={() => setStep(1)}><ChevronLeft size={14} /> Back</button>
        <button className="btn-primary"  onClick={() => setStep(3)}>Next — Add Your Text <ChevronRight size={14} /></button>
      </div>
    </div>
  );

  // ── Step 3: Text fields ───────────────────────────────────────────────────
  if (step === 3) return (
    <div className="panel">
      {hiddenVideo}
      <SectionHeader
        title="Add Your Text"
        subtitle="Fill in what you want to say — the app handles all the animation and timing."
      />
      <div className="ve-fields-form">
        <div className="ve-field-group">
          <label className="ve-label">
            🔥 Main Headline
            <span className="note ve-label-hint">— the big bold text that grabs attention first</span>
          </label>
          <input
            className="ve-input"
            value={fields.headline}
            onChange={(e) => setFields({ ...fields, headline: e.target.value })}
            placeholder="Buffalo Homeowners – Your Lawn Is Handled"
          />
        </div>
        <div className="ve-field-group">
          <label className="ve-label">
            📝 Tagline
            <span className="note ve-label-hint">— what you do in a few words</span>
          </label>
          <input
            className="ve-input"
            value={fields.tagline}
            onChange={(e) => setFields({ ...fields, tagline: e.target.value })}
            placeholder="Landscape · Snow Removal · Property Maintenance"
          />
        </div>
        <div className="ve-field-group">
          <label className="ve-label">
            📣 Call to Action
            <span className="note ve-label-hint">— how to reach you, shown at the end</span>
          </label>
          <input
            className="ve-input"
            value={fields.cta}
            onChange={(e) => setFields({ ...fields, cta: e.target.value })}
            placeholder="Call (716) 241-1499 for a free quote"
          />
        </div>
        <div className="ve-field-group">
          <label className="ve-label">🎨 Button / Accent Color</label>
          <div className="ve-color-row">
            {BRAND_COLORS.map((c) => (
              <button
                key={c.value}
                className={`ve-color-swatch ${brand === c.value ? "active" : ""}`}
                style={{ background: c.value }}
                title={c.name}
                onClick={() => setBrand(c.value)}
              />
            ))}
            <label className="ve-color-custom-wrap" title="Pick a custom color">
              <span className="ve-color-custom-icon" style={{ background: brand }} />
              <input
                type="color"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{ opacity: 0, position: "absolute", width: 0, height: 0 }}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="ve-nav-row">
        <button className="btn-outline" onClick={() => setStep(2)}><ChevronLeft size={14} /> Back</button>
        <button className="btn-primary"  onClick={() => setStep(4)}>Choose Export Format <ChevronRight size={14} /></button>
      </div>
    </div>
  );

  // ── Step 4: Format + Preview + Export ─────────────────────────────────────
  return (
    <div className="panel">
      {hiddenVideo}
      <SectionHeader
        title="Export Your Video"
        subtitle="Pick where you're posting it — the app exports the right size and quality as an MP4."
        action={
          <button className="btn-outline" onClick={() => setStep(3)}>
            <ChevronLeft size={14} /> Edit Text
          </button>
        }
      />

      {/* Format grid */}
      <div className="ve-format-grid">
        {EXPORT_FORMATS.map((f) => (
          <button
            key={f.id}
            className={`ve-format-card ${formatId === f.id ? "active" : ""}`}
            onClick={() => setFormatId(f.id)}
          >
            <div className="ve-format-top">
              <span className="ve-format-icon">{f.icon}</span>
              {f.popular && <span className="ve-format-badge">Most Used</span>}
            </div>
            <div className="ve-format-label">{f.label}</div>
            <div className="ve-format-dims">{f.dims}</div>
            <div className="ve-format-platforms">{f.platforms}</div>
            <div className="ve-format-note">{f.note}</div>
          </button>
        ))}
      </div>

      {/* Export status messages */}
      {exportPhase === "recording" && (
        <div className="ve-export-notice">
          <Loader2 size={16} className="ve-spin-icon" />
          <span><strong>Step 1 of 2:</strong> Playing through your video to capture the overlays — keep this tab open.</span>
        </div>
      )}
      {exportPhase === "converting" && (
        <div className="ve-export-notice ve-export-notice--blue">
          <Loader2 size={16} className="ve-spin-icon" />
          <span><strong>Step 2 of 2:</strong> Converting to MP4 at {selFormat.dims} — almost done.</span>
        </div>
      )}
      {exportPhase === "done" && !exportErr && (
        <div className="ve-export-success">
          <CheckCircle2 size={16} />
          <span>
            <strong>MP4 downloaded!</strong> Your {selFormat.dims} file is ready to upload directly to {selFormat.platforms.split(" · ")[0]}.
          </span>
          <button className="btn-outline" style={{ marginLeft: "auto" }} onClick={restart}>
            <RotateCcw size={13} /> New Video
          </button>
        </div>
      )}
      {exportErr && (
        <div className="ve-export-error">
          Something went wrong: {exportErr} — try again or use a shorter clip.
        </div>
      )}

      {/* Preview area */}
      <div className="ve-preview-wrap">
        <div className="ve-preview-container" ref={containerRef}>
          <canvas ref={canvasRef} className="ve-canvas-player" />
        </div>

        {/* Controls */}
        <div className="ve-controls">
          <button className="ve-play-btn" onClick={togglePlay} disabled={exporting}>
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.033}
            value={currentTime}
            onChange={(e) => {
              const t = parseFloat(e.target.value);
              if (videoRef.current) videoRef.current.currentTime = t;
              setCurrentTime(t);
            }}
            className="ve-scrubber"
            disabled={exporting}
          />
          <span className="ve-time">{fmt(currentTime)} / {fmt(duration)}</span>
        </div>

        {/* Export button */}
        <button
          className="btn-primary ve-export-main-btn"
          onClick={handleExport}
          disabled={exporting || exportPhase === "done"}
        >
          {exportPhase === "recording"  ? <><Loader2 size={15} className="ve-spin-icon" /> Capturing…</>
          : exportPhase === "converting" ? <><Loader2 size={15} className="ve-spin-icon" /> Converting to MP4…</>
          : exportPhase === "done"       ? <><CheckCircle2 size={15} /> Downloaded!</>
          : <><Download size={15} /> Export as MP4 — {selFormat.dims}</>}
        </button>
      </div>

      {/* Layer timing summary */}
      <div className="ve-layer-summary">
        <div className="ve-layer-summary-title">What you&apos;ll see in this video</div>
        {layers.map((l, i) => (
          <div key={i} className="ve-layer-row">
            <span className="ve-layer-dot" style={{ background: i === 2 ? brand : "#aaa" }} />
            <span className="ve-layer-text">{l.text}</span>
            <span className="ve-layer-time">{fmt(l.startTime)} → {fmt(l.endTime)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
