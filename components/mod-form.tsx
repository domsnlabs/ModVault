'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FieldGroup,
  FieldLabel,
  Field,
} from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Category } from '@/lib/types'

interface ModFormProps {
  categories: Category[]
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export default function ModForm({
  categories,
  onSubmit,
  isLoading = false,
}: ModFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    body: '',
    categoryId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Mod Title</FieldLabel>
          <Input
            id="title"
            placeholder="e.g., Better Enchantments"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="description">Short Description</FieldLabel>
          <Input
            id="description"
            placeholder="Brief description of your mod"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <Select
            value={formData.categoryId}
            onValueChange={(value) =>
              setFormData({ ...formData, categoryId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="body">Full Description</FieldLabel>
          <Textarea
            id="body"
            placeholder="Full description, features, installation instructions..."
            value={formData.body}
            onChange={(e) =>
              setFormData({ ...formData, body: e.target.value })
            }
            rows={8}
          />
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Mod'}
      </Button>
    </form>
  )
}
