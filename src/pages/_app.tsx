import splitbee from '@splitbee/web'
import { useEffect } from 'react'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    splitbee.init({
      scriptUrl: '/bee.js',
      apiUrl: '/_hive',
    })
  }, [])
  return <Component {...pageProps} />
}
