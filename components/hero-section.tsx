import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-slate-900 to-slate-700 text-white">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-6 text-balance">
            Step Into Your
            <span className="text-orange-500"> Sneaker Dreams</span>
          </h1>
          <p className="text-xl mb-8 text-slate-300 text-pretty">
            Discover the latest drops, exclusive releases, and timeless classics. From basketball courts to city
            streets, find your perfect pair at Kicks Life 250.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              Shop New Arrivals
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-slate-900 bg-transparent"
            >
              View Collections
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-black/20"></div>
    </section>
  )
}
