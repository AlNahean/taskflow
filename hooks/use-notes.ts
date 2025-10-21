import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { createClientLogger } from "@/lib/logger";

const logger = createClientLogger("useNotes");

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
    logger.error("Failed to create note", { status: response.status });
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
      logger.info("Note creation successful", { noteId: newNote.id });
      router.push(`/notes/${newNote.id}`);
    },
    onError: (error) => {
      logger.error("Note creation mutation failed", { error });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create a new note.",
      });
    },
  });
};
