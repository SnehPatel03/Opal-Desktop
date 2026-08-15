import { ClerkLoading, Show, useUser } from "@clerk/react";
import { Loader } from "../Loader";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "@/lib/utils";
import { useMediaSource } from "@/hooks/useMediaSource";
import MediaConfig from "../MediaConfig";

const Widget = () => {
  const [profile, setProfile] = useState<{
    status: number;
    user:
      | ({
          subscription: {
            plan: "PRO" | "FREE";
          } | null;
          studio: {
            id: string;
            screen: string | null;
            mic: string | null;
            preset: "HD" | "SD";
            camera: string | null;
            userId: string | null;
          } | null;
        } & {
          id: string;
          email: string;
          firstname: string | null;
          lastname: string | null;
          createdAt: Date;
          clerkid: string;
        })
      | null;
  } | null>(null);

  const { user } = useUser();
  const { state, fetchMediaResources } = useMediaSource();
  console.log("state", state);

  useEffect(() => {
    if (user && user.id) {
      fetchUserProfile(user.id).then((p) => setProfile(p));
    }
  }, [user]);

  return (
    <>
      <div>
        <ClerkLoading>
          <div className="h-full flex justify-center items-center">
            <Loader />
          </div>
        </ClerkLoading>
      </div>
      <Show when="signed-in">
        {profile ? (
          <MediaConfig state={state} user={profile.user} />
        ) : (
          <div>
            <Loader />
          </div>
        )}
      </Show>
    </>
  );
};

export default Widget;
