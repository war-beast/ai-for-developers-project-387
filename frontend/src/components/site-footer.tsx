import { Link } from 'react-router'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} Календарь звонков</span>
        <Link
          to="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit underline-offset-4 transition-colors hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Политика конфиденциальности
        </Link>
      </div>
    </footer>
  )
}
