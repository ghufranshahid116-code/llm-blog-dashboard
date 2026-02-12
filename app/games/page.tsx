'use client'

import { Trophy, Clock } from 'lucide-react'
import { useGames } from '../../hooks/useBlogs'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function GamesPage() {
  const { data: games, isLoading } = useGames()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Games</h1>
        <p className="text-gray-600">Upcoming and recent NHL games</p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games?.map((game: any, index: number) => (
            <div
              key={index}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Trophy className="w-6 h-6 text-primary-600" />
                <h3 className="font-semibold text-gray-900">
                  {game.home_team} vs {game.away_team}
                </h3>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {game.created_at
                      ? new Date(game.created_at).toLocaleString()
                      : 'TBD'}
                  </span>
                </div>

                <div>
                  Sport: {game.sport_key || 'Unknown'}
                </div>

                <div>
                  Title: <span className="font-medium">{game.sport_title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && games?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No games available
        </div>
      )}
    </div>
  )
}
