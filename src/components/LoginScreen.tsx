import React, { useState } from "react";
import { Leaf, LogIn, UserPlus, ShieldAlert } from "lucide-react";
import { UserProfile } from "../types";

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleDemoLogin = () => {
    // Premium instant demo user to let users play immediately
    const demoUser: UserProfile = {
      id: "demo-user",
      username: "에코히어로",
      email: "eco_hero@climate.org",
      points: 200,
      unlockedDecorations: ["tree-1", "flower-1"],
      placedDecorations: [
        { id: "placed-tree-1", itemId: "tree-1", x: 25, y: 35 },
        { id: "placed-flower-1", itemId: "flower-1", x: 60, y: 55 }
      ],
      receiptHistory: []
    };
    onLoginSuccess(demoUser);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    
    if (!isLogin && !username) {
      setError("사용자 이름을 입력해주세요.");
      return;
    }

    if (password.length < 4) {
      setError("비밀번호는 최소 4글자 이상이어야 합니다.");
      return;
    }

    // Creating or logging in user saved in localStorage
    const savedUsersRaw = localStorage.getItem("eco_village_users");
    const users: Record<string, UserProfile> = savedUsersRaw ? JSON.parse(savedUsersRaw) : {};

    if (isLogin) {
      // Find user by email
      const foundUser = Object.values(users).find(u => u.email === email);
      if (foundUser) {
        onLoginSuccess(foundUser);
      } else {
        // If not found in localStorage, create it dynamically to be friendly
        const newUser: UserProfile = {
          id: `user-${Date.now()}`,
          username: email.split("@")[0],
          email: email,
          points: 150, // default start points
          unlockedDecorations: [],
          placedDecorations: [],
          receiptHistory: []
        };
        users[newUser.id] = newUser;
        localStorage.setItem("eco_village_users", JSON.stringify(users));
        onLoginSuccess(newUser);
      }
    } else {
      // Signup
      const emailExists = Object.values(users).some(u => u.email === email);
      if (emailExists) {
        setError("이미 가입된 이메일 주소입니다.");
        return;
      }

      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        username: username,
        email: email,
        points: 150, // default starting points
        unlockedDecorations: [],
        placedDecorations: [],
        receiptHistory: []
      };

      users[newUser.id] = newUser;
      localStorage.setItem("eco_village_users", JSON.stringify(users));
      onLoginSuccess(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Decorative background grids */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#10b981_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between w-full max-w-md mx-auto z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-sans font-bold text-lg tracking-tight text-slate-900">Carbon Zero Village</span>
        </div>
        <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
          에코 빌리지 게임
        </div>
      </header>

      {/* Main card */}
      <main className="w-full max-w-md mx-auto my-auto z-10 py-8">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              {isLogin ? "에코 빌리지에 오신 것을 환영합니다" : "새로운 지구 영웅 등록하기"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isLogin 
                ? "영수증을 촬영해 탄소 배출량을 분석하고 나만의 마을을 가꾸세요!" 
                : "친환경 습관으로 가상의 마을을 활기차고 푸르게 꾸며보세요."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl flex items-start gap-2 border border-red-100">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">닉네임 (사용자 이름)</label>
                <input
                  type="text"
                  placeholder="예: 초록나무"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">이메일 주소</label>
              <input
                type="email"
                placeholder="eco@earth.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">비밀번호</label>
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer text-sm"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>로그인 / 바로 시작하기</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>회원가입 완료</span>
                </>
              )}
            </button>
          </form>

          {/* Switch login / register */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {isLogin ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-emerald-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
            >
              {isLogin ? "회원가입하기" : "로그인하기"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-150"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">또는</span></div>
          </div>

          {/* Quick Demo Play button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold py-3 rounded-xl transition-all border border-emerald-150 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Leaf className="w-4 h-4" />
            <span>데모 계정으로 바로 체험하기</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-400 text-xs z-10 w-full max-w-md mx-auto">
        <p>© 2026 Carbon Zero Village. All rights reserved.</p>
        <p className="mt-1">탄소 중립 실천과 지구 보호를 위한 영수증 에코 게임</p>
      </footer>
    </div>
  );
}
