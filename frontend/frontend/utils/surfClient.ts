// Surf client disabled due to version conflicts
// Replace with direct aptosClient usage
import { aptosClient } from "./aptosClient";

export function surfClient() {
  return aptosClient();
}
