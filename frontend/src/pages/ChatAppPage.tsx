import SignOut from "@/components/auth/SignOut";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

const ChatAppPage = () => {
  const { user } = useAuthStore();

  const handleOnClick = async () => {
    try {
      await api.get("/users/test", { withCredentials: true });
      toast.success("Test API thành công");
    } catch (error) {
      toast.error("Test API thất bại");
      console.log(error);
    }
  };

  return (
    <div>
      {user?.username}
      <SignOut />

      <Button onClick={handleOnClick}>test</Button>
    </div>
  );
};

export default ChatAppPage;
