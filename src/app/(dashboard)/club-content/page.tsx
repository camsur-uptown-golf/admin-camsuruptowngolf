import type { Metadata } from "next";
import ClubContent from "@/components/ClubContent";

export const metadata: Metadata = { title: "Events & offers" };

export default function ClubContentPage() {
  return <ClubContent />;
}
