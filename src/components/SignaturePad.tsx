"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas from "react-signature-canvas";

export interface SignaturePadHandle {
  toDataURL: () => string;
  isEmpty: () => boolean;
  clear: () => void;
}

interface SignaturePadProps {
  onClear?: () => void;
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ onClear }, ref) {
    const canvasRef = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      toDataURL: () => canvasRef.current?.toDataURL() ?? "",
      isEmpty: () => canvasRef.current?.isEmpty() ?? true,
      clear: () => {
        canvasRef.current?.clear();
        onClear?.();
      },
    }));

    return (
      <div className="space-y-1">
        <div className="border-2 border-dashed border-gray-300 rounded-md bg-white relative">
          <SignatureCanvas
            ref={canvasRef}
            penColor="#1e1e2e"
            canvasProps={{
              className: "w-full rounded-md",
              style: { height: 140 },
            }}
          />
          {/* Placeholder text — hidden once user starts drawing */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-gray-300 text-sm font-medium tracking-widest uppercase">
              Sign or Draw Mark Here
            </span>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              canvasRef.current?.clear();
              onClear?.();
            }}
            className="text-sm text-indigo-600 hover:underline"
          >
            Clear Canvas
          </button>
        </div>
      </div>
    );
  }
);
