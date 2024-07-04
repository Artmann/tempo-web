import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'
import { Analytics } from '@vercel/analytics/react'

import tailwindStyles from './tailwind.css?url'
import globalStyles from './global.css?url'
import type { LinksFunction } from '@remix-run/node'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: tailwindStyles }
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#171717] text-white">
        {children}
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
