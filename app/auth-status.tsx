import { Badge } from "@/components/ui/badge";

type StatusProps = {
  isLoggedIn: boolean;
};

const Status = ({ isLoggedIn }: StatusProps) => (
  <Badge variant="destructive">{isLoggedIn ? "logged in" : "logged out"}</Badge>
);

export default Status;
