"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createCollection, updateCollection } from "@/app/actions/collections"
import { useToast } from "@/components/ui/use-toast"
import type { Collection } from "@/app/actions/collections"

interface CollectionFormProps {
  collection?: Collection
}

export function CollectionForm({ collection }: CollectionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPermanent, setIsPermanent] = useState(collection?.is_permanent || false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    try {
      let result

      if (collection) {
        result = await updateCollection(collection.id, formData)
      } else {
        result = await createCollection(formData)
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: collection ? "Collection updated successfully" : "Collection created successfully",
        })
        router.push("/admin/collections")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="name">Collection Name</Label>
            <Input id="name" name="name" defaultValue={collection?.name || ""} required />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={collection?.slug || ""}
              required
              placeholder="e.g. summer-2024"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Used in URLs. Use lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={collection?.description || ""} rows={3} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_permanent">Permanent Collection</Label>
              <p className="text-xs text-neutral-500">
                Permanent collections are always available and don't have an end date.
              </p>
            </div>
            <Switch
              id="is_permanent"
              name="is_permanent"
              checked={isPermanent}
              onCheckedChange={setIsPermanent}
              value="true"
            />
          </div>

          {!isPermanent && (
            <>
              <div>
                <Label htmlFor="release_date">Release Date</Label>
                <Input
                  id="release_date"
                  name="release_date"
                  type="date"
                  defaultValue={
                    collection?.release_date
                      ? format(new Date(collection.release_date), "yyyy-MM-dd")
                      : format(new Date(), "yyyy-MM-dd")
                  }
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  defaultValue={
                    collection?.end_date
                      ? format(new Date(collection.end_date), "yyyy-MM-dd")
                      : format(new Date(new Date().setMonth(new Date().getMonth() + 2)), "yyyy-MM-dd")
                  }
                />
                <p className="text-xs text-neutral-500 mt-1">
                  The collection will be automatically archived after this date.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : collection ? "Update Collection" : "Create Collection"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/collections")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
