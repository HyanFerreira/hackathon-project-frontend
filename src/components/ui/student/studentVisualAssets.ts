import type { StaticImageData } from "next/image";
import avatarDemo from "@/assets/images/avatar-demo.png";
import drakoLevel1 from "@/assets/images/avatares/drako_level_1.svg";
import drakoLevel2 from "@/assets/images/avatares/drako_level_2.svg";
import drakoLevel3 from "@/assets/images/avatares/drako_level_3.svg";
import elyraLevel1 from "@/assets/images/avatares/elyra_level_1.svg";
import elyraLevel2 from "@/assets/images/avatares/elyra_level_2.svg";
import elyraLevel3 from "@/assets/images/avatares/elyra_level_3.svg";
import fenroLevel1 from "@/assets/images/avatares/fenro_level_1.svg";
import fenroLevel2 from "@/assets/images/avatares/fenro_level_2.svg";
import fenroLevel3 from "@/assets/images/avatares/fenro_level_3.svg";
import gruntLevel1 from "@/assets/images/avatares/grunt_chibi_level_1.svg";
import gruntLevel2 from "@/assets/images/avatares/grunt_chibi_level_2.svg";
import gruntLevel3 from "@/assets/images/avatares/grunt_chibi_level_3.svg";
import kitsuneLevel1 from "@/assets/images/avatares/kitsune_level_1.svg";
import kitsuneLevel2 from "@/assets/images/avatares/kitsune_level_2.svg";
import kitsuneLevel3 from "@/assets/images/avatares/kitsune_level_3.svg";
import leafyLevel1 from "@/assets/images/avatares/leafy_level_1.svg";
import leafyLevel2 from "@/assets/images/avatares/leafy_level_2.svg";
import leafyLevel3 from "@/assets/images/avatares/leafy_level_3.svg";
import leoLevel1 from "@/assets/images/avatares/leo_level_1.svg";
import leoLevel2 from "@/assets/images/avatares/leo_level_2.svg";
import leoLevel3 from "@/assets/images/avatares/leo_level_3.svg";
import lumiFree from "@/assets/images/avatares/lumi_free.svg";
import lunaLevel1 from "@/assets/images/avatares/luna_level_1.svg";
import lunaLevel2 from "@/assets/images/avatares/luna_level_2.svg";
import lunaLevel3 from "@/assets/images/avatares/luna_level_3.svg";
import noxLevel1 from "@/assets/images/avatares/nox_level_1.svg";
import noxLevel2 from "@/assets/images/avatares/nox_level_2.svg";
import noxLevel3 from "@/assets/images/avatares/nox_level_3.svg";
import pipLevel1 from "@/assets/images/avatares/pip_chibi_v2_level_1.svg";
import pipLevel2 from "@/assets/images/avatares/pip_chibi_v2_level_2.svg";
import pipLevel3 from "@/assets/images/avatares/pip_chibi_v2_level_3.svg";
import achievement01 from "@/assets/images/conquistas/ac01.svg";
import achievement02 from "@/assets/images/conquistas/ac02.svg";
import achievement03 from "@/assets/images/conquistas/ac03.svg";
import achievement04 from "@/assets/images/conquistas/ac04.svg";
import achievement05 from "@/assets/images/conquistas/ac05.svg";
import achievement06 from "@/assets/images/conquistas/ac06.svg";
import achievement07 from "@/assets/images/conquistas/ac07.svg";
import achievement08 from "@/assets/images/conquistas/ac08.svg";
import achievement09 from "@/assets/images/conquistas/ac09.svg";
import achievement10 from "@/assets/images/conquistas/ac10.svg";
import achievement11 from "@/assets/images/conquistas/ac11.svg";
import achievement12 from "@/assets/images/conquistas/ac12.svg";
import achievement13 from "@/assets/images/conquistas/ac13.svg";

const avatarImages: Record<string, StaticImageData> = {};

function registerAvatar(
  key: string,
  image: StaticImageData,
  aliases: string[] = [],
) {
  for (const avatarKey of [key, ...aliases]) {
    avatarImages[`${avatarKey}.svg`] = image;
    avatarImages[`${avatarKey}.png`] = image;
  }
}

registerAvatar("drako_level_1", drakoLevel1);
registerAvatar("drako_level_2", drakoLevel2);
registerAvatar("drako_level_3", drakoLevel3);
registerAvatar("elyra_level_1", elyraLevel1);
registerAvatar("elyra_level_2", elyraLevel2);
registerAvatar("elyra_level_3", elyraLevel3);
registerAvatar("fenro_level_1", fenroLevel1);
registerAvatar("fenro_level_2", fenroLevel2);
registerAvatar("fenro_level_3", fenroLevel3);
registerAvatar("grunt_chibi_level_1", gruntLevel1);
registerAvatar("grunt_chibi_level_2", gruntLevel2);
registerAvatar("grunt_chibi_level_3", gruntLevel3);
registerAvatar("kitsune_level_1", kitsuneLevel1);
registerAvatar("kitsune_level_2", kitsuneLevel2);
registerAvatar("kitsune_level_3", kitsuneLevel3);
registerAvatar("leafy_level_1", leafyLevel1);
registerAvatar("leafy_level_2", leafyLevel2);
registerAvatar("leafy_level_3", leafyLevel3);
registerAvatar("leo_level_1", leoLevel1, ["leo_juv_level_1"]);
registerAvatar("leo_level_2", leoLevel2, ["leo_juv_level_2"]);
registerAvatar("leo_level_3", leoLevel3, ["leo_juv_level_3"]);
registerAvatar("lumi_free", lumiFree, [
  "lumi",
  "lumi_level_1",
  "lumi_level_2",
  "lumi_level_3",
  "lumi_juv_level_1",
  "lumi_juv_level_2",
  "lumi_juv_level_3",
]);
registerAvatar("luna_level_1", lunaLevel1, ["luna_juv_level_1"]);
registerAvatar("luna_level_2", lunaLevel2, ["luna_juv_level_2"]);
registerAvatar("luna_level_3", lunaLevel3, ["luna_juv_level_3"]);
registerAvatar("nox_level_1", noxLevel1);
registerAvatar("nox_level_2", noxLevel2);
registerAvatar("nox_level_3", noxLevel3);
registerAvatar("pip_chibi_v2_level_1", pipLevel1);
registerAvatar("pip_chibi_v2_level_2", pipLevel2);
registerAvatar("pip_chibi_v2_level_3", pipLevel3);

const achievementImages: Record<string, StaticImageData> = {
  "primeiros-passos.svg": achievement01,
  "estudioso.svg": achievement02,
  "dedicado.svg": achievement03,
  "maratonista-do-saber.svg": achievement04,
  "certeiro.svg": achievement05,
  "mestre-das-respostas.svg": achievement06,
  "genio.svg": achievement07,
  "foco-total.svg": achievement08,
  "imparavel.svg": achievement09,
  "colecionador-de-pontos.svg": achievement10,
  "lenda-dos-pontos.svg": achievement11,
  "subindo-de-nivel.svg": achievement12,
  "lenda-da-escola.svg": achievement13,
};

export function getAvatarImage(image?: string) {
  if (!image) return avatarDemo;

  const fileName = image.split(/[\\/]/).at(-1)?.split("?")[0]?.toLowerCase();

  if (!fileName) return avatarDemo;

  return avatarImages[fileName] ?? avatarDemo;
}

export function getAchievementImage(icon?: string) {
  if (!icon) return undefined;

  return achievementImages[icon];
}
