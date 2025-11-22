import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";

const SignOut = () => {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <Button variant="logout" onClick={handleSignOut}>
        <LogOut className="text-destructive" /> Đăng xuất
      </Button>
    </div>
  );
};

export default SignOut;
