export default function Loader() {
  return (
    <div
      className="flex h-screen items-center justify-center flex-col gap-4"
      style={{ backgroundColor: '#F1F4F7', fontFamily: '"Darker Grotesque", sans-serif' }}
    >
      <div className="relative">
        <div
          className="h-14 w-14 animate-spin rounded-full border-4 border-gray-200"
          style={{ borderTopColor: '#45C8AF' }}
        />
      </div>
      <p className="text-gray-500 font-semibold text-lg">Loading...</p>
    </div>
  )
}
