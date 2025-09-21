import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores";
import { useState } from "react";

const OrgSettings = () => {
  const { userDetails, updateUserDetails } = useAuthStore();
  const [formData, setFormData] = useState(userDetails); // Initial state from userDetails

  // Save all changes
  const handleSaveChanges = () => {
    updateUserDetails(formData);
  };

  return (
    <main>
      <section>org settings</section>
      <Separator className="my-4" />
      <Button onClick={handleSaveChanges} className="w-full">
        Save Changes
      </Button>
    </main>
  );
};

export default OrgSettings;
