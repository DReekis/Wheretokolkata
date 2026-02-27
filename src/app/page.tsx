import { redirect } from "next/navigation";
import { DEFAULT_CITY } from "@/lib/cities";

export default function Home() {
    redirect(`/${DEFAULT_CITY}/explore`);
}
