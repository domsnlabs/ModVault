'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'

interface ReviewFormProps {
  modId: string
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export default function ReviewForm({
  modId,
  onSubmit,
  isLoading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      alert('Please select a rating')
      return
    }
    await onSubmit({ modId, rating, body })
    setRating(0)
    setBody('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-lg p-6 bg-muted/30">
      <h3 className="font-semibold text-lg">Leave a Review</h3>

      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition"
            >
              <Star
                className={`w-6 h-6 ${
                  value <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium mb-2">
          Your Review (optional)
        </label>
        <Textarea
          id="body"
          placeholder="Share your thoughts about this mod..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
}
