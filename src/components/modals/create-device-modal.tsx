"use client";

import NiceModal, { useModal } from '@ebay/nice-modal-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { Textarea } from '../ui/textarea';
import { useCreateDeviceMutation } from '@/mutations/use-create-device-mutation';

export const showCreateDeviceModal = () => {
  NiceModal.show(CreateDeviceModal, {});
}

const CreateDeviceModal = NiceModal.create(() => {
  
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');

  const modal = useModal();
  const {mutate, isPending} = useCreateDeviceMutation();

  useEffect(() => {
    let timeout: NodeJS.Timeout|undefined;
    if(!modal.visible) {
      timeout = setTimeout(() => {
        modal.remove();
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [modal.visible])

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {id, description};
    mutate(data, {
      onSuccess: () => {
        modal.hide();
      }
    });
  }

  return (
    <Dialog open={modal.visible} onOpenChange={modal.hide}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Create a New Device</DialogTitle>
          </DialogHeader>
          <div className="my-6 flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-right">
                Unique Device ID
              </Label>
              <Input
                id="id"
                value={id}
                onChange={e => setId(e.target.value)}
                disabled={isPending}
                autoFocus
                minLength={6}
                maxLength={6}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" isPending={isPending}>Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default CreateDeviceModal;