import { Leaf, Map, Users, Github, ArrowRight } from 'lucide-react'
import Head from 'next/head'
import Link from 'next/link'

import NavMenu from '#components/common/NavMenu'
import { AppConfig } from '#lib/AppConfig'

const Home = () => (
  <div className="container mx-auto max-w-4xl p-3 max-md:max-w-none">
    <Head>
      <title>ProstěTeam - Smart Powerline Grid Planning</title>
      <meta
        property="og:title"
        content="ProstěTeam - Smart Powerline Grid Planning"
        key="title"
      />
      <meta
        name="description"
        content="An innovative solution for powerline grid planning that helps visualize and analyze environmental constraints, national parks, and water bodies to make informed decisions."
      />
    </Head>
    <header className="items-top mt-10 gap-4 md:flex">
      <span className="text-primary">
        <Map size={AppConfig.ui.bigIconSize} className="mt-2" />
      </span>
      <div>
        <h2 className="text-4xl font-bold">Smart Powerline Grid Planning</h2>
        <h3 className="mb-4 text-2xl text-gray-600">Making infrastructure planning smarter and more sustainable</h3>
      </div>
    </header>
    <section className="my-8">
      <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
        <h3 className="mb-4 text-2xl font-semibold">About Our Project</h3>
        <p className="mb-4 text-lg leading-relaxed">
          We are developing an innovative application that revolutionizes powerline grid planning by providing comprehensive 
          environmental and geographical insights. Our solution helps planners make informed decisions by integrating multiple data layers, we enable more sustainable and environmentally conscious infrastructure planning.
        </p>
      </div>
    </section>

    <section className="my-12 text-center">
      <Link
        href="/map"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
      >
        <Map size={24} />
        Launch Planner Application
        <ArrowRight size={20} />
      </Link>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-2">
      <div>
        <h3 className="my-5 text-xl">Explore Our Features</h3>
        <NavMenu />
      </div>
    </section>

    <footer className="mt-16 flex justify-between rounded bg-light p-3 text-sm">
      <div>
        © 2025 ProstěTeam <br />
        <Link
          href="https://github.com/lika85456/greenhack2025"
          className="text-primary"
        >
          greenhack2025
        </Link>
      </div>
      <div className="text-primary">
        <Map size={AppConfig.ui.mapIconSize} className="mt-2" />
      </div>
    </footer>
  </div>
)

export default Home
