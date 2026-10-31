import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ComponentProps, PropsWithChildren } from "react";

export function BlogAlertDescription({ children }: PropsWithChildren) {
  return (
    <AlertDescription>
      <p style={{ fontSize: "0.875rem" }}>{children}</p>
    </AlertDescription>
  );
}

export function BlogAlert({
  children,
  ...props
}: ComponentProps<typeof Alert>) {
  return (
    <Alert
      {...props}
      className="border-y-0 border-r-0 border-l-4 border-l-primary bg-darkGray"
    >
      {children}
    </Alert>
  );
}
