import React, { useState, useEffect } from "react";
import { Leaf, ShoppingBag, Camera, Info, Coins, LogOut, User, Sparkles } from "lucide-react";
import { UserProfile, ReceiptItem } from "./types";

// Import custom screens
import LoginScreen from "./components/LoginScreen";
import VillageScreen from "./components/VillageScreen";
import ShopScreen from "./components/ShopScreen";
import ReceiptScanner from "./components/ReceiptScanner";
import ReceiptAnalysis from "./components/ReceiptAnalysis";
import GuideScreen from "./components/GuideScreen";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<"village" | "shop" | "scan" | "guide">("village");
  
  // Receipt analysis states (held in parent so it persists beautifully)
  const [analyzedItems, setAnalyzedItems] = useState<ReceiptItem[] | null>(null);
  const [analysisSource, setAnalysisSource] = useState<string>("sample");

  // Load user session from localStorage if exists
  useEffect(() => {
    const cachedUser = localStorage.getItem("eco_village_current_session");
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error("Error reading cached user session", e);
      }
    }
  }, []);

  // Update localStorage whenever user session state changes
  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    localStorage.setItem("eco_village_current_session", JSON.stringify(updated));

    // Synchronize user profile (points, placements, history) with Neon PostgreSQL DB in the background
    if (updated.id && updated.id !== "demo-user") {
      fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: updated.id,
          points: updated.points,
          unlockedDecorations: updated.unlockedDecorations,
          placedDecorations: updated.placedDecorations,
          receiptHistory: updated.receiptHistory,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log("Profile successfully synchronized with PostgreSQL database.");
          } else {
            console.warn("DB profile update warning:", data.error);
          }
        })
        .catch((err) => {
          console.error("Failed to sync profile with database:", err);
        });
    }

    // Also update the general users list registry in local cache
    const savedUsersRaw = localStorage.getItem("eco_village_users");
    const users = savedUsersRaw ? JSON.parse(savedUsersRaw) : {};
    users[updated.id] = updated;
    localStorage.setItem("eco_village_users", JSON.stringify(users));
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem("eco_village_current_session", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAnalyzedItems(null);
    localStorage.removeItem("eco_village_current_session");
  };

  // Callback when Gemini receipt analysis finishes successfully
  const handleAnalysisComplete = (items: ReceiptItem[], source: string) => {
    setAnalyzedItems(items);
    setAnalysisSource(source);
  };

  // Claim points and update state
  const handleClaimPoints = (pointsGained: number) => {
    if (!currentUser) return;

    // We allow points to increase or decrease, but floor it at 0 so they can recover!
    const newPoints = Math.max(0, currentUser.points + pointsGained);
    
    // Add to history
    const newReceiptRecord = {
      id: `receipt-${Date.now()}`,
      date: new Date().toLocaleDateString("ko-KR"),
      items: analyzedItems || [],
      totalPointImpact: pointsGained,
      source: analysisSource
    };

    const updatedUser: UserProfile = {
      ...currentUser,
      points: newPoints,
      receiptHistory: [newReceiptRecord, ...currentUser.receiptHistory]
    };

    handleUpdateUser(updatedUser);
    
    // Reset analysis and go back to Village map to see points / progress!
    setAnalyzedItems(null);
    setCurrentTab("village");
  };

  const handleResetAnalysis = () => {
    setAnalyzedItems(null);
  };

  // If not logged in, render the login/signup screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 flex flex-col font-sans">
      
      {/* Primary Header Navbar */}
      <header className="bg-white border-b border-slate-150 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/10 shrink-0">
              <Leaf className="w-4.5 h-4.5 text-white" />
            </div>
            <h1 className="font-sans font-bold text-base tracking-tight text-slate-900 hidden sm:block">
              Carbon Zero Village
            </h1>
          </div>

          {/* User profile capsule and Wallet */}
          <div className="flex items-center gap-3.5">
            {/* Wallet points balance */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-full shadow-sm">
              <Coins className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="font-mono text-xs font-bold text-slate-900 leading-none">
                {currentUser.points} <span className="text-[10px] font-sans">P</span>
              </span>
            </div>

            {/* Profile badge */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-none">{currentUser.username}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">{currentUser.email}</span>
              </div>
              
              {/* Logout button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 px-4 py-6 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto pb-16">
          {(() => {
            switch (currentTab) {
              case "village":
                return (
                  <VillageScreen 
                    user={currentUser} 
                    onUpdateUser={handleUpdateUser} 
                    onNavigateToShop={() => setCurrentTab("shop")} 
                  />
                );
              case "shop":
                return (
                  <ShopScreen 
                    user={currentUser} 
                    onUpdateUser={handleUpdateUser} 
                    onNavigateToVillage={() => setCurrentTab("village")} 
                  />
                );
              case "scan":
                // If there's an active analyzed receipt, show Analysis screen, otherwise Scanner
                if (analyzedItems) {
                  return (
                    <ReceiptAnalysis 
                      items={analyzedItems} 
                      source={analysisSource} 
                      onClaimPoints={handleClaimPoints} 
                      onReset={handleResetAnalysis} 
                    />
                  );
                }
                return (
                  <ReceiptScanner 
                    onAnalysisComplete={handleAnalysisComplete} 
                  />
                );
              case "guide":
                return <GuideScreen />;
              default:
                return null;
            }
          })()}
        </div>
      </main>

      {/* Persistent Bottom Tab Navigation Bar */}
      <nav className="bg-white border-t border-slate-150 fixed bottom-0 left-0 right-0 py-2.5 px-6 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex justify-between items-center">
          
          <button
            type="button"
            onClick={() => {
              setCurrentTab("village");
              setAnalyzedItems(null); // Clear active scan states on tab switch for intuitive flow
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              currentTab === "village" ? "text-emerald-600 scale-105" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Leaf className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-bold">마을 (황무지)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentTab("shop");
              setAnalyzedItems(null);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              currentTab === "shop" ? "text-emerald-600 scale-105" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ShoppingBag className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-bold">상점</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("scan")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              currentTab === "scan" ? "text-emerald-600 scale-105" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Camera className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-bold">영수증 분석</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentTab("guide");
              setAnalyzedItems(null);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              currentTab === "guide" ? "text-emerald-600 scale-105" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Info className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-bold">포인트 규칙</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
