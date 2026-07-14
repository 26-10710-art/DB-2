import React, { useState } from "react";
import { Leaf, ShoppingBag, Coins, ShieldAlert, Sparkles, Check, Play } from "lucide-react";
import { UserProfile, DecorationItem } from "../types";
import { DECORATIONS_CATALOG } from "../decorations";

interface ShopScreenProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onNavigateToVillage: () => void;
}

export default function ShopScreen({ user, onUpdateUser, onNavigateToVillage }: ShopScreenProps) {
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  const categories = [
    { key: "all", label: "전체 품목" },
    { key: "nature", label: "🌱 자연/식생" },
    { key: "energy", label: "☀️ 무공해 에너지" },
    { key: "waste", label: "♻️ 자원 순환" },
    { key: "living", label: "🏡 제로 라이프" },
    { key: "transport", label: "🚲 지속 가능 교통" }
  ];

  // Filter items
  const filteredCatalog = DECORATIONS_CATALOG.filter((item) => {
    if (activeCategoryFilter === "all") return true;
    return item.category === activeCategoryFilter;
  });

  // Calculate inventory counts
  const getInventoryCount = (itemId: string) => {
    return user.unlockedDecorations.filter((id) => id === itemId).length;
  };

  const getPlacedCount = (itemId: string) => {
    return user.placedDecorations.filter((placed) => placed.itemId === itemId).length;
  };

  // Handle Buy
  const handlePurchase = (item: DecorationItem) => {
    setErrorMsg("");
    setSuccessMsg("");

    if (user.points < item.price) {
      setErrorMsg(`포인트가 부족합니다! 현재 부족 포인트: ${item.price - user.points}p. 영수증을 분석하여 친환경 포인트를 충전하세요.`);
      return;
    }

    // Purchase successful
    const updatedUser: UserProfile = {
      ...user,
      points: user.points - item.price,
      unlockedDecorations: [...user.unlockedDecorations, item.id],
    };

    onUpdateUser(updatedUser);
    setSuccessMsg(`축하합니다! '${item.name}' 장비를 성공적으로 구매해 보관함에 넣었습니다. 에코 맵으로 이동해 배치하세요!`);

    // Auto-clear success message
    setTimeout(() => {
      setSuccessMsg("");
    }, 5000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Shop top billing card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              마을 꾸미기 에코 상점
            </h3>
            <p className="text-xs text-slate-500">지구를 살리는 저탄소 소비 습관으로 모은 에코 포인트로 마을에 심을 생태계를 구입하세요.</p>
          </div>
        </div>

        {/* User wallet balance */}
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl shadow-sm shrink-0">
          <Coins className="w-5 h-5 text-amber-600 animate-pulse" />
          <div className="text-right">
            <span className="text-[10px] text-amber-700 block font-bold">보유 포인트</span>
            <span className="font-mono text-lg font-bold text-slate-950">{user.points} <span className="text-sm font-sans">P</span></span>
          </div>
        </div>
      </div>

      {/* Banner message block */}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 text-xs p-4 rounded-2xl border border-emerald-150 flex items-start justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">{successMsg}</p>
              <button
                type="button"
                onClick={onNavigateToVillage}
                className="text-emerald-700 underline font-bold text-xxs hover:text-emerald-900 block"
              >
                지금 배치하러 에코타운으로 이동하기 →
              </button>
            </div>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-emerald-600 font-bold">×</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-800 text-xs p-4 rounded-2xl border border-red-150 flex items-start justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <p className="font-semibold">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-red-400 hover:text-red-600 font-bold">×</button>
        </div>
      )}

      {/* Categories Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategoryFilter(cat.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategoryFilter === cat.key
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Shop items layout - grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCatalog.map((item) => {
          const count = getInventoryCount(item.id);
          const placed = getPlacedCount(item.id);
          const inStorage = count - placed;
          const isAffordable = user.points >= item.price;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isAffordable 
                  ? "border-slate-150 hover:border-emerald-300 hover:shadow-md" 
                  : "border-slate-150 opacity-80"
              }`}
            >
              <div className="space-y-3.5">
                {/* Header item */}
                <div className="flex justify-between items-start">
                  <div className="text-3xl bg-slate-50 border border-slate-100 p-2.5 rounded-2xl select-none">
                    {item.emoji}
                  </div>
                  
                  {/* Category badge */}
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
                    {item.category === "nature" ? "식생림" : item.category === "energy" ? "친환경 에너지" : item.category === "waste" ? "자원 수환" : item.category === "living" ? "웰빙 거주" : "교통 수단"}
                  </span>
                </div>

                {/* Info info */}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed min-h-12">{item.description}</p>
                </div>

                {/* Score and Stats info */}
                <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xxs border border-slate-100 font-sans">
                  <span className="text-slate-500 font-medium">에코 지수 기여</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                    +{item.ecoScoreBonus} pt
                  </span>
                </div>
              </div>

              {/* Price & Purchase controls */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-mono">
                  <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-bold text-slate-900 text-sm">{item.price} P</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Inventory state if any is owned */}
                  {count > 0 && (
                    <div className="text-right text-[9px] font-semibold text-slate-500 mr-1 leading-tight">
                      <span className="block text-emerald-600 font-bold">보유 {count}개</span>
                      <span className="block">배치 {placed} / 대기 {inStorage}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handlePurchase(item)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                      isAffordable
                        ? "bg-slate-900 hover:bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-150 cursor-not-allowed"
                    }`}
                  >
                    구매하기
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
