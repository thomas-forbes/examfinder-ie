import splitbee from '@splitbee/web'
import { type AppType } from 'next/app'
import { useEffect } from 'react'
import { trpc } from '../utils/trpc'

import '../styles/globals.css'

const MyApp: AppType = ({ Component, pageProps }) => {
  useEffect(() => {
    splitbee.init({
      scriptUrl: '/bee.js',
      apiUrl: '/_hive',
    })
  }, [])
  return <Component {...pageProps} />
}

export default trpc.withTRPC(MyApp)
