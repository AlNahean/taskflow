import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface Note {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

// Create a new note
const createNote = async (note: {
  title: string;
  content?: string;
}): Promise<Note> => {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!response.ok) {
    throw new Error("Failed to create note");
  }
  return response.json();
};

export const useCreateNote = () => {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      router.push(`/notes/${newNote.id}`);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create a new note.",
      });
    },
  });
};
