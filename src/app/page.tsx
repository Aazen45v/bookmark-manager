'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

interface Bookmark {
  id: string
  user_id: string
  url: string
  title: string
  created_at: string
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user and bookmarks
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        await fetchBookmarks(user.id)
      }
      setLoading(false)
    }

    init()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user
      setUser(currentUser)
      if (currentUser) {
        await fetchBookmarks(currentUser.id)
      } else {
        setBookmarks([])
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Realtime subscriptions for bookmarks
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('bookmarks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBookmarks(data)
    }
  }

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !url) return

    setSubmitting(true)
    const { error } = await supabase.from('bookmarks').insert({
      user_id: user.id,
      url,
      title: title || url,
    })

    if (!error) {
      setUrl('')
      setTitle('')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Bookmark Manager</h1>
          <p className="text-gray-600 mb-6">Sign in to manage your bookmarks</p>
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">My Bookmarks</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Add Bookmark Form */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleAddBookmark} className="mb-8 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="url"
              placeholder="Enter URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:w-48"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {submitting ? 'Adding...' : 'Add Bookmark'}
            </button>
          </div>
        </form>

        {/* Bookmark List */}
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No bookmarks yet. Add your first one above!</p>
            </div>
          ) : (
            bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white p-4 rounded-lg shadow flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
                  >
                    {bookmark.title}
                  </a>
                  <p className="text-sm text-gray-500 truncate">{bookmark.url}</p>
                </div>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="ml-4 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete bookmark"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
