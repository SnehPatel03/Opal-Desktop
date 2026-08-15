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
  const [profileError, setProfileError] = useState<string | null>(null);

  const { user } = useUser();
  const { state, fetchMediaResources } = useMediaSource();
  console.log("state", state);

  useEffect(() => {
    if (user && user.id) {
      fetchUserProfile(user.id)
        .then((response) => {
          // Support both `{ user: ... }` API responses and direct user objects.
          const profileUser =
            response?.user ??
            response?.data?.user ??
            response?.data ??
            (response?.id ? response : null);

          setProfile({ status: response?.status ?? 200, user: profileUser });
        })
        .catch((error) => {
          setProfileError(
            error instanceof Error
              ? error.message
              : "Unable to load your profile.",
          );
        });
      fetchMediaResources();
    }
  }, [user, fetchMediaResources]);

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
        {profile?.user ? (
          <MediaConfig state={state} user={profile.user} />
        ) : profileError ? (
          <p className="text-sm text-red-400">{profileError}</p>
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
