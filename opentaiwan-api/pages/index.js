export default function Home() {
  return (
    <div>
      <h1>OpenTaiwan API Service</h1>
      <ul>
        <li><a href="/api/health">Health Check</a></li>
        <li><a href="/api/status">System Status</a></li>
        <li><a href="/api/check-quota">Check Quota</a></li>
      </ul>
    </div>
  );
}
