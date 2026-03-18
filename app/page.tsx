import PetNameGenerator from './components/PetNameGenerator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          PetMind.ai
        </h1>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          AI 驱动的宠物助手，为你的毛孩子提供智能命名、健康咨询、性格分析等服务
        </p>
      </header>

      {/* Main Content */}
      <PetNameGenerator />

      {/* Footer */}
      <footer className="text-center mt-12 text-gray-400 text-sm">
        <p>© 2025 PetMind.ai · 用 AI 关爱每一个毛孩子</p>
      </footer>
    </main>
  );
}
