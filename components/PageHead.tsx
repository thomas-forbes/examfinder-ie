import Head from 'next/head'
export default function PageHead() {
  const description =
    'Easily search all Irish state past papers from the examinations.ie material archive and revise all your subjects with ease'
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
      <meta property="og:url" content="https://www.examfinder.ie/" />
      <meta property="twitter:domain" content="examfinder.ie" />

      <meta name="twitter:creator" content="@FoldedCode" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:image"
        content="https://www.examfinder.ie/social-card.png"
      />
      <meta
        property="og:image"
        content="https://www.examfinder.ie/social-card.png"
      />
    </Head>
  )
}
