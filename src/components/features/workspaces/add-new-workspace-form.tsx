"use client";
import {
  FormControl,
  Form,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  AnimatedButton,
  useAnimatedButton,
} from "../global/buttons/animated-button";
import { z } from "zod";
import { api } from "@/trpc/client";
import { runStatefulAsyncAndNotify } from "@/utils/toast";
import { useRouter } from "next/navigation";

const addNewWorkspaceFormSchema = z.object({
  name: z.string().min(1, {
    message: "Workspace name is required",
  }),
  description: z.string().min(1, {
    message: "Workspace description is required",
  }),
  isPrivate: z.union([z.literal("true"), z.literal("false")]),
});

type AddNewWorkspaceFormSchema = z.infer<typeof addNewWorkspaceFormSchema>;

export const AddNewWorkspaceForm = ({
  onCancel,
}: {
  onCancel?: () => void;
}) => {
  const router = useRouter();

  const form = useForm<AddNewWorkspaceFormSchema>({
    resolver: zodResolver(addNewWorkspaceFormSchema),
    shouldUseNativeValidation: true,
    defaultValues: {
      name: "",
      description: "",
      isPrivate: "false",
    },
  });

  const newWorkspaceMutation = api.workspace.newWorkspace.useMutation();

  const { buttonState, changeButtonState } = useAnimatedButton({
    initial: "idle",
  });

  const submitForm = async (data: AddNewWorkspaceFormSchema) => {
    runStatefulAsyncAndNotify(changeButtonState)(
      () =>
        newWorkspaceMutation.mutateAsync({
          name: data.name,
          description: data.description,
          isPrivate: data.isPrivate === "true",
        }),
      {
        onSuccess: () => {
          onCancel?.();
          router.refresh();
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4 max-w-xl"
        onSubmit={form.handleSubmit((data) => submitForm(data))}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Enter Workspace Name"
                  className="shadow-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  className="[resize:none] shadow-none"
                  placeholder="Add a description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem>
              <RadioGroup
                onValueChange={(v) => field.onChange(v)}
                value={field.value}
                defaultValue="false"
                className="gap-2"
              >
                {/* Radio card #1 */}
                <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
                  <FormControl>
                    <RadioGroupItem
                      value="true"
                      aria-describedby="private workspace"
                      className="order-1 after:absolute after:inset-0"
                    />
                  </FormControl>
                  <div className="grid grow gap-2">
                    <Label htmlFor="private">
                      Private Workspace{" "}
                      <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
                        (Premium)
                      </span>
                    </Label>
                    <p id="private" className="text-xs text-muted-foreground">
                      Only you and the people you invite can access this
                      workspace. We plan to monetize this feature in the future.
                    </p>
                  </div>
                </div>
                {/* Radio card #2 */}
                <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
                  <FormControl>
                    <RadioGroupItem
                      value="false"
                      aria-describedby="workspace public"
                      className="order-1 after:absolute after:inset-0"
                    />
                  </FormControl>
                  <div className="grid grow gap-2">
                    <Label htmlFor="public">
                      Public{" "}
                      <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
                        (Open for everyone)
                      </span>
                    </Label>
                    <p id="public" className="text-xs text-muted-foreground">
                      There will be no option to add users to this workspace.
                      Anyone can be part of this workspace. You will have the
                      option to allow people to write or read only.
                    </p>
                  </div>
                </div>
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-2 justify-end">
          <AnimatedButton
            buttonState={buttonState}
            type="submit"
            className="min-w-[220px]"
            labels={{
              idle: "Create new workspace",
              success: "Created Successfully",
              error: "Oops! Something went wrong",
            }}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.reset();
              onCancel?.();
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};
