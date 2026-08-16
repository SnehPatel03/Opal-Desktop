import { SourceDeviceprops } from "@/hooks/useMediaSource";
import { useStudioSettings } from "@/hooks/useStudioSettings";
import { Headphones, Monitor, Settings2 } from "lucide-react";

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
  const { register } = useStudioSettings(
    user?.studio?.id ?? "",
    user?.studio?.screen || state.displays?.[0]?.id,
    user?.studio?.mic || state.audioInputs?.[0]?.deviceId,
    user?.studio?.preset,
    user?.subscription?.plan,
  );

  if (!user) {
    return null;
  }

  return (
    <form className="relative w-full space-y-2.5">
      {/* Screen */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-zinc-400">
          <Monitor size={17} strokeWidth={1.8} />
        </div>

        <select
          {...register("screen")}
          className="
            h-10 min-w-0 flex-1
            rounded-2xl
            border border-white/10
            bg-[#171717]
            px-3 pr-9
            text-sm
            text-zinc-200
            outline-none
            transition-all
            hover:border-white/20
            focus:border-white/25
            focus:ring-2
            focus:ring-white/5
          "
        >
          {!state.displays?.length && (
            <option value="" disabled>
              No screens or windows found
            </option>
          )}
          {state.displays?.map((display) => (
            <option
              value={display.id}
              key={display.id}
              className="bg-[#171717] text-zinc-200"
            >
              {display.name}
            </option>
          ))}
        </select>
      </div>

      {/* Audio */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-zinc-400">
          <Headphones size={17} strokeWidth={1.8} />
        </div>

        <select
          {...register("audio")}
          className="
            h-10 min-w-0 flex-1
            rounded-2xl
            border border-white/10
            bg-[#171717]
            px-3 pr-9
            text-sm
            text-zinc-200
            outline-none
            transition-all
            hover:border-white/20
            focus:border-white/25
            focus:ring-2
            focus:ring-white/5
          "
        >
          {!state.audioInputs?.length && (
            <option value="" disabled>
              No microphones found
            </option>
          )}
          {state.audioInputs?.map((device) => (
            <option
              value={device.deviceId}
              key={device.deviceId}
              className="bg-[#171717] text-zinc-200"
            >
              {device.label || "Microphone (permission required)"}
            </option>
          ))}
        </select>
      </div>

      {/* Quality */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-zinc-400">
          <Settings2 size={17} strokeWidth={1.8} />
        </div>

        <select
          {...register("preset")}
          className="
            h-10 min-w-0 flex-1
            rounded-2xl
            border border-white/10
            bg-[#171717]
            px-3 pr-9
            text-sm
            text-zinc-200
            outline-none
            transition-all
            hover:border-white/20
            focus:border-white/25
            focus:ring-2
            focus:ring-white/5
          "
        >
          <option
            disabled={user.subscription?.plan === "FREE"}
            value="HD"
            className="bg-[#171717] text-zinc-200"
          >
            1080p
          </option>

          <option
            value="SD"
            className="bg-[#171717] text-zinc-200"
          >
            720p
          </option>
        </select>
      </div>
    </form>
  );
};

export default MediaConfig;
