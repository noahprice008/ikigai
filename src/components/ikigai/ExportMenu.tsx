import { useCallback, useRef, useState } from "react";
import { Download, Printer, Share2, Check } from "lucide-react";
import { VENN } from "@/lib/ikigai";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ExportMenu({ svgRef }: { svgRef: React.RefObject<SVGSVGElement | null> }) {
  const [status, setStatus] = useState<"idle" | "copied" | "downloaded">("idle");
  const busyRef = useRef(false);

  const svgToPng = useCallback(async () => {
    const svg = svgRef.current;
    if (!svg) return null;
    const serializer = new XMLSerializer();
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(VENN.size));
    clone.setAttribute("height", String(VENN.size));
    const source = serializer.serializeToString(clone);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.src = url;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
    });
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = VENN.size * scale;
    canvas.height = VENN.size * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    return canvas.toDataURL("image/png");
  }, [svgRef]);

  const downloadPng = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const dataUrl = await svgToPng();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `ikigai-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      setStatus("downloaded");
      await sleep(1500);
      setStatus("idle");
    } finally {
      busyRef.current = false;
    }
  }, [svgToPng]);

  const printMap = useCallback(() => {
    window.print();
  }, []);

  const shareMap = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const dataUrl = await svgToPng();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "ikigai.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My Ikigai Map",
          text: "A quiet reflection on what makes life worth living.",
          files: [file],
        });
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setStatus("copied");
        await sleep(1500);
        setStatus("idle");
      }
    } finally {
      busyRef.current = false;
    }
  }, [svgToPng]);

  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        onClick={downloadPng}
        className="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-full border bg-card px-2 text-center text-xs font-semibold shadow-soft transition-colors hover:bg-accent hover:text-accent-foreground sm:h-9 sm:min-h-0 sm:px-3"
      >
        {status === "downloaded" ? <Check className="size-3.5" /> : <Download className="size-3.5" />}
        Save image
      </button>
      <button
        type="button"
        onClick={printMap}
        className="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-full border bg-card px-2 text-center text-xs font-semibold shadow-soft transition-colors hover:bg-accent hover:text-accent-foreground sm:h-9 sm:min-h-0 sm:px-3"
      >
        <Printer className="size-3.5" />
        Print / PDF
      </button>
      <button
        type="button"
        onClick={shareMap}
        className="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-full border bg-card px-2 text-center text-xs font-semibold shadow-soft transition-colors hover:bg-accent hover:text-accent-foreground sm:h-9 sm:min-h-0 sm:px-3"
      >
        {status === "copied" ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
        {status === "copied" ? "Copied" : "Share"}
      </button>
    </div>
  );
}
