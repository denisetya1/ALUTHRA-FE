export default function AdminLoading() {
  return (
    <section className="route-state" aria-live="polite" aria-busy="true">
      <div className="route-state-indicator" aria-hidden="true" />
      <div>
        <h1>Loading workspace</h1>
        <p>Fetching the latest ALUTHRA administration data.</p>
      </div>
    </section>
  );
}
