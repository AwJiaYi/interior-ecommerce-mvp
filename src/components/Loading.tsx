export default function Loading({ label = 'Loading...' }: { label?: string }) {
  return <div className="loading" role="status"><span className="loading-dot" aria-hidden="true" />{label}</div>
}
