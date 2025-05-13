import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CollectionForm } from "@/components/admin/collection-form"

export default async function NewCollectionPage() {
  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-2">
          <Link href="/admin/collections">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Collection</h1>
      </div>

      <div className="max-w-2xl">
        <CollectionForm />
      </div>
    </div>
  )
}
