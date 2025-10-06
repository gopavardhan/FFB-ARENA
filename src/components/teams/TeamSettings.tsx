import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { TeamWithMembers } from "@/types/features";
import { useUpdateTeam, useDeleteTeam } from "@/hooks/useTeams";

interface TeamSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamWithMembers;
}

export const TeamSettings = ({ open, onOpenChange, team }: TeamSettingsProps) => {
  const [name, setName] = useState(team.name);
  const [tag, setTag] = useState(team.tag || "");
  const [description, setDescription] = useState(team.description || "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const handleUpdate = () => {
    updateTeam.mutate({
      teamId: team.id,
      updates: {
        name,
        tag: tag || null,
        description: description || null,
      },
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const handleDelete = () => {
    deleteTeam.mutate(team.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        onOpenChange(false);
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Settings</DialogTitle>
            <DialogDescription>
              Manage your team settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Team Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tag">Team Tag</Label>
              <Input
                id="edit-tag"
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase())}
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={200}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleUpdate} 
                disabled={updateTeam.isPending}
                className="flex-1"
              >
                {updateTeam.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                className="w-full"
              >
                Delete Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All team data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteTeam.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};