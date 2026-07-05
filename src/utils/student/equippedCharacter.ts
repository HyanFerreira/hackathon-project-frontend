import type { AlunoPersonagem } from "@/types/aluno";

const equippedCharacterStorageKey = "paideia:student:equipped-character-id";

export function readStoredEquippedCharacterId() {
  if (typeof window === "undefined") return null;

  const value = window.localStorage.getItem(equippedCharacterStorageKey);
  const parsedValue = value ? Number(value) : Number.NaN;

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function storeEquippedCharacterId(id: number | null) {
  if (typeof window === "undefined") return;

  if (id === null) {
    window.localStorage.removeItem(equippedCharacterStorageKey);
    return;
  }

  window.localStorage.setItem(equippedCharacterStorageKey, String(id));
}

export function resolveEquippedCharacterId(
  items: AlunoPersonagem[] | undefined,
  preferredId?: number | null,
) {
  if (!items?.length) return null;

  if (
    preferredId !== null &&
    preferredId !== undefined &&
    items.some((personagem) => personagem.personagemId === preferredId)
  ) {
    return preferredId;
  }

  return (
    items.find((personagem) => personagem.equipped)?.personagemId ??
    items[0].personagemId
  );
}

export function markEquippedCharacter(
  items: AlunoPersonagem[] | undefined,
  equippedId: number | null,
) {
  return items?.map((personagem) => ({
    ...personagem,
    equipped: personagem.personagemId === equippedId,
  }));
}
