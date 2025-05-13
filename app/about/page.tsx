import Image from "next/image"
import { SiteHeader, SiteFooter } from "@/app/layouts"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">About Maison Luperdi</h1>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Maison Luperdi was founded in 2020 with a simple mission: to create timeless, high-quality essentials
                that stand the test of time. We believe in the power of refined simplicity and the beauty of elegant
                design.
              </p>
              <p className="text-neutral-600 dark:text-neutral-400">
                Our journey began when we noticed a gap in the market for truly premium basics that didn't compromise on
                quality or ethical production. We set out to create a brand that would offer the perfect essentials,
                crafted from the finest pima cotton and designed with a sophisticated aesthetic.
              </p>
            </div>
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg?height=600&width=600"
                alt="Maison Luperdi studio"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Our Philosophy</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Quality First</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  We use only the finest pima cotton, known for its exceptional softness, durability, and luxurious
                  feel. Every garment is crafted to last, becoming even better with age.
                </p>
              </div>
              <div className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Ethical Production</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  All our products are ethically manufactured in small batches. We work closely with our production
                  partners to ensure fair wages and safe working conditions.
                </p>
              </div>
              <div className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <h3 className="text-xl font-medium mb-2">Sustainable Approach</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  We're committed to reducing our environmental impact. From our packaging to our production methods, we
                  strive to make choices that are better for the planet.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square relative overflow-hidden rounded-lg md:order-last">
              <Image
                src="/placeholder.svg?height=600&width=600"
                alt="Maison Luperdi team"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Maison Luperdi is a small team of designers and creatives passionate about quality, simplicity, and
                sustainability. We're united by our belief that elegance lies in simplicity and that the perfect
                essentials can form the foundation of any sophisticated wardrobe.
              </p>
              <p className="text-neutral-600 dark:text-neutral-400">
                Based in our atelier, we work collaboratively to design, test, and perfect each piece in our collection.
                We're hands-on at every stage of the process, from initial sketches to final production.
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
