import { redirect } from "next/navigation";

export default async function CityRoot({ params }: { params: Promise<{ city: string }> }) {
    const { city } = await params;
    redirect(`/${city}/explore`);
}
