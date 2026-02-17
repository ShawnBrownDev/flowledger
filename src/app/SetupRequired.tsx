export function SetupRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-amber-900 mb-2">Setup required</h1>
        <p className="text-sm text-amber-800 mb-4">
          Supabase is not configured. Add your project URL and anon key so the app can connect.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800 mb-4">
          <li>Copy <code className="bg-amber-100 px-1 rounded">.env.local.example</code> to <code className="bg-amber-100 px-1 rounded">.env.local</code></li>
          <li>Open your Supabase project → <strong>Settings</strong> → <strong>API</strong></li>
          <li>Set <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> to your Project URL</li>
          <li>Set <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your anon public key</li>
          <li>Restart the dev server (<code className="bg-amber-100 px-1 rounded">bun run dev</code>)</li>
        </ol>
        <a
          href="https://supabase.com/dashboard/project/_/settings/api"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-amber-700 hover:text-amber-900 underline"
        >
          Open Supabase API settings →
        </a>
      </div>
    </div>
  );
}
