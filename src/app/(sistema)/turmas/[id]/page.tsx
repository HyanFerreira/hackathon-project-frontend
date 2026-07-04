import { TurmaLinksWorkspace } from "@/components/ui/manager/TurmaLinksWorkspace";

type TurmaLinksPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TurmaLinksPage({ params }: TurmaLinksPageProps) {
  const { id } = await params;

  return <TurmaLinksWorkspace turmaId={Number(id)} />;
}
