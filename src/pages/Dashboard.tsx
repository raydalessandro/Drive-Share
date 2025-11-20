import { useAuthStore } from "@/stores/authStore";
import MainLayout from "@/components/layout/MainLayout";

const Dashboard = () => {
  const profile = useAuthStore((s) => s.profile);
  
  return (
    <MainLayout>
      <div>
        <h1>Test Dashboard</h1>
        <p>Username: {profile?.username || "Loading..."}</p>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
