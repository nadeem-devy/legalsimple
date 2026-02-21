"use client";

import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eraser, Check, X } from "lucide-react";

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
  existingSignature?: string | null;
  petitionerName: string;
}

export function SignaturePad({
  isOpen,
  onClose,
  onSave,
  existingSignature,
  petitionerName,
}: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [useExisting, setUseExisting] = useState(false);

  useEffect(() => {
    if (isOpen && existingSignature) {
      setUseExisting(true);
    }
  }, [isOpen, existingSignature]);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
    setUseExisting(false);
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      setIsEmpty(sigCanvas.current.isEmpty());
    }
  };

  const save = () => {
    if (useExisting && existingSignature) {
      onSave(existingSignature);
    } else if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      onSave(dataUrl);
    }
  };

  const useExistingSignature = () => {
    if (existingSignature) {
      onSave(existingSignature);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sign Document</DialogTitle>
          <DialogDescription>
            Please sign below to verify the petition. Your signature will be saved for future use.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Petitioner Name */}
          <div className="text-sm text-slate-600">
            Signing as: <span className="font-semibold text-slate-900">{petitionerName}</span>
          </div>

          {/* Existing Signature Option */}
          {existingSignature && !useExisting && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">You have a saved signature:</p>
              <div className="bg-white border rounded p-2 mb-2">
                <img
                  src={existingSignature}
                  alt="Existing signature"
                  className="max-h-16 mx-auto"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={useExistingSignature}
                className="w-full"
              >
                Use This Signature
              </Button>
            </div>
          )}

          {/* Signature Canvas */}
          {!useExisting && (
            <>
              <div className="border-2 border-dashed border-slate-300 rounded-lg bg-white">
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    className: "w-full h-40 cursor-crosshair",
                    style: { width: "100%", height: "160px" },
                  }}
                  backgroundColor="white"
                  penColor="black"
                  onEnd={handleEnd}
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                Draw your signature in the box above
              </p>
            </>
          )}

          {useExisting && existingSignature && (
            <div className="border-2 border-green-300 rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-800 mb-2 text-center">Using saved signature:</p>
              <div className="bg-white border rounded p-2">
                <img
                  src={existingSignature}
                  alt="Selected signature"
                  className="max-h-20 mx-auto"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseExisting(false)}
                className="w-full mt-2 text-slate-600"
              >
                Draw New Signature Instead
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {!useExisting && (
            <Button variant="outline" onClick={clear} className="gap-1">
              <Eraser className="h-4 w-4" />
              Clear
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={!useExisting && isEmpty}
            className="gap-1"
          >
            <Check className="h-4 w-4" />
            Sign & Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
