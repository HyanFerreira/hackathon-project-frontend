"use client";

import { usePathname } from "next/navigation";
import {
  StudentChallengesSkeleton,
  StudentLiveSkeleton,
  StudentLobbySkeleton,
  StudentProfileSkeleton,
  StudentQuestionsSkeleton,
  StudentRankingSkeleton,
} from "./StudentWorkspaceSkeletons";

export function StudentRouteSkeleton() {
  const pathname = usePathname();

  if (pathname === "/estudantes/desafios") {
    return <StudentChallengesSkeleton />;
  }

  if (pathname === "/estudantes/ao-vivo") {
    return <StudentLiveSkeleton />;
  }

  if (pathname === "/estudantes/ranking") {
    return <StudentRankingSkeleton />;
  }

  if (pathname === "/estudantes/responder") {
    return <StudentQuestionsSkeleton />;
  }

  if (pathname === "/estudantes/missoes") {
    return <StudentProfileSkeleton view="missoes" />;
  }

  if (pathname === "/estudantes/conquistas") {
    return <StudentProfileSkeleton view="conquistas" />;
  }

  if (pathname === "/estudantes/personagens") {
    return <StudentProfileSkeleton view="personagens" />;
  }

  if (pathname === "/estudantes/loja") {
    return <StudentProfileSkeleton view="loja" />;
  }

  return <StudentLobbySkeleton />;
}
