import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { httpDelete } from '@/lib/http'
import { Device } from "@/db/schema/device";


async function deleteDeviceMutationFn(data: { id: string }): Promise<Device> {
  const response = await httpDelete<Device>(`/devices/${data.id}`);
  return response.data;
}

export const useDeviceDeleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Device, Error, { id: string }, { toastId: string }>({
    mutationFn: async (data) => await deleteDeviceMutationFn(data),
    retry: false,
    onMutate: (variables) => {
      const toastId = toast.loading("Deleting deice: " + variables.id);
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Device " + variables.id + " successfully deleted", {
        id: context.toastId,
        duration: 2000
      });
    },
    onError: (err, _, context) => {
      toast.error((
        <div>
          <strong className="font-medium">Failed to delete device {_.id}</strong>
          <p>{err.message}</p>
        </div>
      ), {
        id: context?.toastId,
        duration: 3000
      });
    }
    , onSettled(data, error, variables, onMutateResult, context) {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
};