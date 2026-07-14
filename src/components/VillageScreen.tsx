import React, { useState } from "react";
import { Leaf, Award, Recycle, Trash2, ArrowUpRight, ShieldAlert, Sparkles } from "lucide-react";
import { UserProfile, PlacedDecoration, DecorationItem } from "../types";
import { DECORATIONS_CATALOG } from "../decorations";

interface VillageScreenProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onNavigateToShop: () => void;
}

export default function VillageScreen({ user, onUpdateUser, onNavigateToShop }: VillageScreenProps) {
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [isPlacing, setIsPlacing] = useState<boolean>(false);

  // Convert catalog list to map for fast lookup
  const catalogMap = React.useMemo(() => {
    return DECORATIONS_CATALOG.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, DecorationItem>);
  }, []);

  // Grid dimensions
  const GRID_SIZE = 6; // 6x6 Grid

  // Calculate overall green rating based on placed items
  const totalEcoBonus = React.useMemo(() => {
    return user.placedDecorations.reduce((sum, placed) => {
      const item = catalogMap[placed.itemId];
      return sum + (item ? item.ecoScoreBonus : 0);
    }, 0);
  }, [user.placedDecorations, catalogMap]);

  // Eco index percentage (max 100)
  const ecoIndex = Math.min(100, totalEcoBonus);

  // Get status text based on eco index
  const getVillageStatus = () => {
    if (ecoIndex === 0) return { title: "생기 잃은 황무지", color: "text-amber-800", bg: "bg-amber-100", border: "border-amber-200", desc: "이 마을은 풀 한 포기 자라지 않는 황무지입니다. 영수증을 인증해 친환경 기지를 건설하고 탄소를 줄여보세요!" };
    if (ecoIndex < 25) return { title: "살아나는 초원 지대", color: "text-yellow-800", bg: "bg-yellow-50", border: "border-yellow-200", desc: "희미한 녹색 빛이 돌기 시작했습니다. 조금 더 많은 친환경 보금자리와 소중한 나무들을 심어주세요." };
    if (ecoIndex < 60) return { title: "조화로운 에코 빌리지", color: "text-emerald-800", bg: "bg-emerald-50", border: "border-emerald-200", desc: "마을에 새와 무당벌레가 찾아옵니다! 청정에너지 설비들과 올바른 수거 장치가 제대로 정착하고 있습니다." };
    return { title: "탄소 제로 무지개 파라다이스", color: "text-blue-800", bg: "bg-blue-50", border: "border-blue-200", desc: "완벽한 저탄소 순환 사회를 달성했습니다! 맑은 공기와 푸른 하늘이 눈부신 최정상 지구 구호 마을입니다." };
  };

  const status = getVillageStatus();

  // Find decoration at specific coordinate
  const getDecorationAt = (x: number, y: number): PlacedDecoration | undefined => {
    return user.placedDecorations.find((d) => d.x === x && d.y === y);
  };

  // Get count of items in inventory that are purchased but NOT yet placed
  // Count = (Purchased occurrences) - (Placed occurrences)
  const getAvailableInventory = () => {
    const counts: Record<string, number> = {};
    
    // Total count of purchased items
    user.unlockedDecorations.forEach((itemId) => {
      counts[itemId] = (counts[itemId] || 0) + 1;
    });

    // Subtract placed items
    user.placedDecorations.forEach((placed) => {
      if (counts[placed.itemId]) {
        counts[placed.itemId]--;
      }
    });

    // Filter items with positive count left
    const availableItems: { item: DecorationItem; count: number }[] = [];
    DECORATIONS_CATALOG.forEach((item) => {
      const count = counts[item.id] || 0;
      if (count > 0) {
        availableItems.push({ item, count });
      }
    });

    return availableItems;
  };

  const availableInventory = getAvailableInventory();

  // Place item
  const handlePlaceItem = (itemId: string) => {
    if (!selectedCell) return;

    const newPlaced: PlacedDecoration = {
      id: `placed-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      itemId,
      x: selectedCell.x,
      y: selectedCell.y,
    };

    const updatedUser: UserProfile = {
      ...user,
      placedDecorations: [...user.placedDecorations, newPlaced],
    };

    onUpdateUser(updatedUser);
    setSelectedCell(null);
    setIsPlacing(false);
  };

  // Remove placed item
  const handleRemoveItem = (placedId: string) => {
    const updatedUser: UserProfile = {
      ...user,
      placedDecorations: user.placedDecorations.filter((d) => d.id !== placedId),
    };

    onUpdateUser(updatedUser);
    setSelectedCell(null);
  };

  // Cell rendering style helper
  const getCellBgClass = (x: number, y: number, isOccupied: boolean) => {
    // Ground color progresses based on ecoIndex
    if (isOccupied) {
      if (ecoIndex < 25) return "bg-amber-100 hover:bg-amber-200 border-amber-300";
      if (ecoIndex < 60) return "bg-emerald-100 hover:bg-emerald-200 border-emerald-300";
      return "bg-blue-100 hover:bg-blue-200 border-blue-300";
    }

    // Default empty cells
    if (ecoIndex === 0) {
      // dry sand, cracked dust looks
      const hashes = (x + y) % 3;
      if (hashes === 0) return "bg-amber-50 border-amber-200/60";
      if (hashes === 1) return "bg-orange-50/70 border-orange-200/50";
      return "bg-amber-100/50 border-amber-200/60";
    } else if (ecoIndex < 25) {
      // partially growing grass
      return (x + y) % 2 === 0 ? "bg-amber-50/60 border-amber-100" : "bg-emerald-50/30 border-amber-100";
    } else if (ecoIndex < 60) {
      // lively green meadow
      return (x + y) % 2 === 0 ? "bg-emerald-50/80 border-emerald-100" : "bg-green-50/60 border-green-100";
    } else {
      // lush eco paradise
      return (x + y) % 2 === 0 ? "bg-green-100/80 border-green-200" : "bg-emerald-50 border-green-200";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Village status card */}
      <div className={`p-5 rounded-2xl border ${status.border} ${status.bg} flex flex-col md:flex-row gap-5 items-start justify-between shadow-sm`}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{ecoIndex === 0 ? "🏜️" : ecoIndex < 25 ? "🌱" : ecoIndex < 60 ? "🏡" : "🌈"}</span>
            <h3 className={`text-lg font-bold tracking-tight ${status.color}`}>
              {status.title}
            </h3>
            <span className="bg-white/80 backdrop-blur text-slate-800 text-xs px-2 py-0.5 rounded-full font-bold shadow-sm border border-slate-150">
              Eco 지수: {ecoIndex}/100
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            {status.desc}
          </p>
        </div>

        {/* Progress gauge */}
        <div className="w-full md:w-48 shrink-0 space-y-1.5 self-center">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>마을 녹지율</span>
            <span>{ecoIndex}%</span>
          </div>
          <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                ecoIndex === 0 ? "bg-amber-600" : ecoIndex < 25 ? "bg-yellow-500" : ecoIndex < 60 ? "bg-emerald-500" : "bg-gradient-to-r from-emerald-500 to-blue-500"
              }`}
              style={{ width: `${ecoIndex}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main split: Grid and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 cols: Interactive Grid Canvas */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                에코 타운 맵 (6x6)
              </h4>
              <p className="text-xxs text-slate-500">타일을 터치해 친환경 기지를 세우거나 철거하세요.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xxs text-slate-500">
                <span className="inline-block w-2.5 h-2.5 bg-amber-100 border border-amber-300 rounded-sm"></span>
                황무지
              </span>
              <span className="flex items-center gap-1 text-xxs text-slate-500">
                <span className="inline-block w-2.5 h-2.5 bg-emerald-100 border border-emerald-300 rounded-sm"></span>
                활성화지
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="aspect-square w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 grid grid-cols-6 grid-rows-6 gap-2.5 shadow-inner relative">
            {/* Background graphics if totally empty */}
            {user.placedDecorations.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 text-center px-6">
                <p className="text-3xl filter grayscale">🏜️</p>
                <p className="text-xs font-bold text-amber-900 mt-2">지금은 생기를 잃어버린 빈 땅입니다</p>
                <p className="text-xxs text-slate-500 max-w-xs mt-1">상점에서 나무나 태양광 등을 구매해 채워나가세요.</p>
              </div>
            )}

            {Array.from({ length: GRID_SIZE }).map((_, rIndex) =>
              Array.from({ length: GRID_SIZE }).map((_, cIndex) => {
                const placed = getDecorationAt(cIndex, rIndex);
                const item = placed ? catalogMap[placed.itemId] : undefined;
                const isSelected = selectedCell?.x === cIndex && selectedCell?.y === rIndex;

                return (
                  <button
                    key={`${rIndex}-${cIndex}`}
                    id={`cell-${rIndex}-${cIndex}`}
                    type="button"
                    onClick={() => {
                      setSelectedCell({ x: cIndex, y: rIndex });
                      setIsPlacing(true);
                    }}
                    className={`relative rounded-xl border border-dashed flex flex-col items-center justify-center transition-all aspect-square cursor-pointer overflow-hidden ${getCellBgClass(
                      cIndex,
                      rIndex,
                      !!placed
                    )} ${
                      isSelected ? "ring-2 ring-emerald-500 ring-offset-2 z-10" : ""
                    }`}
                  >
                    {item ? (
                      <span className="text-2xl md:text-3xl select-none filter drop-shadow animate-fade-in">
                        {item.emoji}
                      </span>
                    ) : (
                      <span className="text-slate-300 hover:text-emerald-400 font-bold text-xxs opacity-0 hover:opacity-100 transition-all">
                        + 설치
                      </span>
                    )}

                    {/* Coordinates for debug or tech look but subtle */}
                    <span className="absolute bottom-1 right-1.5 text-[7px] text-slate-400 font-mono scale-90">
                      {cIndex + 1},{rIndex + 1}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right 5 cols: Tile Control Panel / Placer */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active selection control */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
            {selectedCell ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">
                      선택한 구역 ({selectedCell.x + 1}, {selectedCell.y + 1} 타일)
                    </h5>
                    <p className="text-xxs text-slate-500">현재 좌표에 무탄소 생태계를 구축합니다.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCell(null);
                      setIsPlacing(false);
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
                  >
                    취소
                  </button>
                </div>

                {/* If cell is occupied */}
                {(() => {
                  const placed = getDecorationAt(selectedCell.x, selectedCell.y);
                  if (placed) {
                    const item = catalogMap[placed.itemId];
                    return (
                      <div className="bg-emerald-50/50 border border-emerald-150 rounded-2xl p-4 text-center space-y-4">
                        <div className="text-4xl">{item?.emoji}</div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item?.name}</p>
                          <p className="text-xxs text-slate-500 mt-1">{item?.description}</p>
                          <div className="inline-flex gap-1.5 mt-3 bg-emerald-100 text-emerald-800 text-xxs font-bold px-2 py-0.5 rounded-full">
                            🌱 Eco 보너스: +{item?.ecoScoreBonus}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(placed.id)}
                          className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 px-3 rounded-xl transition-all border border-red-150 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>철거하고 소지품으로 회수하기</span>
                        </button>
                      </div>
                    );
                  }

                  // If empty cell, allow placement
                  return (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700">배치할 소지품 선택</p>
                      {availableInventory.length === 0 ? (
                        <div className="bg-slate-50 rounded-2xl p-5 text-center space-y-3 border border-slate-150">
                          <p className="text-xs text-slate-500 leading-relaxed">
                            현재 가지고 계신 설치 소지품이 없습니다. 먼저 상점에서 탄소 포인트로 친환경 장비를 구매해주세요!
                          </p>
                          <button
                            onClick={onNavigateToShop}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-3.5 rounded-xl transition-all shadow-md text-xs cursor-pointer"
                          >
                            <span>꾸미기 상점 가기</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {availableInventory.map(({ item, count }) => (
                            <button
                              key={item.id}
                              onClick={() => handlePlaceItem(item.id)}
                              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-left transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{item.emoji}</span>
                                <div>
                                  <span className="font-bold text-xs text-slate-800 block">{item.name}</span>
                                  <span className="text-[10px] text-slate-500 block">Eco 보너스: +{item.ecoScoreBonus}</span>
                                </div>
                              </div>
                              <span className="bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-800 text-slate-600 text-xxs px-2 py-0.5 rounded-full font-bold">
                                {count}개 보유
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Leaf className="w-10 h-10 mx-auto text-emerald-200" />
                <p className="text-xs font-bold text-slate-700">활성화할 타일을 탭해주세요</p>
                <p className="text-xxs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  원래 아무것도 없는 모래사장이 영수증 인증 포인트를 사용하여 푸르고 생기 넘치는 청정 지구 정원으로 변화합니다.
                </p>
              </div>
            )}
          </div>

          {/* Quick facts card */}
          <div className="bg-[#1e293b] text-slate-300 p-5 rounded-3xl space-y-3 shadow-md">
            <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              탄소 빌리지 꾸미기 규칙
            </h5>
            <ul className="space-y-2 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>영수증 분석을 통해 친환경 가치가 높은 구매 시 포인트를 지급받습니다.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>육류 대량 구매 등 탄소 배출이 높은 행위는 포인트가 감소합니다.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>상점에서 꾸미기 도구를 구매한 후, 반드시 <strong>여기에 배치</strong>해야 온실가스 저감 에코 지수가 올라갑니다!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
