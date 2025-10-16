export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-500 to-secondary-700">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white text-xl font-mont font-semibold">Chargement...</p>
      </div>
    </div>
  )
}
