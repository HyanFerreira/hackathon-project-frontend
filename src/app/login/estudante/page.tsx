import { LoginScreen } from "@/components/ui/auth/LoginScreen";

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string }>;
}) {
  const { codigo } = await searchParams;

  return <LoginScreen mode="aluno" initialCodigo={codigo} />;
}
