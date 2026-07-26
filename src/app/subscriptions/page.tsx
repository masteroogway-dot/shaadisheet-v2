import type { Metadata } from "next";
import SubscriptionsView from "./SubscriptionsView";

export const metadata: Metadata = {
  title: "Subscriptions",
  robots: { index: false, follow: false },
};

export default function SubscriptionsPage() {
  return <SubscriptionsView />;
}
