import Image from "next/image"
import Link from "next/link"
import { getCollections } from "@/app/actions/collections"
import { SiteHeader, SiteFooter } from "@/app/layouts"
import { Badge } from "@/components/ui/badge"

export default async function CollectionsPage() {
  const collections = await getCollections()

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Collections</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collections.map((collection) => {
              const isPermanent = collection.is_permanent
              const isActive = !collection.end_date || new Date(collection.end_date) > new Date()

              return (
                <div key={collection.id} className="group relative overflow-hidden rounded-lg">
                  <Link href={`/shop?collection=${collection.slug}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {collection.name} Collection</span>
                  </Link>
                  <div className="aspect-[3/2] w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={`/placeholder.svg?height=400&width=600&text=${encodeURIComponent(
                        collection.name + " Collection",
                      )}`}
                      alt={collection.name}
                      width={600}
                      height={400}
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-4">
                    <h2 className="text-white text-2xl font-bold text-center">{collection.name}</h2>
                    {collection.description && (
                      <p className="text-white/80 text-center mt-2 max-w-md">{collection.description}</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      {isPermanent && <Badge variant="default">Permanent Collection</Badge>}
                      {!isPermanent && isActive && <Badge variant="secondary">Limited Edition</Badge>}
                      {!isPermanent && !isActive && <Badge variant="outline">Archived</Badge>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
