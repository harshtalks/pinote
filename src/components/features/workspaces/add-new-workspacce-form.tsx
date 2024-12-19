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
import { addnewWorkspaceSchema, AddNewWorkspaceSchema } from "@/db/schema/*";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

export const AddNewWorkspaceForm = ({
  onCancel,
}: {
  onCancel?: () => void;
}) => {
  const form = useForm<AddNewWorkspaceSchema>({
    resolver: zodResolver(addnewWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: "false",
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4 max-w-xl"
        onSubmit={form.handleSubmit(console.log)}
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
          <Button type="submit">Create Workspace</Button>
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
