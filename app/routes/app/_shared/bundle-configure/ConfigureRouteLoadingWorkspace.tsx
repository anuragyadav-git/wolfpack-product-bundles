import { AdminRouteLoadingBar } from "../../../../components/AdminRouteLoadingBar";

type ConfigureRouteLoadingWorkspaceProps = {
  label?: string;
};

export function ConfigureRouteLoadingWorkspace({
  label = "Loading Configure",
}: ConfigureRouteLoadingWorkspaceProps) {
  return <AdminRouteLoadingBar label={label} />;
}
