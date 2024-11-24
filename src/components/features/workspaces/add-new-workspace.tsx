"use client";

import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { addnewWorkspaceSchema, AddNewWorkspaceSchema } from "@/db/schema/*";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, Form, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export const AddNewWorkspace = () => {
  const form = useForm<AddNewWorkspaceSchema>({
    resolver: zodResolver(addnewWorkspaceSchema),
    defaultValues: {
      name: "",
      isPrivate: "false",
    },
    shouldUseNativeValidation: true,
  });

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button
          variant="ghost"
          className="h-full flex items-center select-none gap-2"
        >
          <span className="p-4 bg-zinc-100 rounded-md">
            <Plus className="size-6" />
          </span>
          <p className="font-light text-lg">Create New Workspace </p>
        </Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(console.log)}>
            <CredenzaHeader>
              <CredenzaTitle>Create New Workspace</CredenzaTitle>
              <CredenzaDescription className="text-xs">
                Create a new workspace to organize your projects and tasks.
              </CredenzaDescription>
            </CredenzaHeader>
            <CredenzaBody className="space-y-4">
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
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <RadioGroup {...field} className="gap-2" defaultValue="false">
                    {/* Radio card #1 */}
                    <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
                      <RadioGroupItem
                        value="true"
                        aria-describedby="private workspace"
                        className="order-1 after:absolute after:inset-0"
                      />
                      <div className="grid grow gap-2">
                        <Label htmlFor="private">
                          Private Workspace{" "}
                          <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
                            (Premium)
                          </span>
                        </Label>
                        <p
                          id="private"
                          className="text-xs text-muted-foreground"
                        >
                          Only you and the people you invite can access this
                          workspace. We plan to monetize this feature in the
                          future.
                        </p>
                      </div>
                    </div>
                    {/* Radio card #2 */}
                    <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
                      <RadioGroupItem
                        value="false"
                        aria-describedby="workspace public"
                        className="order-1 after:absolute after:inset-0"
                      />
                      <div className="grid grow gap-2">
                        <Label htmlFor="public">
                          Public{" "}
                          <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
                            (Open for everyone)
                          </span>
                        </Label>
                        <p
                          id="public"
                          className="text-xs text-muted-foreground"
                        >
                          There will be no option to add users to this
                          workspace. Anyone can be part of this workspace. You
                          will have the option to allow people to write or read
                          only.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                )}
              />
            </CredenzaBody>
            <CredenzaFooter>
              <CredenzaClose asChild>
                <Button type="button" variant="destructive">
                  Cancel
                </Button>
              </CredenzaClose>
              <Button type="submit">Create Workspace</Button>
            </CredenzaFooter>
          </form>
        </Form>
      </CredenzaContent>
    </Credenza>
  );
};
