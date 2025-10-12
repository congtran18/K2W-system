export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">K2W Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Keywords</h3>
          <p className="text-3xl font-bold text-blue-600">1,247</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Generated Content</h3>
          <p className="text-3xl font-bold text-green-600">892</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Published Sites</h3>
          <p className="text-3xl font-bold text-purple-600">67</p>
        </div>
      </div>
    </div>
  );
}
