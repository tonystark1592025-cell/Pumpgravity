import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import '../globals.css'

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
            <h1>Locale: {locale}</h1>
            <div>
              <a href="/en" style={{ marginRight: '10px', color: 'blue' }}>English</a>
              <a href="/ar" style={{ color: 'green' }}>العربية</a>
            </div>
          </div>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}