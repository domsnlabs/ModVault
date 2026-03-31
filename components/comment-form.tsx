'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CommentFormProps {
  modId: string
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export default function CommentForm({
  modId,
  onSubmit,
  isLoading = false,
}: CommentFormProps) {
  const [body, setBody] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) {
      alert('Please enter a comment')
      return
    }
    await onSubmit({ modId, body })
    setBody('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Leave a Comment
        </label>
        <Textarea
          id="comment"
          placeholder="Share your thoughts, suggestions, or feedback..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Posting...' : 'Post Comment'}
      </Button>
    </form>
  )
}
