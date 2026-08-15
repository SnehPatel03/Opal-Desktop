import { SourceDeviceprops } from "@/hooks/useMediaSource";
import { useStudioSettings } from "@/hooks/useStudioSettings";


type Props = {
  state: SourceDeviceprops;
  user:
    | ({
        subscription: {
          plan: "FREE" | "PRO";
        } | null;
        studio: {
          id: string;
          screen: string | null;
          mic: string | null;
          camera: string | null;
          preset: "HD" | "SD";
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
};

const MediaConfig = ({ user, state }: Props) => {
  const activeScreen = state.displays?.find(
    (screen) => screen.id === user?.studio?.screen,
  );
  const activeAudio = state.audioInputs?.find(
    (device) => device.deviceId === user?.studio?.mic,
  );

  const { isPending, onPreset, register } = useStudioSettings(
    user!.id,
    user?.studio?.screen || state.displays?.[0]?.id,
    user?.studio?.mic || state.audioInputs?.[0]?.deviceId,
    user?.studio?.preset,
    user?.subscription?.plan,
  );

  return <div>MediaConfig</div>;
};

export default MediaConfig;
