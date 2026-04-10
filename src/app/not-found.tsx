import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-8xl font-bold text-hp-purple-200 mb-4">404</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagina nao encontrada</h2>
      <p className="text-gray-500 mb-6">A pagina que voce procura nao existe ou foi movida.</p>
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-hp-purple-600 text-white rounded-lg hover:bg-hp-purple-700 transition-colors font-medium"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  );
}
