import Head from 'next/head'
export default function PageHead() {
  const description =
    'A better search platform for all Irish state past papers. The best Irish Past Paper finder.'
  const title = 'Exam Finder: Irish Past Papers'
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      <meta property="og:description" content={description} />
      <meta name="twitter:description" content={description} />

      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://examfinder.ie/" />
      <meta property="twitter:domain" content="examfinder.ie" />

      <meta name="twitter:creator" content="@thomasforbesy" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:image"
        content="https://examfinder.ie/social-image.png"
      />
      <meta
        property="og:image"
        content="https://examfinder.ie/social-image.png"
      />
    </Head>
  )
}
