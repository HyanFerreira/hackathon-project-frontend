import type { StaticImageData } from "next/image";
import avatarDemo from "@/assets/images/avatar-demo.png";
import gruntLevel1 from "@/assets/images/avatares/grunt_chibi_level_1.svg";
import gruntLevel2 from "@/assets/images/avatares/grunt_chibi_level_2.svg";
import gruntLevel3 from "@/assets/images/avatares/grunt_chibi_level_3.svg";
import leoLevel1 from "@/assets/images/avatares/leo_juv_level_1.svg";
import leoLevel2 from "@/assets/images/avatares/leo_juv_level_2.svg";
import leoLevel3 from "@/assets/images/avatares/leo_juv_level_3.svg";
import lunaLevel1 from "@/assets/images/avatares/luna_juv_level_1.svg";
import lunaLevel2 from "@/assets/images/avatares/luna_juv_level_2.svg";
import lunaLevel3 from "@/assets/images/avatares/luna_juv_level_3.svg";
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

const avatarImages: Record<string, StaticImageData> = {
  "grunt_chibi_level_1.png": gruntLevel1,
  "grunt_chibi_level_2.png": gruntLevel2,
  "grunt_chibi_level_3.png": gruntLevel3,
  "leo_juv_level_1.png": leoLevel1,
  "leo_juv_level_2.png": leoLevel2,
  "leo_juv_level_3.png": leoLevel3,
  "luna_juv_level_1.png": lunaLevel1,
  "luna_juv_level_2.png": lunaLevel2,
  "luna_juv_level_3.png": lunaLevel3,
  "pip_chibi_v2_level_1.png": pipLevel1,
  "pip_chibi_v2_level_2.png": pipLevel2,
  "pip_chibi_v2_level_3.png": pipLevel3,
};

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

  return avatarImages[image] ?? avatarDemo;
}

export function getAchievementImage(icon?: string) {
  if (!icon) return undefined;

  return achievementImages[icon];
}
