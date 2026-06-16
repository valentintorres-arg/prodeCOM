-- ============================================================
-- SEED: 48 equipos del Mundial 2026
-- Ejecutar en Supabase SQL Editor DESPUÉS del schema
-- Grupos basados en el sorteo de diciembre 2025
-- Verificar en: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/teams
-- ============================================================

INSERT INTO public.teams (name, name_es, country_code, flag_url, group_name) VALUES
-- GRUPO A
('Mexico',       'México',         'mx', 'https://flagcdn.com/w80/mx.png', 'A'),
('Jamaica',      'Jamaica',        'jm', 'https://flagcdn.com/w80/jm.png', 'A'),
('Switzerland',  'Suiza',          'ch', 'https://flagcdn.com/w80/ch.png', 'A'),
('South Africa', 'Sudáfrica',      'za', 'https://flagcdn.com/w80/za.png', 'A'),

-- GRUPO B
('United States','Estados Unidos', 'us', 'https://flagcdn.com/w80/us.png', 'B'),
('Panama',       'Panamá',         'pa', 'https://flagcdn.com/w80/pa.png', 'B'),
('Uruguay',      'Uruguay',        'uy', 'https://flagcdn.com/w80/uy.png', 'B'),
('Cameroon',     'Camerún',        'cm', 'https://flagcdn.com/w80/cm.png', 'B'),

-- GRUPO C
('Canada',       'Canadá',         'ca', 'https://flagcdn.com/w80/ca.png', 'C'),
('Morocco',      'Marruecos',      'ma', 'https://flagcdn.com/w80/ma.png', 'C'),
('New Zealand',  'Nueva Zelanda',  'nz', 'https://flagcdn.com/w80/nz.png', 'C'),
('Saudi Arabia', 'Arabia Saudita', 'sa', 'https://flagcdn.com/w80/sa.png', 'C'),

-- GRUPO D
('Argentina',    'Argentina',      'ar', 'https://flagcdn.com/w80/ar.png', 'D'),
('Ecuador',      'Ecuador',        'ec', 'https://flagcdn.com/w80/ec.png', 'D'),
('Japan',        'Japón',          'jp', 'https://flagcdn.com/w80/jp.png', 'D'),
('Senegal',      'Senegal',        'sn', 'https://flagcdn.com/w80/sn.png', 'D'),

-- GRUPO E
('Brazil',       'Brasil',         'br', 'https://flagcdn.com/w80/br.png', 'E'),
('Serbia',       'Serbia',         'rs', 'https://flagcdn.com/w80/rs.png', 'E'),
('Uzbekistan',   'Uzbekistán',     'uz', 'https://flagcdn.com/w80/uz.png', 'E'),
('Fiji',         'Fiyi',           'fj', 'https://flagcdn.com/w80/fj.png', 'E'),

-- GRUPO F
('France',       'Francia',        'fr', 'https://flagcdn.com/w80/fr.png', 'F'),
('Nigeria',      'Nigeria',        'ng', 'https://flagcdn.com/w80/ng.png', 'F'),
('Algeria',      'Argelia',        'dz', 'https://flagcdn.com/w80/dz.png', 'F'),
('Bolivia',      'Bolivia',        'bo', 'https://flagcdn.com/w80/bo.png', 'F'),

-- GRUPO G
('Spain',        'España',         'es', 'https://flagcdn.com/w80/es.png', 'G'),
('Netherlands',  'Países Bajos',   'nl', 'https://flagcdn.com/w80/nl.png', 'G'),
('South Korea',  'Corea del Sur',  'kr', 'https://flagcdn.com/w80/kr.png', 'G'),
('Chile',        'Chile',          'cl', 'https://flagcdn.com/w80/cl.png', 'G'),

-- GRUPO H
('Germany',      'Alemania',       'de', 'https://flagcdn.com/w80/de.png', 'H'),
('Colombia',     'Colombia',       'co', 'https://flagcdn.com/w80/co.png', 'H'),
('Poland',       'Polonia',        'pl', 'https://flagcdn.com/w80/pl.png', 'H'),
('Hungary',      'Hungría',        'hu', 'https://flagcdn.com/w80/hu.png', 'H'),

-- GRUPO I
('Portugal',     'Portugal',       'pt', 'https://flagcdn.com/w80/pt.png', 'I'),
('Czech Republic','República Checa','cz','https://flagcdn.com/w80/cz.png', 'I'),
('Georgia',      'Georgia',        'ge', 'https://flagcdn.com/w80/ge.png', 'I'),
('Ivory Coast',  'Costa de Marfil','ci', 'https://flagcdn.com/w80/ci.png', 'I'),

-- GRUPO J
('England',      'Inglaterra',     'gb-eng','https://flagcdn.com/w80/gb-eng.png','J'),
('Belgium',      'Bélgica',        'be', 'https://flagcdn.com/w80/be.png', 'J'),
('Egypt',        'Egipto',         'eg', 'https://flagcdn.com/w80/eg.png', 'J'),
('Costa Rica',   'Costa Rica',     'cr', 'https://flagcdn.com/w80/cr.png', 'J'),

-- GRUPO K
('Italy',        'Italia',         'it', 'https://flagcdn.com/w80/it.png', 'K'),
('Croatia',      'Croacia',        'hr', 'https://flagcdn.com/w80/hr.png', 'K'),
('Honduras',     'Honduras',       'hn', 'https://flagcdn.com/w80/hn.png', 'K'),
('Philippines',  'Filipinas',      'ph', 'https://flagcdn.com/w80/ph.png', 'K'),

-- GRUPO L
('Austria',      'Austria',        'at', 'https://flagcdn.com/w80/at.png', 'L'),
('Albania',      'Albania',        'al', 'https://flagcdn.com/w80/al.png', 'L'),
('Ghana',        'Ghana',          'gh', 'https://flagcdn.com/w80/gh.png', 'L'),
('Tunisia',      'Túnez',          'tn', 'https://flagcdn.com/w80/tn.png', 'L')

ON CONFLICT (country_code) DO UPDATE
  SET name_es = EXCLUDED.name_es,
      flag_url = EXCLUDED.flag_url,
      group_name = EXCLUDED.group_name;

-- ============================================================
-- Para crear el primer admin, ejecutar después de registrarte:
--
--   UPDATE public.profiles
--   SET is_admin = true
--   WHERE username = 'TU_USUARIO';
--
-- ============================================================
