'use client'

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-4">
          There was a problem signing you in. Please try again.
        </p>
        <a
          href="/"
          className="text-blue-600 hover:underline"
        >
          Go back home
        </a>
      </div>
    </div>
  )
}
