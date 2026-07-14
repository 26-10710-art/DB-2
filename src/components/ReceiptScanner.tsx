import React, { useState, useRef } from "react";
import { Upload, Camera, FileText, Image as ImageIcon, Sparkles, Check, Play, ShieldAlert, Loader } from "lucide-react";
import { ReceiptItem } from "../types";

interface ReceiptScannerProps {
  onAnalysisComplete: (items: ReceiptItem[], source: string) => void;
}

export default function ReceiptScanner({ onAnalysisComplete }: ReceiptScannerProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample templates to test instantly
  const sampleTemplates = [
    {
      id: "beef",
      title: "🥩 한우 축산물 정육 마트",
      description: "한우 등심, 수입 아보카도, 대용량 페트병 탄산음료",
      accent: "border-red-200 bg-red-50/50 hover:border-red-400 text-red-950",
      iconColor: "text-red-600"
    },
    {
      id: "eco",
      title: "🌱 싱그러운 초록 유기농 매장",
      description: "국산 두부, 시금치 한 단, 대나무 칫솔, 빗물 저장 텀블러",
      accent: "border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 text-emerald-950",
      iconColor: "text-emerald-600"
    },
    {
      id: "mixed",
      title: "🛒 동네 패밀리 마트 (혼합)",
      description: "닭가슴살, 라면 멀티팩, 무농약 친환경 토마토",
      accent: "border-yellow-200 bg-yellow-50/50 hover:border-yellow-400 text-yellow-950",
      iconColor: "text-amber-600"
    }
  ];

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // File processing to base64
  const processFile = (file: File) => {
    setErrorMsg("");
    if (!file.type.startsWith("image/")) {
      setErrorMsg("이미지 파일(.jpg, .png, .webp 등)만 업로드할 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMsg("파일을 읽는 도중 오류가 발생했습니다.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Camera stream controls
  const startCamera = async () => {
    setCameraError("");
    setErrorMsg("");
    setShowCamera(true);
    setImagePreview(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError("카메라를 실행할 수 없습니다. 권한이 거부되었거나 사용 중인 카메라가 없을 수 있습니다.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImagePreview(dataUrl);
        stopCamera();
      }
    }
  };

  // Submit to Express backend to run Gemini receipt analysis
  const handleAnalyze = async (sampleType?: string) => {
    setIsAnalyzing(true);
    setErrorMsg("");

    try {
      const isSample = !!sampleType;
      
      if (isSample) {
        setAnalysisStep("샘플 데이터를 정리하는 중...");
      } else {
        setAnalysisStep("영수증 이미지를 압축 및 인코딩 중...");
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (!isSample) {
        setAnalysisStep("인공지능 모델(Gemini 3.5 Flash)에 이미지를 분석 요청 중...");
      } else {
        setAnalysisStep(`'${sampleType === "eco" ? "친환경" : sampleType === "beef" ? "고탄소" : "일반 혼합"}' 가상 영수증 데이터 생성 중...`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isSample) {
        setAnalysisStep("식재료 및 공산품 명칭, 수량, 가격을 매칭 중...");
      } else {
        setAnalysisStep("탄소 배출량 점수 및 교육 가이드라인 연산 중...");
      }

      await new Promise(resolve => setTimeout(resolve, 900));
      
      if (!isSample) {
        setAnalysisStep("글로벌 환경 통계 기반 각 품목별 이산화탄소 저감 수준을 분석 중...");
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // POST request to Express endpoint
      const response = await fetch("/api/analyze-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSample 
            ? { useSample: true, sampleType } 
            : { image: imagePreview }
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "영수증 분석 중 문제가 발생했습니다.");
      }

      const result = await response.json();
      
      if (result.success) {
        onAnalysisComplete(result.items, result.source);
      } else {
        throw new Error("분석 결과가 유효하지 않습니다.");
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "분석 요청 중 예기치 못한 에러가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Title */}
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-1.5">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          영수증 탄소 분석기
        </h3>
        <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
          장 보신 영수증을 직접 촬영하여 올리거나 준비된 가상 마트의 영수증을 선택해 보세요. Gemini AI가 스마트하게 품목을 적출해 포인트를 산정합니다.
        </p>
      </div>

      {isAnalyzing ? (
        /* Loader block */
        <div className="bg-white rounded-3xl p-10 border border-slate-150 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-96">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-150 relative">
            <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10 animate-ping pointer-events-none" />
          </div>
          
          <div className="space-y-2 max-w-sm">
            <h4 className="font-bold text-slate-900 text-sm">영수증 정밀 판독 중...</h4>
            <p className="text-xs text-slate-500 leading-relaxed min-h-10 animate-pulse">
              {analysisStep}
            </p>
          </div>

          <div className="text-[10px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-150 font-mono">
            Gemini 3.5 Flash Model Connected
          </div>
        </div>
      ) : (
        /* UI container */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Capture or Upload (7 cols) */}
          <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-slate-600" />
              실제 영수증 촬영 및 업로드
            </h4>

            {errorMsg && (
              <div className="bg-red-50 text-red-800 text-xs p-3 rounded-xl border border-red-150 flex gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Camera View Mode */}
            {showCamera && (
              <div className="space-y-3">
                <div className="aspect-[4/3] w-full bg-black rounded-2xl overflow-hidden relative border border-slate-200">
                  <video
                    ref={videoRef}
                    playsInline
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                  <div className="absolute inset-0 border-[24px] border-black/40 pointer-events-none flex items-center justify-center">
                    <div className="border border-white/60 w-full h-full border-dashed" />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={captureSnapshot}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all text-xs cursor-pointer"
                  >
                    사진 찍기
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-slate-100 hover:bg-slate-150 text-slate-600 font-bold py-2.5 px-4 rounded-xl transition-all text-xs cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* Default Upload Box & Image preview */}
            {!showCamera && (
              <div className="space-y-4">
                {imagePreview ? (
                  /* Previewing uploaded image */
                  <div className="space-y-3">
                    <div className="aspect-[4/3] w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center p-2 relative group">
                      <img
                        src={imagePreview}
                        alt="Receipt preview"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                      <button
                        onClick={() => setImagePreview(null)}
                        className="absolute top-3 right-3 bg-red-600 text-white text-xxs font-bold p-1 px-2.5 rounded-full shadow hover:bg-red-700 transition-all cursor-pointer"
                      >
                        이미지 변경
                      </button>
                    </div>

                    <button
                      onClick={() => handleAnalyze()}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer text-xs"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Gemini AI로 정밀 분석하기</span>
                    </button>
                  </div>
                ) : (
                  /* Draggable upload box */
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-[4/3] ${
                      dragActive
                        ? "border-emerald-500 bg-emerald-50/20"
                        : "border-slate-250 hover:border-slate-450 hover:bg-slate-50/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm mb-3">
                      <Upload className="w-5 h-5 text-slate-500" />
                    </div>

                    <p className="text-xs font-bold text-slate-800">
                      여기에 영수증 사진 드래그 또는 클릭
                    </p>
                    <p className="text-xxs text-slate-400 max-w-xs mt-1 leading-relaxed">
                      마트에서 지불하고 남은 흰색 영수증 영수증 글자가 똑바로 드러나게 촬영해주시면 인식률이 극대화됩니다.
                    </p>

                    <div className="relative w-full my-4">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-150"></div></div>
                      <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400">또는</span></div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera();
                      }}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 font-semibold py-2 px-4 rounded-xl transition-all text-xxs cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>모바일/PC 카메라 촬영하기</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Instant Preset Samples (5 cols) */}
          <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-600" />
                샘플 영수증으로 간편히 테스트
              </h4>
              <p className="text-xxs text-slate-400 mt-1 leading-relaxed">
                현재 분석할 수 있는 촬영된 실물 영수증이 없으신가요? 3가지 성격의 가상 마트 영수증으로 탄소 저감 연산을 바로 체험해보세요.
              </p>
            </div>

            <div className="space-y-3">
              {sampleTemplates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleAnalyze(tmpl.id)}
                  className={`w-full text-left p-4 rounded-2xl border text-slate-800 hover:shadow-md transition-all flex items-start gap-3 cursor-pointer ${tmpl.accent}`}
                >
                  <div className={`w-10 h-10 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm ${tmpl.iconColor}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-xs">{tmpl.title}</p>
                    <p className="text-xxs opacity-80 leading-relaxed">{tmpl.description}</p>
                    <div className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-slate-500 bg-white/70 border px-1.5 py-0.5 rounded-full">
                      원클릭 분석 시작 →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camera elements */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
