import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const teams = [
  // GRUPO A
  { name: "Mexico",        nameEs: "México",         countryCode: "mx", flagUrl: "https://flagcdn.com/w80/mx.png",     groupName: "A" },
  { name: "Jamaica",       nameEs: "Jamaica",         countryCode: "jm", flagUrl: "https://flagcdn.com/w80/jm.png",     groupName: "A" },
  { name: "Switzerland",   nameEs: "Suiza",           countryCode: "ch", flagUrl: "https://flagcdn.com/w80/ch.png",     groupName: "A" },
  { name: "South Africa",  nameEs: "Sudáfrica",       countryCode: "za", flagUrl: "https://flagcdn.com/w80/za.png",     groupName: "A" },
  // GRUPO B
  { name: "United States", nameEs: "Estados Unidos",  countryCode: "us", flagUrl: "https://flagcdn.com/w80/us.png",     groupName: "B" },
  { name: "Panama",        nameEs: "Panamá",          countryCode: "pa", flagUrl: "https://flagcdn.com/w80/pa.png",     groupName: "B" },
  { name: "Uruguay",       nameEs: "Uruguay",         countryCode: "uy", flagUrl: "https://flagcdn.com/w80/uy.png",     groupName: "B" },
  { name: "Cameroon",      nameEs: "Camerún",         countryCode: "cm", flagUrl: "https://flagcdn.com/w80/cm.png",     groupName: "B" },
  // GRUPO C
  { name: "Canada",        nameEs: "Canadá",          countryCode: "ca", flagUrl: "https://flagcdn.com/w80/ca.png",     groupName: "C" },
  { name: "Morocco",       nameEs: "Marruecos",       countryCode: "ma", flagUrl: "https://flagcdn.com/w80/ma.png",     groupName: "C" },
  { name: "New Zealand",   nameEs: "Nueva Zelanda",   countryCode: "nz", flagUrl: "https://flagcdn.com/w80/nz.png",     groupName: "C" },
  { name: "Saudi Arabia",  nameEs: "Arabia Saudita",  countryCode: "sa", flagUrl: "https://flagcdn.com/w80/sa.png",     groupName: "C" },
  // GRUPO D
  { name: "Argentina",     nameEs: "Argentina",       countryCode: "ar", flagUrl: "https://flagcdn.com/w80/ar.png",     groupName: "D" },
  { name: "Ecuador",       nameEs: "Ecuador",         countryCode: "ec", flagUrl: "https://flagcdn.com/w80/ec.png",     groupName: "D" },
  { name: "Japan",         nameEs: "Japón",           countryCode: "jp", flagUrl: "https://flagcdn.com/w80/jp.png",     groupName: "D" },
  { name: "Senegal",       nameEs: "Senegal",         countryCode: "sn", flagUrl: "https://flagcdn.com/w80/sn.png",     groupName: "D" },
  // GRUPO E
  { name: "Brazil",        nameEs: "Brasil",          countryCode: "br", flagUrl: "https://flagcdn.com/w80/br.png",     groupName: "E" },
  { name: "Serbia",        nameEs: "Serbia",          countryCode: "rs", flagUrl: "https://flagcdn.com/w80/rs.png",     groupName: "E" },
  { name: "Uzbekistan",    nameEs: "Uzbekistán",      countryCode: "uz", flagUrl: "https://flagcdn.com/w80/uz.png",     groupName: "E" },
  { name: "Fiji",          nameEs: "Fiyi",            countryCode: "fj", flagUrl: "https://flagcdn.com/w80/fj.png",     groupName: "E" },
  // GRUPO F
  { name: "France",        nameEs: "Francia",         countryCode: "fr", flagUrl: "https://flagcdn.com/w80/fr.png",     groupName: "F" },
  { name: "Nigeria",       nameEs: "Nigeria",         countryCode: "ng", flagUrl: "https://flagcdn.com/w80/ng.png",     groupName: "F" },
  { name: "Algeria",       nameEs: "Argelia",         countryCode: "dz", flagUrl: "https://flagcdn.com/w80/dz.png",     groupName: "F" },
  { name: "Bolivia",       nameEs: "Bolivia",         countryCode: "bo", flagUrl: "https://flagcdn.com/w80/bo.png",     groupName: "F" },
  // GRUPO G
  { name: "Spain",         nameEs: "España",          countryCode: "es", flagUrl: "https://flagcdn.com/w80/es.png",     groupName: "G" },
  { name: "Netherlands",   nameEs: "Países Bajos",    countryCode: "nl", flagUrl: "https://flagcdn.com/w80/nl.png",     groupName: "G" },
  { name: "South Korea",   nameEs: "Corea del Sur",   countryCode: "kr", flagUrl: "https://flagcdn.com/w80/kr.png",     groupName: "G" },
  { name: "Chile",         nameEs: "Chile",           countryCode: "cl", flagUrl: "https://flagcdn.com/w80/cl.png",     groupName: "G" },
  // GRUPO H
  { name: "Germany",       nameEs: "Alemania",        countryCode: "de", flagUrl: "https://flagcdn.com/w80/de.png",     groupName: "H" },
  { name: "Colombia",      nameEs: "Colombia",        countryCode: "co", flagUrl: "https://flagcdn.com/w80/co.png",     groupName: "H" },
  { name: "Poland",        nameEs: "Polonia",         countryCode: "pl", flagUrl: "https://flagcdn.com/w80/pl.png",     groupName: "H" },
  { name: "Hungary",       nameEs: "Hungría",         countryCode: "hu", flagUrl: "https://flagcdn.com/w80/hu.png",     groupName: "H" },
  // GRUPO I
  { name: "Portugal",      nameEs: "Portugal",        countryCode: "pt", flagUrl: "https://flagcdn.com/w80/pt.png",     groupName: "I" },
  { name: "Czech Republic",nameEs: "República Checa", countryCode: "cz", flagUrl: "https://flagcdn.com/w80/cz.png",     groupName: "I" },
  { name: "Georgia",       nameEs: "Georgia",         countryCode: "ge", flagUrl: "https://flagcdn.com/w80/ge.png",     groupName: "I" },
  { name: "Ivory Coast",   nameEs: "Costa de Marfil", countryCode: "ci", flagUrl: "https://flagcdn.com/w80/ci.png",     groupName: "I" },
  // GRUPO J
  { name: "England",       nameEs: "Inglaterra",      countryCode: "gb-eng", flagUrl: "https://flagcdn.com/w80/gb-eng.png", groupName: "J" },
  { name: "Belgium",       nameEs: "Bélgica",         countryCode: "be", flagUrl: "https://flagcdn.com/w80/be.png",     groupName: "J" },
  { name: "Egypt",         nameEs: "Egipto",          countryCode: "eg", flagUrl: "https://flagcdn.com/w80/eg.png",     groupName: "J" },
  { name: "Costa Rica",    nameEs: "Costa Rica",      countryCode: "cr", flagUrl: "https://flagcdn.com/w80/cr.png",     groupName: "J" },
  // GRUPO K
  { name: "Italy",         nameEs: "Italia",          countryCode: "it", flagUrl: "https://flagcdn.com/w80/it.png",     groupName: "K" },
  { name: "Croatia",       nameEs: "Croacia",         countryCode: "hr", flagUrl: "https://flagcdn.com/w80/hr.png",     groupName: "K" },
  { name: "Honduras",      nameEs: "Honduras",        countryCode: "hn", flagUrl: "https://flagcdn.com/w80/hn.png",     groupName: "K" },
  { name: "Philippines",   nameEs: "Filipinas",       countryCode: "ph", flagUrl: "https://flagcdn.com/w80/ph.png",     groupName: "K" },
  // GRUPO L
  { name: "Austria",       nameEs: "Austria",         countryCode: "at", flagUrl: "https://flagcdn.com/w80/at.png",     groupName: "L" },
  { name: "Albania",       nameEs: "Albania",         countryCode: "al", flagUrl: "https://flagcdn.com/w80/al.png",     groupName: "L" },
  { name: "Ghana",         nameEs: "Ghana",           countryCode: "gh", flagUrl: "https://flagcdn.com/w80/gh.png",     groupName: "L" },
  { name: "Tunisia",       nameEs: "Túnez",           countryCode: "tn", flagUrl: "https://flagcdn.com/w80/tn.png",     groupName: "L" },
];

async function main() {
  console.log("🌍 Cargando 48 equipos del Mundial 2026...");

  for (const team of teams) {
    await prisma.team.upsert({
      where: { countryCode: team.countryCode },
      update: { nameEs: team.nameEs, flagUrl: team.flagUrl, groupName: team.groupName },
      create: team,
    });
  }

  console.log(`✅ ${teams.length} equipos cargados correctamente.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
