
import { httpPost } from "@/lib/http";
import { Device } from "@/db/schema/device";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateDeviceInput, CreateDeviceSchema } from "@/form-schemas/create-device-schema";

async function mutationFn(data: CreateDeviceInput): Promise<Device> {
  const parsed = CreateDeviceSchema.safeParse(data);
  if (!parsed.success)
    throw new Error(parsed.error.issues[0].message);

  const response = await httpPost<Device>("/devices", data);
  return response.data;
};

export const useCreateDeviceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Device, Error, CreateDeviceInput, { toastId: string|number }>({
    mutationFn,
    retry: false,

    onMutate: () => {
      const toastId = toast.loading('Creating new device...');
      return { toastId };
    },

    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success('Device created successfully!', {
        id: context.toastId as string,
        duration: 2000
      });
    },

    onError: (err, _, context) => {
        toast.error((
          <div>
            <strong className="font-medium">Failed to create device!</strong>
            <p>{err.message}</p>
          </div>
        ), {
        id: context?.toastId as string,
          duration: 3000
        });
    }
  });
};