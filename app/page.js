import ProtectedRoute from "../components/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <h1>Welcome to your Dashboard!</h1>
    </ProtectedRoute>
  );
}
