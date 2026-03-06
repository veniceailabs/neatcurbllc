"use client";

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

export type SignaturePadHandle = {
  getSignatureData: () => string | null; // base64 PNG or null if empty
  clear: () => void;
  isEmpty: () => boolean;
};

type Props = {
  width?: number;
  height?: number;
  lineColor?: string;
  lineWidth?: number;
};

const SignaturePad = forwardRef<SignaturePadHandle, Props>(
  ({ width = 560, height = 160, lineColor = "#1C7C20", lineWidth = 2.5 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing   = useRef(false);
    const hasStrokes = useRef(false);

    const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

    const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e) {
        const t = e.touches[0];
        return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
      }
      return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    };

    const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      const ctx    = getCtx();
      if (!canvas || !ctx) return;
      e.preventDefault();
      drawing.current = true;
      const { x, y } = getPos(e, canvas);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }, []);

    const draw = useCallback((e: MouseEvent | TouchEvent) => {
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      const ctx    = getCtx();
      if (!canvas || !ctx) return;
      e.preventDefault();
      hasStrokes.current = true;
      const { x, y } = getPos(e, canvas);
      ctx.lineTo(x, y);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth   = lineWidth;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.stroke();
    }, [lineColor, lineWidth]);

    const endDraw = useCallback(() => { drawing.current = false; }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.addEventListener("mousedown",  startDraw);
      canvas.addEventListener("mousemove",  draw);
      canvas.addEventListener("mouseup",    endDraw);
      canvas.addEventListener("mouseleave", endDraw);
      canvas.addEventListener("touchstart", startDraw, { passive: false });
      canvas.addEventListener("touchmove",  draw,      { passive: false });
      canvas.addEventListener("touchend",   endDraw);
      return () => {
        canvas.removeEventListener("mousedown",  startDraw);
        canvas.removeEventListener("mousemove",  draw);
        canvas.removeEventListener("mouseup",    endDraw);
        canvas.removeEventListener("mouseleave", endDraw);
        canvas.removeEventListener("touchstart", startDraw);
        canvas.removeEventListener("touchmove",  draw);
        canvas.removeEventListener("touchend",   endDraw);
      };
    }, [startDraw, draw, endDraw]);

    useImperativeHandle(ref, () => ({
      getSignatureData: () => {
        if (!hasStrokes.current) return null;
        return canvasRef.current?.toDataURL("image/png") ?? null;
      },
      clear: () => {
        const ctx = getCtx();
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          hasStrokes.current = false;
        }
      },
      isEmpty: () => !hasStrokes.current,
    }));

    return (
      <div className="sig-pad-wrap">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="sig-pad-canvas"
          aria-label="Signature pad — draw your signature here"
        />
        <p className="sig-pad-hint">Draw your signature above</p>
      </div>
    );
  }
);
SignaturePad.displayName = "SignaturePad";
export default SignaturePad;
