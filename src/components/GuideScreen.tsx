import React from "react";
import { Leaf, Flame, AlertTriangle, Info, Smile, ShoppingBag, Landmark, ArrowRight } from "lucide-react";
import { GuideCategory } from "../types";

export default function GuideScreen() {
  const categories: GuideCategory[] = [
    {
      id: "low",
      name: "초록빛 저탄소 품목",
      level: "low",
      pointChange: "포인트 가산 (+15p ~ +50p)",
      emoji: "🌱",
      color: "border-emerald-200 bg-emerald-50/20 text-emerald-950 shadow-emerald-50/10",
      description: "재배 및 유통 전 과정에서 이산화탄소 발생량이 적고 지구를 정화하는 자원들입니다.",
      examples: [
        "국산 두부, 콩류 (육류 대체 콩단백질)",
        "친환경 / 무농약 국산 계절 채소 및 곡류",
        "다회용 용기, 대나무 칫솔, 텀블러 등 제로웨이스트 용품",
        "저탄소/친환경 환경마크 인증 가공품"
      ]
    },
    {
      id: "medium",
      name: "노란빛 일반 탄소 품목",
      level: "medium",
      pointChange: "약소 차감 또는 유지 (-5p ~ -15p)",
      emoji: "🥚",
      color: "border-yellow-200 bg-yellow-50/20 text-yellow-950 shadow-yellow-50/10",
      description: "기본적인 식생활을 유지하는 필수 원료이나 가공 과정이나 사육에 에너지가 소모됩니다.",
      examples: [
        "무항생제 닭고기, 생선류, 달걀",
        "일반 두부, 국산 우유 및 치즈 대용품",
        "라면 등 복합 공장 가공식품 및 기본 양념류",
        "국내 가공 비닐/종이 포장 스낵류"
      ]
    },
    {
      id: "high",
      name: "붉은빛 고탄소 경보 품목",
      level: "high",
      pointChange: "포인트 대량 감소 (-20p ~ -50p)",
      emoji: "🥩",
      color: "border-red-200 bg-red-50/20 text-red-950 shadow-red-50/10",
      description: "생산 중 엄청난 양의 메탄가스를 방출하거나 장거리 공수 운송으로 막대한 석유 가스를 태운 품목입니다.",
      examples: [
        "소고기 (한우, 수입산 불문 반추동물 메탄 대량 방출)",
        "돼지갈비, 소시지 및 대량 가공 육류",
        "수입 열대 과일 (아보카도, 아스파라거스, 칠레산 체리 등 푸드마일 높은 과일)",
        "일회용 플라스틱 페트병에 담긴 탄산/이온음료"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2 font-sans">
      {/* Title block */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-slate-950 flex items-center justify-center gap-1.5">
          <Info className="w-5 h-5 text-emerald-600" />
          품목당 탄소 및 포인트 규칙 가이드
        </h3>
        <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
          어떤 식품과 소비재를 구매하는가에 따라 우리 마을의 점수가 달라집니다. 장보기 영수증 속 숨겨진 저탄소 비결을 배워보세요!
        </p>
      </div>

      {/* Grid categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div key={cat.id} className={`rounded-3xl border p-5 flex flex-col justify-between space-y-5 shadow-sm ${cat.color}`}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-3xl select-none">{cat.emoji}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  cat.id === "low" 
                    ? "bg-emerald-100 text-emerald-800" 
                    : cat.id === "medium" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-red-100 text-red-800"
                }`}>
                  {cat.pointChange}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900">{cat.name}</h4>
                <p className="text-xxs text-slate-500 mt-1.5 leading-relaxed">{cat.description}</p>
              </div>

              {/* Items listing */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-slate-600 block">대표 품목 예시:</span>
                <ul className="space-y-1.5">
                  {cat.examples.map((ex, i) => (
                    <li key={i} className="text-xxs text-slate-600 flex items-start gap-1 leading-snug">
                      <span className="text-slate-400 mt-0.5 shrink-0">•</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Eco Education Box */}
      <div className="bg-slate-900 text-slate-300 rounded-3xl p-6 md:p-8 space-y-4 shadow-md">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <Smile className="w-5 h-5 text-emerald-400" />
          왜 소고기는 감점이고, 두부는 가점인가요?
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] leading-relaxed">
          <div className="space-y-2">
            <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>🥩 반추동물의 탄소 비밀</span>
            </h5>
            <p className="text-slate-400">
              소나 양 같은 되새김질 동물은 소화 과정에서 강력한 온실가스인 <strong>메탄(CH₄)</strong>을 입으로 방출합니다. 메탄은 이산화탄소보다 지구 온난화 지수가 약 21~25배 높으며, 소고기 1kg을 생산하는 데 배출되는 탄소량은 두부 대비 30배에 달합니다!
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>🚚 수송 거리 (푸드 마일리지)</span>
            </h5>
            <p className="text-slate-400">
              해외 수입 과일(아보카도, 바나나 등)은 선박이나 항공기로 수만 킬로미터를 날아옵니다. 장거리 수송 과정에서 많은 화석연료 배출가스가 생성되며, 후숙 보관에 전력이 대량 소모됩니다. 따라서 <strong>국내산 로컬 푸드</strong>를 사면 지구를 보호할 수 있습니다!
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xxs text-slate-400">
          <span>💡 팁: 수량이 많아지면 포인트 감소폭이 더 가속됩니다.</span>
          <span className="text-emerald-400 font-semibold">저탄소 실천 영웅 되기</span>
        </div>
      </div>
    </div>
  );
}
