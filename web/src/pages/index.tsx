import { Leaf, Map, Users, Github, ArrowRight } from 'lucide-react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'; // Import the Image component

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
        <h3 className="mb-4 text-2xl font-semibold"></h3>
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

    <section className="my-8">
      <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
        <h3 className="mb-4 text-2xl font-semibold"></h3>
      <Image src="/motto.webp" alt="Our Team Motto" width={840} height={200} className="rounded-lg shadow-md mx-auto" />
      
      <blockquote className="mt-6 border-l-4 border-primary pl-4 italic text-gray-700">
        <p className="text-lg">
          We are ProstěTeam, a group of students - Barča, Jarda, Michal, and Vojta.
        </p>
      </blockquote>
      </div>
    </section>

    <section className="my-8">
      <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
        <h3 className="mb-4 text-2xl font-semibold">The Problem</h3>
        <p className="mb-4 text-lg leading-relaxed">
          The construction of new lines faces many challenges today. When planning a route, it is necessary to take into account many different criteria from an environmental perspective, such as deforestation, floodplains, national parks, erosion risks, and more.
The planning process is slowed down by the fact that designers must search for data in many different places and combine the effects of individual factors in an appropriate manner themselves. The risk of human error is high.
        </p>
      </div>
    </section>

    <section className="my-8">
      <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
      <h3 className="mb-4 text-2xl font-semibold">Our solution</h3>
      <div className="flex justify-around">
      <Image src="/showcase1.webp" alt="Application Showcase 1" width={400} height={300} className="rounded-lg shadow-md" />
      <Image src="/showcase2.webp" alt="Application Showcase 2" width={400} height={300} className="rounded-lg shadow-md" />
      </div>
      <p className="mb-4 text-lg leading-relaxed mt-4">
      We have developed a service that allows users to view all relevant data on a single map. New data can be added to the map as additional layers in the form of GeoJSON or other vector files.
  We have also created an environmental index that uses data from the added layers to calculate how suitable a given location is for building a power line tower—for example, in a protected landscape area or flood zone, the index is 0 (do not build here), in a forest the index is lower than in a field, and so on.
      </p>
      <p className="mb-4 text-lg leading-relaxed mt-4">
      A web application built with TypeScript, Next.js, and React, using Leaflet as the map renderer. It allows adding map data layers (e.g., GeoJSON) on top of the map. The app runs in Docker and works on mobile, though performance is not optimized.
  The code includes an algorithm to calculate an environmental index based on a formula that incorporates user-defined priorities.
      </p>
      <div className="text-center">
      <Link
        href="https://github.com/lika85456/greenhack2025"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 mt-4 mb-4 text-lg font-semibold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
        target="_blank"
      >
        <Github size={24} />
        View on GitHub
        <ArrowRight size={20} />
      </Link>
      </div>
      </div>
    </section>

    <section className="my-8">
      <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
        <h3 className="mb-4 text-2xl font-semibold">Impact</h3>
        <p className="mb-4 text-lg leading-relaxed">
          The result of our efforts is a tool that allows designers to obtain all the data they need for their work in a fraction of the time.
If it were to be further developed correctly, its focus could be expanded from the environment to other factors, such as land management or consideration of existing infrastructure. The index we have created could also easily be used to develop an algorithm for finding the optimal power line route.
        </p>
      </div>
    </section>

    <section className="my-8">
      <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
        <h3 className="mb-4 text-2xl font-semibold">Feasibility & financials</h3>
        <p className="mb-4 text-lg leading-relaxed">
          We have a functional, very low-cost demo that demonstrates our idea is feasible. We use free open-source data. However, if the reliability of this data proves insufficient, it would be necessary to purchase some data. Additionally, funding would be required for further development and for hosting the service on a high-performance machine.
However, by speeding up the process, we eliminate significant expenses (including costs of repeatedly planning the same route due to changing circumstances).
        </p>
      </div>
    </section>

    <section className="my-8">
      <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
      <h3 className="mb-4 text-2xl font-semibold">What is new about your solution</h3>
      <p className="mb-4 text-lg leading-relaxed">
  Our solution introduces a new way of combining all data relevant to the power line route designer, enabling them to quickly, efficiently, and reliably take environmental requirements into account. Until now, there have been many different sources with varying levels of relevance, but the outcome of our work is the ability to unify data from all these sources into a single tool
  The idea of calculating an environmental index enables a new way to account for the varying levels of relevance of different environmental factors. This makes it possible to truly find the best location for building individual pylons and the entire power line. It also opens the door to developing algorithms for finding the shortest route using this index as a criterion, evaluating existing routes to determine if a better path exists nearby, or generating a heatmap of optimal pylon placement by running the calculation across the entire map.
      </p>
      </div>
    </section>

    <section className="my-8">
      <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
      <h3 className="mb-4 text-2xl font-semibold">Data Sources for Future Solution</h3>
      <p className="mb-4 text-lg leading-relaxed">
      These are some of the data sources we plan to integrate into our solution to provide even more comprehensive environmental insights:
      </p>
      <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-300">
      <thead className="bg-gray-200">
      <tr>
      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Preview</th>
      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Data Layer</th>
      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Source URL</th>
      </tr>
      </thead>
      <tbody className="bg-white">
      {[
      { name: 'Global Forest Change (Deforestation)', url: 'https://earthenginepartners.appspot.com/' },
      { name: 'Mines and undermined areas', url: 'https://mapy.geology.cz/dulni_dila_poddolovani/#' },
      { name: 'Urban planning / Land-use plan (for example for Havlíčkův Brod)', url: 'https://mapy.kr-vysocina.cz/pupo_pfa/apps/webappviewer/index.html?id=61cce275226a49a69c5b95254afda53d&citycode=568414' },
      { name: 'Slope deformations and landslides', url: 'https://mapy.geology.cz/svahove_deformace/#' },
      { name: 'Europe bird migration map', url: 'https://bbecquet.net/articles/2022/05/bird-tracking-map/' },
      { name: 'Snow, wind and earthquake-prone areas', url: 'https://www.dlubal.com/cs/oblasti-zatizeni-snehem-vetrem-a-zemetresenim/snih-csn-en-1991-1-3.html?&center=49.75997752330658,16.907958984375004&zoom=7&marker=50.075865,14.434609#&center=49.59669233279693,17.061767578125004&zoom=7&marker=50.075865,14.434609' },
      { name: 'Floods zones', url: 'https://chmi.maps.arcgis.com/apps/instant/sidebar/index.html?appid=34fa7f95912b4be3b9d8e3f856dac0ad' },
      ].map((item, index) => (
      <tr key={index} className="hover:bg-gray-50">
      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">
        <Image src={`/${index + 1}.png`} alt={`${item.name} preview`} width={100} height={75} className="rounded-sm" />
      </td>
      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">{item.name}</td>
      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800 break-all">
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        {item.url.length > 100 ? `${item.url.substring(0, 100)}...` : item.url}
      </a>
      </td>
      </tr>
      ))}
      </tbody>
      </table>
      </div>
      </div>
    </section>

    <section className="my-8">
      <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
      <h3 className="mb-4 text-2xl font-semibold">What comes next</h3>
      <p className="mb-4 text-lg leading-relaxed">
      We would like to continue developing the application. Possible improvements are:
      </p>
      <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed">
      <li className="flex items-start">
      <Leaf size={20} className="mr-2 mt-1 flex-shrink-0 text-primary" />
      Adding additional specific data layers (e.g. bee protection zones, land management registry, bird migration routes).
      </li>
      <li className="flex items-start">
      <Leaf size={20} className="mr-2 mt-1 flex-shrink-0 text-primary" />
      Optimizing the map renderer to handle these data sources smoothly and without lag.
      </li>
      <li className="flex items-start">
      <Leaf size={20} className="mr-2 mt-1 flex-shrink-0 text-primary" />
      Calculating a heatmap for a defined area to support route generation or selection of the optimal path for power line towers.
      </li>
      <li className="flex items-start">
      <Leaf size={20} className="mr-2 mt-1 flex-shrink-0 text-primary" />
      Developing algorithms that leverage the environmental index (e.g. shortest route within a set threshold, evaluating existing infrastructure).
      </li>
      </ul>
      </div>
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
          target="_blank"
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
