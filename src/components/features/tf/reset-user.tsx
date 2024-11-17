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
import {
  AnimatedButton,
  useAnimatedButton,
} from "../global/buttons/animated-button";

export const ResetUser = () => {
  const router = useRouter();
  const resetUser = api.user.reset.useMutation();
  const { buttonState, changeButtonState } = useAnimatedButton();

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
          <AnimatedButton
            onClick={() =>
              runAsyncAndNotify(() => resetUser.mutateAsync(), {
                onSuccess: () => {
                  router.refresh();
                },
                setButtonState: changeButtonState,
              })
            }
            type="button"
            buttonState={buttonState}
            labels={{
              idle: "Reset account",
              success: "Account reset",
              error: "Error resetting account",
            }}
          />
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};
