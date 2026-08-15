import { getMediaResources } from "@/lib/utils";
import { useCallback, useReducer } from "react";

export type SourceDeviceprops = {
  displays?: {
    appicon: null;
    display_id: string;
    id: string;
    name: string;
    thumbnail: unknown[];
  }[];
  audioInputs?: {
    deviceId: string;
    lable?: string;
    kind: string;
    groupId: string;
  }[];
  errors?: string | null;
  isPending: boolean;
};

type DisplayDeviceActionProps = {
  type: "GET_DEVICES";
  payload: SourceDeviceprops;
};

//useReducer takes callback and bunck of default values for payload or a state
export const useMediaSource = () => {
  const [state, action] = useReducer(
    //callback
    (state: SourceDeviceprops, action: DisplayDeviceActionProps) => {
      switch (action.type) {
        case "GET_DEVICES":
          return { ...state, ...action.payload };
        default:
          return state;
      }
    },
    //default values
    {
      displays: [],
      audioInputs: [],
      errors: null,
      isPending: false,
    },
  );

  const fetchMediaResources = useCallback(async () => {
    action({ type: "GET_DEVICES", payload: { isPending: true } });
    try {
      const sources = await getMediaResources();
      action({
        type: "GET_DEVICES",
        payload: {
          displays: sources.displays,
          audioInputs: sources.audio,
          isPending: false,
        },
      });
    } catch (error) {
      action({
        type: "GET_DEVICES",
        payload: {
          errors:
            error instanceof Error ? error.message : "Unable to load media devices",
          isPending: false,
        },
      });
    }
  }, []);
  return { state, fetchMediaResources };
};
