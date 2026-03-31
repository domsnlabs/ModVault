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

interface VersionFormProps {
  modId: string
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export default function VersionForm({
  modId,
  onSubmit,
  isLoading = false,
}: VersionFormProps) {
  const [formData, setFormData] = useState({
    version_number: '',
    changelog: '',
    status: 'release',
  })
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      alert('Please select a file to upload')
      return
    }
    await onSubmit({ ...formData, modId, file })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="version">Version Number</FieldLabel>
          <Input
            id="version"
            placeholder="e.g., 1.0.0"
            value={formData.version_number}
            onChange={(e) =>
              setFormData({ ...formData, version_number: e.target.value })
            }
            required
          />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="status">Release Type</FieldLabel>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="release">Release</SelectItem>
              <SelectItem value="beta">Beta</SelectItem>
              <SelectItem value="alpha">Alpha</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="changelog">Changelog</FieldLabel>
          <Textarea
            id="changelog"
            placeholder="What's new in this version?"
            value={formData.changelog}
            onChange={(e) =>
              setFormData({ ...formData, changelog: e.target.value })
            }
            rows={6}
          />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="file">Mod File (.jar, .zip, etc)</FieldLabel>
          <Input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            accept=".jar,.zip,.rar,.tar,.gz,.7z"
          />
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isLoading || !file} className="w-full">
        {isLoading ? 'Uploading...' : 'Create Version'}
      </Button>
    </form>
  )
}
