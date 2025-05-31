import { Head, Html, Main, NextScript } from 'next/document'

const Document = () => (
  <Html lang="en">
    <Head>
      <link rel="icon" href="/favicon.png" />
    </Head>
    <body className="bg-white">
      <Main />
      <NextScript />
    </body>
  </Html>
)

export default Document
