import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Copa Mundial 2026 — grupos oficiales (sorteo diciembre 2024)
const teams = [
  // ── GRUPO A ──────────────────────────────────────────
  { name: "Mexico",                nameEs: "México",                      countryCode: "mx",     flagUrl: "https://flagcdn.com/w80/mx.png",     groupName: "A" },
  { name: "South Korea",           nameEs: "Corea del Sur",               countryCode: "kr",     flagUrl: "https://flagcdn.com/w80/kr.png",     groupName: "A" },
  { name: "Czechia",               nameEs: "República Checa",             countryCode: "cz",     flagUrl: "https://flagcdn.com/w80/cz.png",     groupName: "A" },
  { name: "South Africa",          nameEs: "Sudáfrica",                   countryCode: "za",     flagUrl: "https://flagcdn.com/w80/za.png",     groupName: "A" },
  // ── GRUPO B ──────────────────────────────────────────
  { name: "Switzerland",           nameEs: "Suiza",                       countryCode: "ch",     flagUrl: "https://flagcdn.com/w80/ch.png",     groupName: "B" },
  { name: "Canada",                nameEs: "Canadá",                      countryCode: "ca",     flagUrl: "https://flagcdn.com/w80/ca.png",     groupName: "B" },
  { name: "Qatar",                 nameEs: "Catar",                       countryCode: "qa",     flagUrl: "https://flagcdn.com/w80/qa.png",     groupName: "B" },
  { name: "Bosnia and Herzegovina",nameEs: "Bosnia y Herzegovina",        countryCode: "ba",     flagUrl: "https://flagcdn.com/w80/ba.png",     groupName: "B" },
  // ── GRUPO C ──────────────────────────────────────────
  { name: "Brazil",                nameEs: "Brasil",                      countryCode: "br",     flagUrl: "https://flagcdn.com/w80/br.png",     groupName: "C" },
  { name: "Morocco",               nameEs: "Marruecos",                   countryCode: "ma",     flagUrl: "https://flagcdn.com/w80/ma.png",     groupName: "C" },
  { name: "Scotland",              nameEs: "Escocia",                     countryCode: "gb-sct", flagUrl: "https://flagcdn.com/w80/gb-sct.png", groupName: "C" },
  { name: "Haiti",                 nameEs: "Haití",                       countryCode: "ht",     flagUrl: "https://flagcdn.com/w80/ht.png",     groupName: "C" },
  // ── GRUPO D ──────────────────────────────────────────
  { name: "United States",         nameEs: "Estados Unidos",              countryCode: "us",     flagUrl: "https://flagcdn.com/w80/us.png",     groupName: "D" },
  { name: "Australia",             nameEs: "Australia",                   countryCode: "au",     flagUrl: "https://flagcdn.com/w80/au.png",     groupName: "D" },
  { name: "Turkiye",               nameEs: "Turquía",                     countryCode: "tr",     flagUrl: "https://flagcdn.com/w80/tr.png",     groupName: "D" },
  { name: "Paraguay",              nameEs: "Paraguay",                    countryCode: "py",     flagUrl: "https://flagcdn.com/w80/py.png",     groupName: "D" },
  // ── GRUPO E ──────────────────────────────────────────
  { name: "Germany",               nameEs: "Alemania",                    countryCode: "de",     flagUrl: "https://flagcdn.com/w80/de.png",     groupName: "E" },
  { name: "Ivory Coast",           nameEs: "Costa de Marfil",             countryCode: "ci",     flagUrl: "https://flagcdn.com/w80/ci.png",     groupName: "E" },
  { name: "Ecuador",               nameEs: "Ecuador",                     countryCode: "ec",     flagUrl: "https://flagcdn.com/w80/ec.png",     groupName: "E" },
  { name: "Curacao",               nameEs: "Curazao",                     countryCode: "cw",     flagUrl: "https://flagcdn.com/w80/cw.png",     groupName: "E" },
  // ── GRUPO F ──────────────────────────────────────────
  { name: "Netherlands",           nameEs: "Países Bajos",                countryCode: "nl",     flagUrl: "https://flagcdn.com/w80/nl.png",     groupName: "F" },
  { name: "Japan",                 nameEs: "Japón",                       countryCode: "jp",     flagUrl: "https://flagcdn.com/w80/jp.png",     groupName: "F" },
  { name: "Sweden",                nameEs: "Suecia",                      countryCode: "se",     flagUrl: "https://flagcdn.com/w80/se.png",     groupName: "F" },
  { name: "Tunisia",               nameEs: "Túnez",                       countryCode: "tn",     flagUrl: "https://flagcdn.com/w80/tn.png",     groupName: "F" },
  // ── GRUPO G ──────────────────────────────────────────
  { name: "Belgium",               nameEs: "Bélgica",                     countryCode: "be",     flagUrl: "https://flagcdn.com/w80/be.png",     groupName: "G" },
  { name: "Iran",                  nameEs: "Irán",                        countryCode: "ir",     flagUrl: "https://flagcdn.com/w80/ir.png",     groupName: "G" },
  { name: "Egypt",                 nameEs: "Egipto",                      countryCode: "eg",     flagUrl: "https://flagcdn.com/w80/eg.png",     groupName: "G" },
  { name: "New Zealand",           nameEs: "Nueva Zelanda",               countryCode: "nz",     flagUrl: "https://flagcdn.com/w80/nz.png",     groupName: "G" },
  // ── GRUPO H ──────────────────────────────────────────
  { name: "Spain",                 nameEs: "España",                      countryCode: "es",     flagUrl: "https://flagcdn.com/w80/es.png",     groupName: "H" },
  { name: "Uruguay",               nameEs: "Uruguay",                     countryCode: "uy",     flagUrl: "https://flagcdn.com/w80/uy.png",     groupName: "H" },
  { name: "Saudi Arabia",          nameEs: "Arabia Saudita",              countryCode: "sa",     flagUrl: "https://flagcdn.com/w80/sa.png",     groupName: "H" },
  { name: "Cape Verde",            nameEs: "Cabo Verde",                  countryCode: "cv",     flagUrl: "https://flagcdn.com/w80/cv.png",     groupName: "H" },
  // ── GRUPO I ──────────────────────────────────────────
  { name: "France",                nameEs: "Francia",                     countryCode: "fr",     flagUrl: "https://flagcdn.com/w80/fr.png",     groupName: "I" },
  { name: "Senegal",               nameEs: "Senegal",                     countryCode: "sn",     flagUrl: "https://flagcdn.com/w80/sn.png",     groupName: "I" },
  { name: "Iraq",                  nameEs: "Iraq",                        countryCode: "iq",     flagUrl: "https://flagcdn.com/w80/iq.png",     groupName: "I" },
  { name: "Norway",                nameEs: "Noruega",                     countryCode: "no",     flagUrl: "https://flagcdn.com/w80/no.png",     groupName: "I" },
  // ── GRUPO J ──────────────────────────────────────────
  { name: "Argentina",             nameEs: "Argentina",                   countryCode: "ar",     flagUrl: "https://flagcdn.com/w80/ar.png",     groupName: "J" },
  { name: "Algeria",               nameEs: "Argelia",                     countryCode: "dz",     flagUrl: "https://flagcdn.com/w80/dz.png",     groupName: "J" },
  { name: "Austria",               nameEs: "Austria",                     countryCode: "at",     flagUrl: "https://flagcdn.com/w80/at.png",     groupName: "J" },
  { name: "Jordan",                nameEs: "Jordania",                    countryCode: "jo",     flagUrl: "https://flagcdn.com/w80/jo.png",     groupName: "J" },
  // ── GRUPO K ──────────────────────────────────────────
  { name: "Portugal",              nameEs: "Portugal",                    countryCode: "pt",     flagUrl: "https://flagcdn.com/w80/pt.png",     groupName: "K" },
  { name: "Colombia",              nameEs: "Colombia",                    countryCode: "co",     flagUrl: "https://flagcdn.com/w80/co.png",     groupName: "K" },
  { name: "Uzbekistan",            nameEs: "Uzbekistán",                  countryCode: "uz",     flagUrl: "https://flagcdn.com/w80/uz.png",     groupName: "K" },
  { name: "DR Congo",              nameEs: "Rep. Dem. del Congo",         countryCode: "cd",     flagUrl: "https://flagcdn.com/w80/cd.png",     groupName: "K" },
  // ── GRUPO L ──────────────────────────────────────────
  { name: "England",               nameEs: "Inglaterra",                  countryCode: "gb-eng", flagUrl: "https://flagcdn.com/w80/gb-eng.png", groupName: "L" },
  { name: "Croatia",               nameEs: "Croacia",                     countryCode: "hr",     flagUrl: "https://flagcdn.com/w80/hr.png",     groupName: "L" },
  { name: "Ghana",                 nameEs: "Ghana",                       countryCode: "gh",     flagUrl: "https://flagcdn.com/w80/gh.png",     groupName: "L" },
  { name: "Panama",                nameEs: "Panamá",                      countryCode: "pa",     flagUrl: "https://flagcdn.com/w80/pa.png",     groupName: "L" },
];

async function main() {
  console.log("🧹 Limpiando datos anteriores...");
  // Borrar en orden para respetar FK constraints
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();

  console.log("🌍 Cargando 48 equipos del Mundial 2026...");
  await prisma.team.createMany({ data: teams });

  console.log(`✅ ${teams.length} equipos cargados correctamente.`);
  console.log("\nGrupos:");
  for (const g of ["A","B","C","D","E","F","G","H","I","J","K","L"]) {
    const gt = teams.filter((t) => t.groupName === g).map((t) => t.nameEs);
    console.log(`  Grupo ${g}: ${gt.join(", ")}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
