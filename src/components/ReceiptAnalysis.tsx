import React from "react";
import { Leaf, Coins, Check, AlertTriangle, RefreshCw, FileText, HelpCircle, ArrowRight } from "lucide-react";
import { ReceiptItem } from "../types";

interface ReceiptAnalysisProps {
  items: ReceiptItem[];
  source: string;
  onClaimPoints: (pointsGained: number) => void;
  onReset: () => void;
}

export default function ReceiptAnalysis({ items, source, onClaimPoints, onReset }: ReceiptAnalysisProps) {
  // Calculate aggregate metrics
  const totalCost = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalPoints = items.reduce((sum, item) => sum + (item.pointImpact || 0), 0);

  const lowCarbonCount = items.filter((i) => i.carbonLevel === "low").length;
  const highCarbonCount = items.filter((i) => i.carbonLevel === "high").length;

  const isNetPositive = totalPoints >= 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Top success alert */}
      <div className={`p-5 rounded-3xl border text-center space-y-2 ${
        isNetPositive 
          ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
          : "bg-amber-50 border-amber-200 text-amber-950"
      }`}>
        <div className="text-3xl">{isNetPositive ? "🌿" : "⚠️"}</div>
        <h3 className="text-lg font-bold">
          {isNetPositive 
            ? "훌륭해요! 친환경 쇼핑을 실천하셨군요!" 
            : "앗! 이번 장보기는 고탄소 소비 비중이 높습니다"}
        </h3>
        <p className="text-xs max-w-2xl mx-auto leading-relaxed opacity-90">
          {isNetPositive 
            ? "식물성 대체재, 로컬 야채, 지속 가능한 친환경 소비재가 가득합니다. 탄소 포인트를 모아 마을을 더 활기차게 꾸며주세요!"
            : "소고기 등 축산 가공물과 장거리 운송 푸드 마일리지가 높은 수입품 등으로 인해 포인트가 차감될 위기입니다. 점차 저탄소 품목으로 바꾸어 나가요."}
        </p>
      </div>

      {/* Grid Layout: Left is printed Receipt, Right is Eco Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Monospace printed Receipt (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-250 rounded-2xl shadow-sm overflow-hidden relative font-mono text-xs text-slate-800 p-6 flex flex-col justify-between min-h-[480px]">
          {/* Jagged paper effect simulation on top and bottom */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(45deg,transparent_33.333%,#f3f4f6_33.333%,#f3f4f6_66.667%,transparent_66.667%),linear-gradient(-45deg,transparent_33.333%,#f3f4f6_33.333%,#f3f4f6_66.667%,transparent_66.667%)] [background-size:8px_8px] bg-repeat-x" />

          <div className="space-y-6">
            <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
              <h4 className="font-bold text-slate-900 text-sm tracking-widest uppercase">ECO RECEIPT</h4>
              <p className="text-[10px] text-slate-400">지구를 위한 소비 영수증</p>
              <p className="text-[9px] text-slate-400">발행일자: 2026.07.14</p>
            </div>

            {/* Receipt Items list */}
            <div className="space-y-4">
              <div className="flex justify-between font-bold text-slate-500 text-[10px] pb-1 border-b border-slate-150">
                <span>품목명 (ITEM)</span>
                <div className="flex gap-4">
                  <span>수량</span>
                  <span>금액 (KRW)</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[160px] text-slate-900 font-sans font-medium">{item.name}</span>
                    <div className="flex gap-6 shrink-0 font-mono">
                      <span className="text-slate-400">x{item.quantity}</span>
                      <span className="font-bold text-slate-800">₩{(item.price || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-dashed border-slate-300 mt-6">
            <div className="space-y-1.5 text-[11px] text-slate-500">
              <div className="flex justify-between">
                <span>과세 물품 공급가액:</span>
                <span>₩{Math.round(totalCost * 0.9).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>부가가치세 (10%):</span>
                <span>₩{Math.round(totalCost * 0.1).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-sm text-slate-950 pt-2 border-t border-slate-200 font-sans">
              <span>합계 금액 (TOTAL):</span>
              <span className="font-mono text-emerald-700">₩{totalCost.toLocaleString()}</span>
            </div>

            <div className="text-center text-[9px] text-slate-400 border-t border-dashed border-slate-200 pt-3 leading-relaxed font-mono">
              <p>기계 학습 및 분석 소스: {source === "gemini" ? "AI(Gemini-3.5)" : "테스트 시뮬레이션"}</p>
              <p>감사합니다. 저탄소 마을 건설에 동참해주세요.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Eco Carbon Analysis Report (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main report card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-600" />
                탄소 지능적 평가 분석 보고서
              </h4>
              <span className="bg-slate-100 text-slate-600 text-xxs font-bold px-2 py-0.5 rounded-full">
                정밀 검정 완료
              </span>
            </div>

            {/* Specific analysis list */}
            <div className="space-y-3">
              {items.map((item, idx) => {
                const isLow = item.carbonLevel === "low";
                const isHigh = item.carbonLevel === "high";

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isLow 
                        ? "border-emerald-100 bg-emerald-50/10" 
                        : isHigh 
                          ? "border-red-100 bg-red-50/10" 
                          : "border-slate-150 bg-slate-50/30"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isLow 
                              ? "bg-emerald-100 text-emerald-800" 
                              : isHigh 
                                ? "bg-red-100 text-red-800" 
                                : "bg-slate-100 text-slate-700"
                          }`}>
                            {isLow ? "저탄소 에코" : isHigh ? "고탄소 경고" : "일반 탄소"}
                          </span>
                        </div>
                        <p className="text-xxs text-slate-500 leading-relaxed">
                          {item.carbonReason}
                        </p>
                      </div>

                      {/* Point impact badge */}
                      <span className={`font-mono text-xs font-bold px-2 py-1 rounded-xl shrink-0 ${
                        item.pointImpact >= 0 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {item.pointImpact >= 0 ? `+${item.pointImpact}` : item.pointImpact} P
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Final Points Claim Section */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <span className="text-xxs text-slate-500 font-bold block">환산된 에코 포인트 결과</span>
                  <span className="text-xs font-bold text-slate-800">
                    이번 영수증 총합 포인트 변동: 
                    <span className={`font-mono font-black text-sm ml-1.5 ${totalPoints >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {totalPoints >= 0 ? `+${totalPoints}` : totalPoints} P
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => onClaimPoints(totalPoints)}
                  className="flex-1 md:flex-initial bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>내 계정에 정산하기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                
                <button
                  onClick={onReset}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold py-2.5 px-3 rounded-xl transition-all text-xs cursor-pointer"
                  title="다시 스캔하기"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
