import Head from 'next/head'

interface props {
  title?: string
  description?: string
}

export default function PageHead({
  title = 'Exam Finder: Irish Past Papers',
  description = 'The best exam material archive of Irish past papers and marking schemes',
}: props) {
  const image = 'https://examfinder.ie/social-image.png?v=2'
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
      <meta name="twitter:image" content={image} />
      <meta property="og:image" content={image} />
    </Head>
  )
}
