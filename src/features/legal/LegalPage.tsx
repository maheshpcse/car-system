import { PageTransition } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import styles from './LegalPage.module.scss'

const CONTENT = {
  privacy: {
    title: 'Privacy',
    intro: 'Aurora Motors is a demonstration project. This page explains what the app stores and where.',
    sections: [
      { heading: 'What we store', body: 'Theme preference, sidebar state, favourites, comparison lists, saved builds, recent searches and a demo session. All of it lives in your browser’s local storage.' },
      { heading: 'What we do not do', body: 'No data is transmitted to a server. There are no analytics, cookies, or third-party trackers. Fonts are loaded from Google Fonts, which may log a request.' },
      { heading: 'Clearing data', body: 'Use the “Reset local data” action on the Settings page, or clear site data in your browser. Signing out removes the demo session.' },
    ],
  },
  terms: {
    title: 'Terms',
    intro: 'By using this demo you agree that everything in it is illustrative.',
    sections: [
      { heading: 'Fictional content', body: 'Manufacturers, models, prices, specifications and personas are invented for demonstration. Any resemblance to real vehicles or brands is coincidental.' },
      { heading: 'No warranty', body: 'The software is provided as-is for portfolio and evaluation purposes, without warranty of any kind.' },
      { heading: 'Open source', body: 'The source code is available on GitHub. Reuse is permitted under the licence published in the repository.' },
    ],
  },
} as const

export default function LegalPage({ kind }: { kind: keyof typeof CONTENT }) {
  const content = CONTENT[kind]
  useDocumentTitle(content.title)
  return (
    <PageTransition>
      <article className={`container ${styles.page}`}>
        <header className={styles.header}>
          <span className="t-eyebrow">Legal</span>
          <h1 className="t-title">{content.title}</h1>
          <p className="t-description">{content.intro}</p>
        </header>
        {content.sections.map((s) => (
          <section key={s.heading} className={styles.section}>
            <h2 className="t-subheading">{s.heading}</h2>
            <p>{s.body}</p>
          </section>
        ))}
        <p className={styles.updated}>Last updated September 2026.</p>
      </article>
    </PageTransition>
  )
}
