import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { runAsyncAndNotify } from "@/utils/toast";
import { useRouter } from "next/navigation";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";

export const ResetUser = () => {
  const router = useRouter();
  const resetUser = api.user.reset.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button type="button" size="sm" className="text-xs p-0" variant="link">
          Reset your account
        </Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle className="font-cal">Reset your account</CredenzaTitle>
          <CredenzaDescription className="text-[10px] pb-4 text-muted-foreground">
            This is a non reversible action. You will lose all your data
            including previous sessions, authenticators and status for two
            factor verification. Please proceed with caution.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaFooter className="text-start">
          <Button
            onClick={() => runAsyncAndNotify(() => resetUser.mutateAsync())}
            type="submit"
            className="group text-xs font-cal"
            variant="default"
          >
            Reset my account
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};
