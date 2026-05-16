import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const databaseUrl = process.env.DATABASE_URL!;
const url = new URL(databaseUrl);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  connectionLimit: 5,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
});
const prisma = new PrismaClient({ adapter });

// ──────────────────────────────────────────────────────────────────
// UNITS
// ──────────────────────────────────────────────────────────────────
const UNITS = [
  { slug: 'sht',   name: 'Штука',              shortName: 'шт',   sortOrder: 0 },
  { slug: 'kg',    name: 'Килограмм',           shortName: 'кг',   sortOrder: 1 },
  { slug: 'm2',    name: 'Квадратный метр',     shortName: 'м²',   sortOrder: 2 },
  { slug: 'm3',    name: 'Кубический метр',     shortName: 'м³',   sortOrder: 3 },
  { slug: 'mp',    name: 'Метр погонный',       shortName: 'м.п.', sortOrder: 4 },
  { slug: 'l',     name: 'Литр',               shortName: 'л',    sortOrder: 5 },
  { slug: 'up',    name: 'Упаковка',            shortName: 'уп.',  sortOrder: 6 },
  { slug: 'rul',   name: 'Рулон',              shortName: 'рул.', sortOrder: 7 },
  { slug: 'kompl', name: 'Комплект',            shortName: 'компл.',sortOrder: 8 },
  { slug: 't',     name: 'Тонна',              shortName: 'т',    sortOrder: 9 },
  { slug: 'mshk',  name: 'Мешок',              shortName: 'мешок',sortOrder: 10 },
];

// ──────────────────────────────────────────────────────────────────
// PRODUCTS per category slug
// ──────────────────────────────────────────────────────────────────
type ProductSeed = {
  name: string;
  slug: string;
  description?: string;
  price: number;
  unit: string; // unit slug
  qty: number;
};

const PRODUCTS: Record<string, ProductSeed[]> = {

  // ── Строительные материалы ──────────────────────────────────────
  'tsement-smesi-shtukaturka': [
    { name: 'Цемент М500 Д0 50кг', slug: 'tsement-m500-d0-50kg', description: 'Портландцемент без добавок, марка М500, мешок 50 кг. Применяется для ответственных конструкций и монолитного бетона.', price: 490, unit: 'mshk', qty: 250 },
    { name: 'Цемент М400 Д20 50кг', slug: 'tsement-m400-d20-50kg', description: 'Портландцемент с минеральными добавками 20%, марка М400, мешок 50 кг.', price: 420, unit: 'mshk', qty: 300 },
    { name: 'Штукатурка гипсовая Knauf Rotband 30кг', slug: 'shtukaturka-knauf-rotband-30kg', description: 'Универсальная гипсовая штукатурка для ручного и машинного нанесения. Слой 5–50 мм.', price: 980, unit: 'mshk', qty: 150 },
    { name: 'Штукатурка цементная М150 25кг', slug: 'shtukaturka-tsementnaya-m150-25kg', description: 'Цементно-песчаная штукатурная смесь для внутренних и наружных работ.', price: 320, unit: 'mshk', qty: 200 },
    { name: 'Шпаклёвка финишная Vetonit LR+ 25кг', slug: 'shpaklyovka-vetonit-lr-25kg', description: 'Финишная полимерная шпаклёвка для получения идеально гладких поверхностей.', price: 760, unit: 'mshk', qty: 120 },
    { name: 'Пескобетон М300 40кг', slug: 'peskoбетон-m300-40kg', description: 'Сухая смесь на основе цемента и карьерного песка. Применяется для стяжек и фундаментов.', price: 280, unit: 'mshk', qty: 400 },
  ],

  'kirpich-bloki-kamen': [
    { name: 'Кирпич красный рядовой одинарный М150', slug: 'kirpich-krasnyy-ryadovoy-m150', description: 'Полнотелый керамический кирпич. Размер 250×120×65 мм, марка М150.', price: 18, unit: 'sht', qty: 10000 },
    { name: 'Кирпич силикатный белый одинарный М200', slug: 'kirpich-silikatnyy-belyy-m200', description: 'Силикатный кирпич для кладки стен. Размер 250×120×65 мм.', price: 14, unit: 'sht', qty: 8000 },
    { name: 'Блок газобетонный D500 600×200×300', slug: 'blok-gazobetонный-d500-600-200-300', description: 'Автоклавный газобетон плотностью D500. Класс прочности B2.5.', price: 195, unit: 'sht', qty: 500 },
    { name: 'Блок пенобетонный D600 600×300×200', slug: 'blok-penobetонный-d600', description: 'Неавтоклавный пенобетон плотностью D600. Для возведения перегородок и стен.', price: 120, unit: 'sht', qty: 600 },
    { name: 'Блок керамзитобетонный 390×190×188', slug: 'blok-keramzitobetонный-390-190-188', description: 'Стеновой керамзитобетонный блок. Хорошая тепло- и звукоизоляция.', price: 85, unit: 'sht', qty: 800 },
  ],

  'pesok-shcheben-graviy': [
    { name: 'Песок речной (мешок 50кг)', slug: 'pesok-rechnoy-meshok-50kg', description: 'Промытый речной песок без примесей. Фракция 0.5–2 мм.', price: 180, unit: 'mshk', qty: 500 },
    { name: 'Песок карьерный мытый (мешок 50кг)', slug: 'pesok-karyernыy-mytyy-50kg', description: 'Карьерный промытый песок. Применяется в строительных растворах.', price: 140, unit: 'mshk', qty: 700 },
    { name: 'Щебень гранитный фр. 5–20 (мешок 50кг)', slug: 'shcheben-granitnyy-fr5-20-50kg', description: 'Гранитный щебень фракции 5–20 мм. Для бетонных смесей и дренажа.', price: 220, unit: 'mshk', qty: 600 },
    { name: 'Щебень гранитный фр. 20–40 (мешок 50кг)', slug: 'shcheben-granitnyy-fr20-40-50kg', description: 'Крупный гранитный щебень фракции 20–40 мм.', price: 200, unit: 'mshk', qty: 400 },
    { name: 'Гравий фр. 10–20 (мешок 50кг)', slug: 'graviy-fr10-20-50kg', description: 'Природный гравий фракции 10–20 мм. Для бетонирования и засыпки.', price: 170, unit: 'mshk', qty: 450 },
  ],

  'utepliteli': [
    { name: 'Минвата Rockwool Лайт Баттс 50мм (уп.)', slug: 'minvata-rockwool-50mm-up', description: 'Негорючая базальтовая минеральная вата 50 мм. Упаковка 10 плит (3.05 м²). Для стен и кровли.', price: 1850, unit: 'up', qty: 80 },
    { name: 'Пенопласт ПСБ-С-25 50мм (1.0×0.5м)', slug: 'penoplast-psb-s25-50mm', description: 'Плита пенополистирола ПСБ-С-25, толщина 50 мм. Для утепления фасадов и перекрытий.', price: 280, unit: 'sht', qty: 300 },
    { name: 'ЭППС Технониколь 50мм (1.2×0.6м)', slug: 'epps-tehnonikol-50mm', description: 'Экструдированный пенополистирол толщиной 50 мм. Высокая прочность, влагостойкость.', price: 420, unit: 'sht', qty: 250 },
    { name: 'Базальтовая вата Isover 100мм (уп.)', slug: 'bazaltovaya-vata-isover-100mm', description: 'Плиты из базальтового волокна, 100 мм. Для утепления кровли и перекрытий.', price: 3200, unit: 'up', qty: 60 },
    { name: 'Пенофол тип А 3мм (рулон 18м²)', slug: 'penofol-tip-a-3mm-rulon', description: 'Фольгированный вспененный полиэтилен. Теплоотражающая изоляция для саун и стен.', price: 650, unit: 'rul', qty: 100 },
  ],

  'gidroizolyatsiya': [
    { name: 'Рубероид РКП-350 (рулон 15м²)', slug: 'ruberoid-rkp-350-rulon', description: 'Рулонный гидроизоляционный материал на основе стеклохолста. Для кровли и фундаментов.', price: 480, unit: 'rul', qty: 120 },
    { name: 'Гидроизол ХПП (рулон 10м²)', slug: 'gidroizol-hpp-rulon', description: 'Наплавляемый гидроизоляционный материал на полиэфирной основе.', price: 560, unit: 'rul', qty: 90 },
    { name: 'Мастика битумная холодная 18кг', slug: 'mastika-bitumnaya-18kg', description: 'Готовая к применению битумная мастика. Для обмазочной гидроизоляции фундаментов.', price: 1200, unit: 'sht', qty: 80 },
    { name: 'Пенетрон 25кг', slug: 'penetron-25kg', description: 'Проникающая гидроизоляция для бетона. Защита от напорных и ненапорных вод.', price: 3800, unit: 'mshk', qty: 30 },
    { name: 'Технониколь Технофлекс (рулон 10м²)', slug: 'tehnonikol-tehnofleks-rulon', description: 'Наплавляемый битумно-полимерный материал для гидроизоляции кровли.', price: 1400, unit: 'rul', qty: 70 },
  ],

  'paroizolyatsiya-i-plyonki': [
    { name: 'Плёнка полиэтиленовая 200мкм (рулон 50м²)', slug: 'plyonka-polietilenovaya-200mkm', description: 'Строительная полиэтиленовая плёнка 200 мкм. Для пароизоляции и защиты от влаги.', price: 780, unit: 'rul', qty: 100 },
    { name: 'Изоспан В (пароизоляция, рулон 70м²)', slug: 'izospan-v-rulon-70m2', description: 'Полипропиленовая паро- и ветрозащитная плёнка. Класс паронепроницаемости высокий.', price: 1850, unit: 'rul', qty: 60 },
    { name: 'Изоспан А (ветро-гидрозащита, рулон 70м²)', slug: 'izospan-a-rulon-70m2', description: 'Паропроницаемая ветро- и гидрозащитная мембрана для скатных кровель.', price: 2100, unit: 'rul', qty: 50 },
    { name: 'Плёнка армированная 120г/м² (рулон 50м²)', slug: 'plyonka-armirovannaya-120-rulon', description: 'Тканевая армированная плёнка для временной защиты конструкций.', price: 1100, unit: 'rul', qty: 80 },
  ],

  // ── Кровля и фасад ──────────────────────────────────────────────
  'metallocherepitsa-i-profnastil': [
    { name: 'Металлочерепица Монтеррей 0.5мм (м²)', slug: 'metallocherepitsa-monterrey-0-5mm', description: 'Металлочерепица с полиэстеровым покрытием, толщина стали 0.5 мм. Длина листа под заказ.', price: 520, unit: 'm2', qty: 500 },
    { name: 'Профнастил НС35 0.7мм (м²)', slug: 'profnastil-ns35-0-7mm', description: 'Несущий профилированный лист высотой 35 мм, толщина 0.7 мм. Для кровли и перекрытий.', price: 480, unit: 'm2', qty: 400 },
    { name: 'Профнастил С8 0.5мм (м²)', slug: 'profnastil-s8-0-5mm', description: 'Стеновой профнастил высотой 8 мм, толщина 0.5 мм. Для заборов и обшивки.', price: 340, unit: 'm2', qty: 600 },
    { name: 'Конёк кровельный 2.0м', slug: 'konok-krovelnыy-2m', description: 'Простой кровельный конёк для металлочерепицы и профнастила. Длина 2.0 м.', price: 380, unit: 'sht', qty: 200 },
    { name: 'Снегодержатель трубчатый 3.0м', slug: 'snegoderzhatel-trubchatyy-3m', description: 'Трубчатый снегозадерживающий барьер для металлических кровель. Длина 3.0 м.', price: 1200, unit: 'sht', qty: 150 },
  ],

  'myagkaya-krovlya': [
    { name: 'Битумная черепица Shinglas Классик (уп. 3м²)', slug: 'bitumnaya-cherepitsa-shinglas-klassik', description: 'Гибкая битумная черепица Shinglas серия Классик. В упаковке ~3 м².', price: 1650, unit: 'up', qty: 100 },
    { name: 'Битумная черепица ТЕХНОНИКОЛЬ Катепал (уп. 3м²)', slug: 'bitumnaya-cherepitsa-tehnonikol-katepal', description: 'Финский материал для скатных кровель. Стеклохолст + модифицированный битум.', price: 1900, unit: 'up', qty: 80 },
    { name: 'Подкладочный ковёр Anderep Ultra (рулон 15м²)', slug: 'podkladochnyy-kover-anderep-ultra', description: 'Самоклеящийся подкладочный ковёр для усиления примыканий и ендов.', price: 2800, unit: 'rul', qty: 40 },
    { name: 'Ендовый ковёр Shinglas (рулон 10м²)', slug: 'endovyy-kover-shinglas', description: 'Защитный ковёр для ендов и примыканий мягкой кровли.', price: 1400, unit: 'rul', qty: 50 },
  ],

  'vodostochnye-sistemy': [
    { name: 'Труба водосточная ПВХ ø100 3.0м', slug: 'truba-vodostochnaya-pvh-100-3m', description: 'Труба водосточной системы ПВХ, диаметр 100 мм, длина 3 м. Цвет коричневый/белый.', price: 560, unit: 'sht', qty: 200 },
    { name: 'Желоб водосточный ПВХ ø125 3.0м', slug: 'zheлob-vodostochnyy-pvh-125-3m', description: 'Полукруглый водосточный желоб ПВХ. Ширина 125 мм, длина 3 м.', price: 680, unit: 'sht', qty: 180 },
    { name: 'Воронка водосточная ø125/100', slug: 'voronka-vodostochnaya-125-100', description: 'Воронка для подключения трубы к желобу. Комплект с сеткой от листьев.', price: 420, unit: 'sht', qty: 150 },
    { name: 'Колено трубы 45° ø100', slug: 'koleno-truby-45-100', description: 'Отводное колено 45° для водосточных труб ø100 мм.', price: 180, unit: 'sht', qty: 250 },
    { name: 'Крюк желоба длинный (комплект 10шт)', slug: 'kryuk-zheloba-dlinnyy-10sht', description: 'Монтажный крюк для крепления желоба к стропилам. Оцинкованная сталь.', price: 650, unit: 'kompl', qty: 120 },
  ],

  'sayding-i-oblitsovka': [
    { name: 'Сайдинг виниловый 3.66м (уп. 14 планок)', slug: 'sayding-vinilovyy-up-14-planok', description: 'Виниловый сайдинг шириной 200 мм, длина 3.66 м. В упаковке 14 планок (≈10 м²).', price: 3200, unit: 'up', qty: 80 },
    { name: 'Сайдинг металлический 3.0м (уп.)', slug: 'sayding-metallicheskiy-3m', description: 'Стальной сайдинг с полимерным покрытием. Толщина 0.5 мм, ширина 203 мм.', price: 4500, unit: 'up', qty: 60 },
    { name: 'Фасадная панель под кирпич (уп. 10шт)', slug: 'fasadnaya-panel-pod-kirpich', description: 'Термопанели с имитацией кирпича для отделки фасада. Размер 795×595 мм.', price: 5800, unit: 'up', qty: 40 },
    { name: 'Фасадная плитка клинкер (уп. 0.5м²)', slug: 'fasadnaya-plitka-klinker', description: 'Клинкерная плитка для облицовки фасадов. Морозостойкая, толщина 10 мм.', price: 1200, unit: 'up', qty: 90 },
  ],

  'dobornye-elementy': [
    { name: 'Ветровая планка левая 2.0м', slug: 'vetrovaya-planka-levaya-2m', description: 'Торцевая ветровая планка для металлочерепицы, левая. Длина 2 м.', price: 320, unit: 'sht', qty: 200 },
    { name: 'Карнизная планка 2.0м', slug: 'karniznaya-planka-2m', description: 'Планка карнизная для кровли из металлочерепицы или профнастила.', price: 290, unit: 'sht', qty: 180 },
    { name: 'Планка примыкания 2.0м', slug: 'planka-primykaniya-2m', description: 'Верхняя планка примыкания кровли к стенам и вертикальным конструкциям.', price: 350, unit: 'sht', qty: 150 },
    { name: 'Конёк плоский 2.0м', slug: 'konok-ploskiy-2m', description: 'Плоский конёк для кровли из профнастила. Ширина 190×190 мм.', price: 380, unit: 'sht', qty: 160 },
  ],

  // ── Стены и перегородки ─────────────────────────────────────────
  'gipsokarton': [
    { name: 'ГКЛ Knauf 12.5мм 1200×2500', slug: 'gkl-knauf-12-5mm-1200-2500', description: 'Стандартный гипсокартонный лист Knauf. Толщина 12.5 мм, размер 1200×2500 мм.', price: 480, unit: 'sht', qty: 500 },
    { name: 'ГКЛВ Knauf влагостойкий 12.5мм 1200×2500', slug: 'gklv-knauf-12-5mm-1200-2500', description: 'Влагостойкий гипсокартон (зелёный). Для ванных, кухонь, влажных помещений.', price: 580, unit: 'sht', qty: 300 },
    { name: 'ГКЛО Knauf огнестойкий 12.5мм 1200×2500', slug: 'gklo-knauf-12-5mm-1200-2500', description: 'Огнестойкий гипсокартон (розовый). Для защиты несущих конструкций.', price: 620, unit: 'sht', qty: 200 },
    { name: 'ГКЛ Knauf 9.5мм 1200×2500', slug: 'gkl-knauf-9-5mm-1200-2500', description: 'Тонкий гипсокартонный лист 9.5 мм для изогнутых поверхностей и облицовки.', price: 420, unit: 'sht', qty: 250 },
  ],

  'profil-dlya-gkl': [
    { name: 'Профиль направляющий ПН 50×40 3.0м', slug: 'profil-pn-50-40-3m', description: 'Направляющий профиль для каркаса перегородок. Оцинкованная сталь 0.55 мм.', price: 145, unit: 'sht', qty: 600 },
    { name: 'Профиль стоечный ПС 50×50 3.0м', slug: 'profil-ps-50-50-3m', description: 'Стоечный профиль для перегородок ПС 50/50. Длина 3.0 м.', price: 185, unit: 'sht', qty: 500 },
    { name: 'Профиль потолочный ПП 60×27 3.0м', slug: 'profil-pp-60-27-3m', description: 'Потолочный несущий профиль ПП 60/27. Для подвесных потолков. Длина 3.0 м.', price: 175, unit: 'sht', qty: 450 },
    { name: 'Профиль направляющий ПНП 28×27 3.0м', slug: 'profil-pnp-28-27-3m', description: 'Направляющий потолочный профиль UD 28/27. Длина 3.0 м.', price: 125, unit: 'sht', qty: 400 },
    { name: 'Подвес прямой для потолочного профиля', slug: 'podves-pryamoy-dlya-potolka', description: 'Прямой (П-образный) подвес для крепления потолочного профиля к перекрытию.', price: 18, unit: 'sht', qty: 2000 },
  ],

  'pazogrebneve-plity': [
    { name: 'ПГП Knauf 80мм полнотелая (1 пал. = 30шт)', slug: 'pgp-knauf-80mm-polnoteaya', description: 'Гипсовая пазогребневая плита Knauf, толщина 80 мм. Для ненесущих перегородок.', price: 620, unit: 'sht', qty: 400 },
    { name: 'ПГП Knauf влагостойкая 80мм', slug: 'pgp-knauf-vlagostoykaya-80mm', description: 'Влагостойкая пазогребневая плита для помещений с повышенной влажностью.', price: 720, unit: 'sht', qty: 250 },
    { name: 'ПГП пустотелая 80мм', slug: 'pgp-pustoteaya-80mm', description: 'Лёгкая пустотелая пазогребневая плита. Снижает нагрузку на перекрытие.', price: 480, unit: 'sht', qty: 300 },
    { name: 'ПГП 100мм полнотелая', slug: 'pgp-100mm-polnotelnaya', description: 'Утолщённая пазогребневая плита 100 мм для улучшенной звукоизоляции.', price: 780, unit: 'sht', qty: 180 },
  ],

  'paneli-i-vagonka': [
    { name: 'Вагонка сосна евро 96мм 2.7м (уп. 10шт)', slug: 'vagonka-sosna-evro-96mm-2-7m', description: 'Деревянная вагонка из сосны, профиль Евро. Ширина 96 мм, длина 2.7 м. Упаковка 10 шт.', price: 1800, unit: 'up', qty: 100 },
    { name: 'МДФ панель 2600×250×7мм', slug: 'mdf-panel-2600-250-7mm', description: 'Ламинированная МДФ панель для отделки стен. Размер 2600×250×7 мм.', price: 380, unit: 'sht', qty: 200 },
    { name: 'ПВХ панель 3000×250×8мм', slug: 'pvh-panel-3000-250-8mm', description: 'Пластиковая ПВХ панель. Влагостойкая, лёгкий монтаж, для ванных и кухонь.', price: 220, unit: 'sht', qty: 300 },
    { name: 'Блок-хаус сосна 90мм 3.0м', slug: 'blok-khaus-sosna-90mm-3m', description: 'Имитация бревна из сосны, ширина 90 мм, длина 3.0 м. Для интерьерной отделки.', price: 280, unit: 'sht', qty: 150 },
  ],

  // ── Полы ────────────────────────────────────────────────────────
  'laminat': [
    { name: 'Ламинат Quick-Step Impressive 32кл 8мм (уп.)', slug: 'laminat-quick-step-impressive-32kl', description: 'Ламинат Quick-Step Impressive, класс нагрузки 32, толщина 8 мм. В упаковке 1.84 м².', price: 2800, unit: 'up', qty: 150 },
    { name: 'Ламинат Kronospan Castello 33кл 12мм (уп.)', slug: 'laminat-kronospan-castello-33kl', description: 'Ламинат Kronospan 33 класс, толщина 12 мм. Повышенная стойкость к нагрузкам.', price: 3500, unit: 'up', qty: 120 },
    { name: 'Ламинат Pergo Original Excellence 33кл (уп.)', slug: 'laminat-pergo-original-33kl', description: 'Ламинат Pergo шведского производства. Класс 33, защита от влаги.', price: 4200, unit: 'up', qty: 80 },
    { name: 'Ламинат Egger Pro 32кл 8мм (уп. 2.0м²)', slug: 'laminat-egger-pro-32kl-8mm', description: 'Ламинат Egger с защитным покрытием EPL. Класс нагрузки 32.', price: 1950, unit: 'up', qty: 200 },
  ],

  'parketnaya-doska': [
    { name: 'Паркетная доска Tarkett дуб 14мм (уп. 2.28м²)', slug: 'parketnaya-doska-tarkett-dub-14mm', description: 'Трёхслойная паркетная доска из дуба. Толщина 14 мм, лак матовый. Tarkett Salsa.', price: 4800, unit: 'up', qty: 80 },
    { name: 'Паркетная доска Boen дуб Animoso 14мм', slug: 'parketnaya-doska-boen-dub-14mm', description: 'Паркетная доска Boen 3-полосная. Отборный дуб, масло натуральное.', price: 7200, unit: 'up', qty: 50 },
    { name: 'Инженерная доска дуб 20мм (уп. 1.6м²)', slug: 'inzhenernaya-doska-dub-20mm', description: 'Инженерная (двухслойная) доска с шпоном дуба 6 мм на фанере 14 мм.', price: 5500, unit: 'up', qty: 60 },
  ],

  'plitka-i-keramogranit': [
    { name: 'Керамогранит 600×600×10мм (уп. 1.44м²)', slug: 'keramogranit-600-600-10mm', description: 'Неполированный керамогранит 60×60 см. Класс морозостойкости: Fпр ≥ 50 циклов.', price: 1650, unit: 'up', qty: 200 },
    { name: 'Керамогранит полированный 600×600мм (уп.)', slug: 'keramogranit-polvr-600-600', description: 'Полированный керамогранит 60×60 см. Для жилых и коммерческих помещений.', price: 2100, unit: 'up', qty: 150 },
    { name: 'Плитка настенная 300×600мм (уп. 1.08м²)', slug: 'plitka-nastennaya-300-600', description: 'Глазурованная настенная плитка 30×60 см. Для ванных комнат и кухонь.', price: 1200, unit: 'up', qty: 180 },
    { name: 'Клинкерная плитка 240×71мм (уп. 0.5м²)', slug: 'klinkernaya-plitka-240-71', description: 'Клинкерная плитка под кирпич. Морозостойкая, для полов и фасадов.', price: 1800, unit: 'up', qty: 100 },
  ],

  'styazhka-i-nalivnye-poly': [
    { name: 'Стяжка пескоцементная М150 25кг', slug: 'styazhka-peskotsementnaya-m150-25kg', description: 'Сухая смесь для устройства полусухой стяжки пола. Слой 30–80 мм.', price: 260, unit: 'mshk', qty: 500 },
    { name: 'Наливной пол Bergauf Boden Nivelir 25кг', slug: 'nalivnoy-pol-bergauf-boden-25kg', description: 'Самовыравнивающийся наливной пол. Слой 3–60 мм, время высыхания 3–4 часа.', price: 680, unit: 'mshk', qty: 200 },
    { name: 'Наливной пол Knauf Boden 15 25кг', slug: 'nalivnoy-pol-knauf-boden-15-25kg', description: 'Быстротвердеющий наливной пол для тонкого слоя 1–15 мм.', price: 820, unit: 'mshk', qty: 150 },
    { name: 'Ровнитель для пола Ceresit CN 88 25кг', slug: 'rovnitel-ceresit-cn88-25kg', description: 'Быстротвердеющий выравниватель для пола. Хождение через 2 часа.', price: 950, unit: 'mshk', qty: 120 },
  ],

  'podlozhka-i-izolyatsiya': [
    { name: 'Подложка под ламинат Arbiton 3мм (рулон 10м²)', slug: 'podlozhka-arbiton-3mm-rulon', description: 'Вспененная полиэтиленовая подложка 3 мм. Для ламината и паркетной доски.', price: 350, unit: 'rul', qty: 200 },
    { name: 'Подложка пробковая 4мм (рулон 10м²)', slug: 'podlozhka-probkovaya-4mm-rulon', description: 'Натуральная пробковая подложка 4 мм. Высокая звуко- и теплоизоляция.', price: 950, unit: 'rul', qty: 100 },
    { name: 'Подложка Tuplex 3мм (рулон 15м²)', slug: 'podlozhka-tuplex-3mm-rulon', description: 'Трёхслойная подложка Tuplex с вентиляционным каналом. Отводит влагу.', price: 1200, unit: 'rul', qty: 80 },
    { name: 'Звукоизоляция Шумостоп С2 12мм (уп. 3.6м²)', slug: 'zvukoizolyatsiya-shumostop-s2', description: 'Акустические маты для звукоизоляции пола. Снижают ударный шум на 27 дБ.', price: 2200, unit: 'up', qty: 50 },
  ],

  // ── Двери и окна ────────────────────────────────────────────────
  'mezhkomnatnye-dveri': [
    { name: 'Дверь межкомнатная ДГ 800×2000 (глухая)', slug: 'dver-mezh-dg-800-2000', description: 'Глухая межкомнатная дверь из МДФ. Размер полотна 800×2000 мм, толщина 38 мм.', price: 6800, unit: 'sht', qty: 60 },
    { name: 'Дверь межкомнатная ДО 800×2000 (со стеклом)', slug: 'dver-mezh-do-800-2000', description: 'Межкомнатная дверь со стеклянными вставками. МДФ, экошпон дуб.', price: 8500, unit: 'sht', qty: 50 },
    { name: 'Дверь межкомнатная 700×2000 (глухая)', slug: 'dver-mezh-dg-700-2000', description: 'Дверное полотно 700×2000 мм. МДФ, покрытие эмаль белая.', price: 6200, unit: 'sht', qty: 40 },
    { name: 'Дверная коробка телескопическая 80мм', slug: 'dvornaya-korobka-teleskop-80mm', description: 'Телескопическая дверная коробка из МДФ. Регулируемая ширина до 80 мм.', price: 2800, unit: 'kompl', qty: 80 },
  ],

  'vkhodnye-dveri': [
    { name: 'Дверь входная металлическая 860×2050', slug: 'dver-vkhodnaya-860-2050', description: 'Стальная входная дверь с двумя контурами уплотнения. Замок 3-го класса защиты.', price: 18500, unit: 'sht', qty: 30 },
    { name: 'Дверь входная утеплённая 960×2050', slug: 'dver-vkhodnaya-960-2050', description: 'Металлическая дверь с утеплителем 60 мм. МДФ-панель внутри, терморазрыв.', price: 24000, unit: 'sht', qty: 25 },
    { name: 'Дверь входная с зеркалом 960×2050', slug: 'dver-vkhodnaya-s-zerkalom-960-2050', description: 'Входная дверь с декоративным зеркалом на внутренней панели.', price: 28000, unit: 'sht', qty: 20 },
  ],

  'okonnye-profili-i-furnitura': [
    { name: 'Ручка оконная Maco белая', slug: 'ruchka-okonnaya-maco-belaya', description: 'Поворотно-откидная оконная ручка Maco. Цвет белый, шпиндель 35 мм.', price: 580, unit: 'sht', qty: 200 },
    { name: 'Петля накладная Maco 2D (пара)', slug: 'petlya-nakladnaya-maco-2d-para', description: 'Накладная петля с 2-плоскостной регулировкой. Нагрузка до 80 кг.', price: 420, unit: 'kompl', qty: 150 },
    { name: 'Штапик оконный ПВХ 2.2м', slug: 'shtapik-okonnyy-pvh-2-2m', description: 'Штапик для крепления стеклопакета в ПВХ-профиле. Длина 2.2 м.', price: 55, unit: 'sht', qty: 500 },
    { name: 'Уплотнитель оконный EPDM (рулон 100м)', slug: 'uplotnitel-okonnyy-epdm-100m', description: 'Резиновый уплотнитель EPDM для оконных рам. Сечение D, рулон 100 м.', price: 1200, unit: 'rul', qty: 50 },
  ],

  'podokonniki-i-otkosy': [
    { name: 'Подоконник ПВХ 250мм (м.п.)', slug: 'podokonnik-pvh-250mm-mp', description: 'Белый ПВХ подоконник шириной 250 мм. Толщина 18 мм. Продаётся погонно.', price: 380, unit: 'mp', qty: 300 },
    { name: 'Подоконник ПВХ 350мм (м.п.)', slug: 'podokonnik-pvh-350mm-mp', description: 'Белый ПВХ подоконник шириной 350 мм. Усиленный каркас.', price: 520, unit: 'mp', qty: 250 },
    { name: 'Откос ПВХ сэндвич 10мм 3000×600мм', slug: 'otkos-pvh-sendvich-10mm', description: 'Откосная панель ПВХ сэндвич 10 мм. Для оконных и дверных откосов.', price: 680, unit: 'sht', qty: 200 },
    { name: 'Наличник телескопический МДФ 2200мм', slug: 'nalichnik-teleskop-mdf-2200mm', description: 'Телескопический наличник МДФ. Ширина 70 мм, длина 2.2 м.', price: 280, unit: 'sht', qty: 300 },
  ],

  // ── Инженерные системы ──────────────────────────────────────────
  'truby-i-fitingi': [
    { name: 'Труба полипропиленовая PN20 20мм (м.п.)', slug: 'truba-pp-pn20-20mm', description: 'Полипропиленовая труба PN20 для горячего и холодного водоснабжения. Диаметр 20 мм.', price: 42, unit: 'mp', qty: 1000 },
    { name: 'Труба полипропиленовая PN20 25мм (м.п.)', slug: 'truba-pp-pn20-25mm', description: 'Полипропиленовая труба PN20, диаметр 25 мм. Для разводки отопления и ГВС.', price: 68, unit: 'mp', qty: 800 },
    { name: 'Муфта соединительная PP 20мм', slug: 'mufta-soedinit-pp-20mm', description: 'Муфта равнопроходная для полипропиленовых труб. Диаметр 20 мм.', price: 18, unit: 'sht', qty: 500 },
    { name: 'Труба металлопластиковая 16мм (рулон 50м)', slug: 'truba-metalloplastik-16mm-50m', description: 'Металлополимерная труба 16 мм. Для тёплого пола и разводки водоснабжения.', price: 2800, unit: 'rul', qty: 80 },
    { name: 'Тройник PP 20×20×20', slug: 'troynik-pp-20-20-20', description: 'Тройник равнопроходной для полипропиленовых труб. Все соединения 20 мм.', price: 28, unit: 'sht', qty: 400 },
  ],

  'otoplenie-radiatory-kotly': [
    { name: 'Радиатор биметаллический Rifar Base 500 (10 секций)', slug: 'radiator-bimetal-rifar-base-500-10s', description: 'Биметаллический радиатор Rifar Base 500. 10 секций, мощность 2040 Вт.', price: 8500, unit: 'sht', qty: 50 },
    { name: 'Радиатор алюминиевый Global ISEO 500 (10 секций)', slug: 'radiator-alu-global-iseo-500-10s', description: 'Алюминиевый секционный радиатор. 10 секций, давление до 16 бар.', price: 5800, unit: 'sht', qty: 60 },
    { name: 'Котёл газовый Baxi LUNA-3 24кВт', slug: 'kotel-gaz-baxi-luna3-24kw', description: 'Настенный двухконтурный газовый котёл 24 кВт. Закрытая камера сгорания.', price: 48000, unit: 'sht', qty: 10 },
    { name: 'Термостатический клапан Danfoss RA-N 1/2"', slug: 'termostat-klapan-danfoss-ra-n-1-2', description: 'Термостатический клапан для радиаторов. Угловой, DN15.', price: 980, unit: 'sht', qty: 150 },
  ],

  'tyoplyy-pol': [
    { name: 'Кабель нагревательный Devi 150Вт/м² 10м²', slug: 'kabel-nagrevatelnыy-devi-150vt-10m2', description: 'Двухжильный нагревательный кабель Deviflex. Площадь обогрева 10 м², мощность 1500 Вт.', price: 8500, unit: 'kompl', qty: 30 },
    { name: 'Мат нагревательный Thermomat 150Вт 5м²', slug: 'mat-nagrevatelnыy-thermomat-150vt-5m2', description: 'Готовый нагревательный мат на сетке. Площадь 5 м², мощность 750 Вт.', price: 6800, unit: 'kompl', qty: 40 },
    { name: 'Терморегулятор Thermoreg TI-200 Design', slug: 'termoregulyator-thermoreg-ti200', description: 'Сенсорный терморегулятор для тёплого пола. Встроенный датчик температуры.', price: 3200, unit: 'sht', qty: 50 },
    { name: 'Теплоизоляция для тёплого пола 5мм (рулон 10м²)', slug: 'teplo-izolyatsiya-tyoplyy-pol-5mm', description: 'Фольгированная теплоизоляция с разметкой для укладки кабеля.', price: 680, unit: 'rul', qty: 80 },
  ],

  'ventilyatsiya-i-konditsionirovaniye': [
    { name: 'Вентилятор осевой Vents 125мм 30Вт', slug: 'ventilyator-osevoy-vents-125mm', description: 'Осевой вытяжной вентилятор для ванных и санузлов. Диаметр 125 мм, 188 м³/ч.', price: 1800, unit: 'sht', qty: 80 },
    { name: 'Решётка вентиляционная 150×150мм', slug: 'reshotka-ventilyatsionnaya-150-150', description: 'Пластиковая вентиляционная решётка с регулируемыми жалюзи. 150×150 мм.', price: 180, unit: 'sht', qty: 300 },
    { name: 'Воздуховод круглый ø125 (м.п.)', slug: 'vozdukhovod-kruglyy-125mm', description: 'Оцинкованный круглый воздуховод диаметром 125 мм. Продаётся погонно.', price: 280, unit: 'mp', qty: 200 },
    { name: 'Клапан обратный для вентиляции 125мм', slug: 'klapan-obratnyy-ventilyatsiya-125mm', description: 'Пластиковый обратный клапан для вентиляционных каналов. Диаметр 125 мм.', price: 420, unit: 'sht', qty: 150 },
  ],

  'kanalizatsiya': [
    { name: 'Труба канализационная ПВХ 110×3000мм', slug: 'truba-kanaliz-pvh-110-3000mm', description: 'Раструбная канализационная труба ПВХ. Диаметр 110 мм, длина 3000 мм.', price: 380, unit: 'sht', qty: 200 },
    { name: 'Труба канализационная ПВХ 50×2000мм', slug: 'truba-kanaliz-pvh-50-2000mm', description: 'Канализационная труба 50 мм, длина 2 м. Для отводов от умывальников.', price: 180, unit: 'sht', qty: 300 },
    { name: 'Тройник канализационный 110×45°', slug: 'troynik-kanaliz-110-45', description: 'Косой тройник ПВХ 110 мм с отводом 45°. Для подключения унитаза.', price: 220, unit: 'sht', qty: 150 },
    { name: 'Сифон для ванны с переливом', slug: 'cifon-dlya-vanny-s-pereliv', description: 'Автоматический сифон с кнопочным управлением переливом для акриловых ванн.', price: 1800, unit: 'sht', qty: 80 },
    { name: 'Заглушка канализационная 110мм', slug: 'zaglushka-kanaliz-110mm', description: 'Заглушка раструбная ПВХ 110 мм для временной заглушки канализационных труб.', price: 45, unit: 'sht', qty: 300 },
  ],

  // ── Электрика ───────────────────────────────────────────────────
  'kabel-i-provod': [
    { name: 'Кабель ВВГнг(А)-LS 3×2.5мм² (м.п.)', slug: 'kabel-vvgng-3x2-5mm-mp', description: 'Силовой кабель ВВГнг-LS, 3 жилы по 2.5 мм². Для внутренней проводки. Продаётся погонно.', price: 68, unit: 'mp', qty: 2000 },
    { name: 'Кабель ВВГнг(А)-LS 3×1.5мм² (м.п.)', slug: 'kabel-vvgng-3x1-5mm-mp', description: 'Силовой кабель 3×1.5 мм². Для освещения и слабых нагрузок.', price: 42, unit: 'mp', qty: 2000 },
    { name: 'Кабель NYM 3×2.5мм² (м.п.)', slug: 'kabel-nym-3x2-5mm-mp', description: 'Немецкий кабель NYM с круглым сечением. Для скрытой и открытой проводки.', price: 85, unit: 'mp', qty: 1000 },
    { name: 'Провод ПВС 3×1.5мм² (м.п.)', slug: 'provod-pvs-3x1-5mm-mp', description: 'Гибкий соединительный провод ПВС. Для подключения бытовых приборов.', price: 38, unit: 'mp', qty: 1500 },
  ],

  'rozetki-i-vyklyuchateli': [
    { name: 'Розетка Schneider Electric Glossa одинарная (белая)', slug: 'rozetka-schneider-glossa-white', description: 'Одинарная розетка с заземлением Schneider Electric Glossa. IP20, цвет белый.', price: 380, unit: 'sht', qty: 300 },
    { name: 'Выключатель Schneider Electric Glossa одинарный', slug: 'viklyuchatel-schneider-glossa-1', description: 'Одноклавишный выключатель Glossa. 10А, 250В, цвет белый.', price: 320, unit: 'sht', qty: 300 },
    { name: 'Розетка Legrand Valena двойная с/з', slug: 'rozetka-legrand-valena-2-sz', description: 'Двойная розетка Legrand Valena с заземлением. Французский стандарт.', price: 680, unit: 'sht', qty: 200 },
    { name: 'Диммер Schneider Electric Glossa 300Вт', slug: 'dimmer-schneider-glossa-300vt', description: 'Поворотный диммер для ламп накаливания и галогенных. 300 Вт.', price: 1200, unit: 'sht', qty: 80 },
  ],

  'shchity-avtomaty-uzo': [
    { name: 'Автоматический выключатель ABB SH201 1P 16А', slug: 'avtomat-abb-sh201-1p-16a', description: 'Однополюсный автомат ABB SH201, 16А, тип C. Для защиты групповых линий.', price: 380, unit: 'sht', qty: 300 },
    { name: 'Автоматический выключатель ABB SH202 2P 25А', slug: 'avtomat-abb-sh202-2p-25a', description: 'Двухполюсный автомат ABB, 25А, тип C. Для защиты вводных линий.', price: 820, unit: 'sht', qty: 150 },
    { name: 'УЗО ABB F202 2P 25А 30мА', slug: 'uzo-abb-f202-2p-25a-30ma', description: 'Устройство защитного отключения ABB 25А, 30 мА. Для ванных комнат.', price: 2800, unit: 'sht', qty: 80 },
    { name: 'Щит ЩРН-П навесной 6 модулей', slug: 'shchit-shrn-p-6-moduley', description: 'Навесной распределительный щиток IP30 на 6 DIN-модулей. Металл.', price: 680, unit: 'sht', qty: 100 },
    { name: 'Щит ЩРН-П навесной 12 модулей', slug: 'shchit-shrn-p-12-moduley', description: 'Навесной распределительный щит на 12 DIN-модулей. IP30.', price: 980, unit: 'sht', qty: 80 },
  ],

  'lotki-i-gofra': [
    { name: 'Гофра ПВХ ø20мм (бухта 50м)', slug: 'gofra-pvh-20mm-50m', description: 'Серая гофрированная труба ПВХ. Диаметр 20 мм, бухта 50 м. Для скрытой проводки.', price: 620, unit: 'rul', qty: 150 },
    { name: 'Гофра ПВХ ø32мм (бухта 25м)', slug: 'gofra-pvh-32mm-25m', description: 'Гофра ПВХ 32 мм для кабелей большого сечения. Бухта 25 м.', price: 680, unit: 'rul', qty: 100 },
    { name: 'Кабель-канал 25×16мм (2м)', slug: 'kabel-kanal-25-16mm-2m', description: 'Белый кабель-канал ПВХ с крышкой. Размер 25×16 мм, длина 2 м.', price: 85, unit: 'sht', qty: 400 },
    { name: 'Лоток кабельный перфорированный 50×50 (3м)', slug: 'lotok-kabelnyy-perf-50-50-3m', description: 'Оцинкованный перфорированный лоток. Ширина 50 мм, высота 50 мм, длина 3 м.', price: 480, unit: 'sht', qty: 150 },
  ],

  'osveshchenie': [
    { name: 'Лампа светодиодная E27 12Вт 4000К', slug: 'lampa-led-e27-12vt-4000k', description: 'Светодиодная лампа E27, 12 Вт, нейтральный белый 4000 К. Замена 100 Вт лампы накаливания.', price: 120, unit: 'sht', qty: 1000 },
    { name: 'Светильник накладной LED 18Вт 4000К', slug: 'svetilnik-nakladnoy-led-18vt', description: 'Накладной круглый LED светильник 18 Вт. Нейтральный свет, IP20.', price: 680, unit: 'sht', qty: 200 },
    { name: 'Прожектор LED 50Вт 6500К уличный', slug: 'prozhektor-led-50vt-6500k', description: 'Светодиодный прожектор 50 Вт. Холодный белый, IP65. Для улицы и производства.', price: 1200, unit: 'sht', qty: 150 },
    { name: 'Светильник встраиваемый GU10 (без лампы)', slug: 'svetilnik-vstroennыy-gu10', description: 'Встраиваемый поворотный светильник под лампу GU10. Диаметр выреза 60 мм.', price: 380, unit: 'sht', qty: 300 },
  ],

  // ── Инструмент ──────────────────────────────────────────────────
  'ruchnoy-instrument': [
    { name: 'Молоток слесарный 500г Stayer', slug: 'molotok-slesarnyy-500g', description: 'Слесарный молоток 500 г с фиберглассовой рукояткой. Кованая головка.', price: 580, unit: 'sht', qty: 100 },
    { name: 'Пассатижи 200мм Knipex', slug: 'passatizhi-200mm-knipex', description: 'Комбинированные плоскогубцы Knipex 200 мм. Хромованадиевая сталь.', price: 1800, unit: 'sht', qty: 80 },
    { name: 'Ключ разводной 250мм', slug: 'klyuch-razvodnoy-250mm', description: 'Разводной ключ с регулируемым захватом до 30 мм. Длина 250 мм.', price: 680, unit: 'sht', qty: 100 },
    { name: 'Ножовка по дереву 500мм', slug: 'nozhevka-po-derevu-500mm', description: 'Ножовка с каленым зубом. 7 зубьев на дюйм, длина полотна 500 мм.', price: 480, unit: 'sht', qty: 80 },
    { name: 'Шпатель нержавеющий 100мм', slug: 'shpatel-nerzh-100mm', description: 'Шпатель с нержавеющим полотном 100 мм. Для нанесения шпаклёвки.', price: 180, unit: 'sht', qty: 200 },
  ],

  'elektroinstrument': [
    { name: 'Дрель-шуруповёрт Bosch GSR 12V-35 (2 АКБ)', slug: 'drel-shurupovert-bosch-gsr-12v', description: 'Аккумуляторный шуруповёрт Bosch 12В. Два АКБ 2.0 Ah, зарядное устройство.', price: 8500, unit: 'kompl', qty: 30 },
    { name: 'УШМ (болгарка) Makita GA5030 125мм 720Вт', slug: 'ushm-makita-ga5030-125mm', description: 'Угловая шлифовальная машина Makita 125 мм, 720 Вт. Плавный пуск.', price: 6800, unit: 'sht', qty: 25 },
    { name: 'Перфоратор Bosch GBH 2-26 DRE 800Вт', slug: 'perforator-bosch-gbh-2-26', description: 'Перфоратор SDS+ Bosch 800 Вт. Энергия удара 2.7 Дж, 3 режима работы.', price: 12500, unit: 'sht', qty: 20 },
    { name: 'Лобзик Bosch GST 150 BCE 780Вт', slug: 'lobzik-bosch-gst-150bce', description: 'Электрический лобзик Bosch 780 Вт. Маятниковый ход, скорость 500–3100 ход/мин.', price: 9800, unit: 'sht', qty: 20 },
  ],

  'izmeritelnyy-instrument': [
    { name: 'Рулетка Stabila 5м×19мм', slug: 'ruletka-stabila-5m-19mm', description: 'Профессиональная рулетка Stabila. Длина 5 м, ширина полотна 19 мм.', price: 680, unit: 'sht', qty: 150 },
    { name: 'Уровень строительный 600мм Sola', slug: 'uroven-stroitelnyy-600mm-sola', description: 'Алюминиевый уровень Sola с двумя ампулами. Длина 600 мм, точность 0.5 мм/м.', price: 1200, unit: 'sht', qty: 100 },
    { name: 'Нивелир лазерный Bosch GLL 3-60 (3 плоскости)', slug: 'nivelir-lazernyy-bosch-gll3-60', description: 'Лазерный уровень Bosch 3×360°. Самовыравнивание, дальность 60 м.', price: 18500, unit: 'sht', qty: 15 },
    { name: 'Угольник строительный 400мм', slug: 'ugolnik-stroitelnyy-400mm', description: 'Металлический угольник 90°. Длинная сторона 400 мм, точность ±0.2°.', price: 380, unit: 'sht', qty: 100 },
  ],

  'raskhodniki-diski-svyorla-bity': [
    { name: 'Диск отрезной по металлу 125×1.0×22.23мм', slug: 'disk-otreznoj-metall-125x1', description: 'Тонкий отрезной диск 125×1.0 мм. Минимальный нагрев, чистый рез.', price: 65, unit: 'sht', qty: 500 },
    { name: 'Сверло по бетону SDS+ 10×160мм', slug: 'sverlo-beton-sds-10x160', description: 'Бур SDS+ с победитовой напайкой. Диаметр 10 мм, длина 160 мм.', price: 180, unit: 'sht', qty: 300 },
    { name: 'Набор бит PH PZ Torx 32шт', slug: 'nabor-bit-ph-pz-torx-32sht', description: 'Набор бит 32 предмета в кейсе. Включает биты PH1/2/3, PZ1/2/3, Torx, шлицевые.', price: 480, unit: 'kompl', qty: 150 },
    { name: 'Лезвия для ножа 25мм (10шт)', slug: 'lezviya-nozha-25mm-10sht', description: 'Сменные лезвия для строительного ножа 25 мм. В упаковке 10 шт.', price: 120, unit: 'up', qty: 400 },
  ],

  // ── Крепёж и метизы ─────────────────────────────────────────────
  'samorezy-i-shurupy': [
    { name: 'Саморез по дереву 3.5×35мм (200шт)', slug: 'samorez-derevo-3-5x35-200sht', description: 'Жёлтопассированный саморез для дерева. 3.5×35 мм, потайная головка, PH2.', price: 180, unit: 'up', qty: 500 },
    { name: 'Саморез по металлу 3.5×9.5мм (1000шт)', slug: 'samorez-metall-3-5x9-5-1000sht', description: 'Саморез для крепления ГКЛ к профилю. 3.5×9.5 мм (семечки). 1000 шт.', price: 220, unit: 'up', qty: 400 },
    { name: 'Саморез ГКЛ 3.5×25мм (1000шт)', slug: 'samorez-gkl-3-5x25-1000sht', description: 'Саморез для крепления гипсокартона к металлическому профилю. 3.5×25 мм.', price: 280, unit: 'up', qty: 350 },
    { name: 'Шуруп универсальный 5×50мм (200шт)', slug: 'shurup-universalnyy-5x50-200sht', description: 'Универсальный шуруп с крупным шагом. 5×50 мм, потайная головка. 200 шт.', price: 160, unit: 'up', qty: 500 },
  ],

  'ankery-i-dyubeli': [
    { name: 'Дюбель-гвоздь 6×60мм (50шт)', slug: 'dyubel-gvozd-6x60-50sht', description: 'Нейлоновый дюбель с гвоздём. 6×60 мм, для бетона и кирпича. 50 шт.', price: 120, unit: 'up', qty: 500 },
    { name: 'Анкер клиновой М10×100мм (10шт)', slug: 'anker-klinovoy-m10x100-10sht', description: 'Стальной клиновой анкер. M10×100 мм, для бетона. 10 шт.', price: 380, unit: 'up', qty: 200 },
    { name: 'Анкер химический Fischer FIS V 360мл', slug: 'anker-khimich-fischer-fis-v-360ml', description: 'Двухкомпонентный химический анкер. Инъекционная масса 360 мл. Для тяжёлых нагрузок.', price: 1800, unit: 'sht', qty: 80 },
    { name: 'Дюбель нейлоновый 10×50мм (100шт)', slug: 'dyubel-neylonovyy-10x50-100sht', description: 'Универсальный нейлоновый дюбель 10×50 мм. Для бетона, кирпича, газобетона.', price: 180, unit: 'up', qty: 400 },
  ],

  'bolty-gayki-shpilki': [
    { name: 'Болт М10×50 DIN 933 (25шт)', slug: 'bolt-m10x50-din933-25sht', description: 'Болт с полной резьбой М10×50 мм, класс прочности 8.8. DIN 933. 25 шт.', price: 160, unit: 'up', qty: 300 },
    { name: 'Гайка М10 DIN 934 (50шт)', slug: 'gayka-m10-din934-50sht', description: 'Шестигранная гайка М10, класс прочности 8. DIN 934. 50 шт.', price: 95, unit: 'up', qty: 400 },
    { name: 'Шпилька резьбовая М8×1000мм', slug: 'shpilka-rezbovaya-m8x1000mm', description: 'Резьбовая шпилька М8, длина 1000 мм. Оцинкованная. DIN 975.', price: 180, unit: 'sht', qty: 200 },
    { name: 'Шайба плоская М10 DIN 125 (50шт)', slug: 'shayba-ploskaya-m10-din125-50sht', description: 'Плоская шайба М10. Оцинкованная, DIN 125. 50 шт.', price: 65, unit: 'up', qty: 500 },
  ],

  'gvozdi-i-skoby': [
    { name: 'Гвоздь строительный 70×3.0мм (1кг)', slug: 'gvozd-stroitelnyy-70x3-1kg', description: 'Строительный гвоздь 70×3.0 мм. Оцинкованный. 1 кг (~360 шт).', price: 120, unit: 'kg', qty: 300 },
    { name: 'Гвоздь ершёный 80×3.1мм (1кг)', slug: 'gvozd-yershyonnyy-80x3-1-1kg', description: 'Ершёный гвоздь для деревянных конструкций. Повышенное сцепление.', price: 145, unit: 'kg', qty: 200 },
    { name: 'Скоба для степлера 53/10мм (1000шт)', slug: 'skoba-steppler-53-10mm-1000sht', description: 'Скобы тип 53, ширина 11.3 мм, высота 10 мм. Для строительного степлера.', price: 95, unit: 'up', qty: 500 },
    { name: 'Гвоздь финишный 1.6×45мм (500шт)', slug: 'gvozd-finishnyy-1-6x45-500sht', description: 'Финишный гвоздь с маленькой головкой. 1.6×45 мм. Для деревянных наличников.', price: 110, unit: 'up', qty: 300 },
  ],

  // ── Лакокрасочные материалы ─────────────────────────────────────
  'kraski-fasadnye-interyernye': [
    { name: 'Краска фасадная Caparol Amphibolin 10л', slug: 'kraska-fasadnaya-caparol-10l', description: 'Акрилатная фасадная краска Caparol. Высокая паропроницаемость, морозостойкость.', price: 4800, unit: 'sht', qty: 60 },
    { name: 'Краска интерьерная Dulux Easy Care 5л', slug: 'kraska-interyernaya-dulux-5l', description: 'Матовая моющаяся краска для стен и потолков. Сверхстойкая к пятнам.', price: 2800, unit: 'sht', qty: 80 },
    { name: 'Краска для потолков Sniezka Mattlatex 10л', slug: 'kraska-dlya-potolkov-sniezka-10l', description: 'Белоснежная потолочная краска. Глубоко матовая, скрывает мелкие неровности.', price: 1600, unit: 'sht', qty: 100 },
    { name: 'Краска водоэмульсионная ВД-АК 25кг', slug: 'kraska-vodoem-vd-ak-25kg', description: 'Белая водоэмульсионная краска для внутренних работ. Эконом-класс.', price: 1200, unit: 'sht', qty: 120 },
  ],

  'gruntovki': [
    { name: 'Грунтовка Ceresit CT 17 глубокого проникновения 10л', slug: 'gruntovka-ceresit-ct17-10l', description: 'Акрилатная грунтовка глубокого проникновения. Для пористых и впитывающих поверхностей.', price: 980, unit: 'sht', qty: 100 },
    { name: 'Бетон-контакт Knauf Grip 15кг', slug: 'beton-kontakt-knauf-grip-15kg', description: 'Адгезионный праймер для гладких оснований (бетон, ГКЛ). Содержит кварцевый песок.', price: 1800, unit: 'sht', qty: 80 },
    { name: 'Грунтовка акриловая АС-100 10л', slug: 'gruntovka-akrilovaya-as100-10l', description: 'Универсальная акриловая грунтовка для внутренних работ. Быстрое высыхание (1 час).', price: 680, unit: 'sht', qty: 120 },
  ],

  'laki-i-propitki': [
    { name: 'Лак паркетный Bona Traffic HD 4.95л', slug: 'lak-parketnыy-bona-traffic-hd', description: 'Профессиональный двухкомпонентный паркетный лак Bona. Высочайшая износостойкость.', price: 8500, unit: 'kompl', qty: 30 },
    { name: 'Пропитка для дерева Pinotex Ultra 3л', slug: 'propitka-derevo-pinotex-ultra-3l', description: 'Защитная пропитка-антисептик с биоцидами. Для наружных деревянных конструкций.', price: 2800, unit: 'sht', qty: 50 },
    { name: 'Лак акрилатный Dulux Diamond Matt 2.5л', slug: 'lak-akrilat-dulux-diamond-2-5l', description: 'Матовый акрилатный лак для стен и потолков. Моющийся, экологичный.', price: 1800, unit: 'sht', qty: 60 },
    { name: 'Масло для дерева Osmo Hartwachs-Öl 2.5л', slug: 'maslo-derevo-osmo-hardwax-2-5l', description: 'Немецкое твёрдое восковое масло для паркета и деревянных полов. Матовый финиш.', price: 5500, unit: 'sht', qty: 25 },
  ],

  'klei-plitochnyy-oboynyy-montazhnyy': [
    { name: 'Клей плиточный Ceresit CM 11 25кг', slug: 'kley-plitochnyy-ceresit-cm11-25kg', description: 'Универсальный плиточный клей C1 для керамики на основаниях из бетона и ГКЛ.', price: 680, unit: 'mshk', qty: 200 },
    { name: 'Клей плиточный Ceresit CM 17 25кг', slug: 'kley-plitochnyy-ceresit-cm17-25kg', description: 'Высокоэластичный клей C2 для крупноформатного керамогранита и сложных оснований.', price: 980, unit: 'mshk', qty: 150 },
    { name: 'Клей обойный Quelyd Speciální Wall 200г', slug: 'kley-oboynyy-quelyd-200g', description: 'Клей для всех видов обоев. Пакет 200 г — на 30–40 м² тяжёлых обоев.', price: 280, unit: 'sht', qty: 300 },
    { name: 'Клей монтажный Moment Kristall 400мл', slug: 'kley-montazhnyy-moment-kristall-400ml', description: 'Прозрачный монтажный клей без растворителей. Для пенополистирола и дерева.', price: 280, unit: 'sht', qty: 250 },
  ],

  'germetiki-i-peny': [
    { name: 'Пена монтажная Makroflex Premium 750мл', slug: 'pena-montazhnaya-makroflex-premium-750ml', description: 'Профессиональная монтажная пена, выход 45 л. Для дверей, окон, зазоров.', price: 480, unit: 'sht', qty: 300 },
    { name: 'Герметик силиконовый Ceresit CS 25 белый 280мл', slug: 'germetik-silik-ceresit-cs25-bel-280ml', description: 'Нейтральный силиконовый герметик. Для ванных, кухонь, санузлов. Белый.', price: 280, unit: 'sht', qty: 400 },
    { name: 'Герметик акриловый для дерева Soudal белый 310мл', slug: 'germetik-akril-soudal-bel-310ml', description: 'Акриловый герметик для зазоров в деревянных конструкциях. Окрашиваемый.', price: 220, unit: 'sht', qty: 300 },
    { name: 'Пена монтажная бытовая Tytan 500мл', slug: 'pena-bytovaya-tytan-500ml', description: 'Однокомпонентная полиуретановая пена, бытовой тип. Без пистолета.', price: 220, unit: 'sht', qty: 400 },
  ],

  // ── Сантехника ──────────────────────────────────────────────────
  'vanny-i-dushevye': [
    { name: 'Ванна акриловая Roca Easy 170×70см', slug: 'vanna-akril-roca-easy-170-70', description: 'Прямоугольная акриловая ванна Roca Easy 1700×700 мм. Толщина акрила 4 мм.', price: 28000, unit: 'sht', qty: 20 },
    { name: 'Ванна акриловая Ravak Chrome 160×70см', slug: 'vanna-akril-ravak-chrome-160-70', description: 'Ванна Ravak Chrome 1600×700 мм. Антискользящее покрытие, усиленная рама.', price: 32000, unit: 'sht', qty: 15 },
    { name: 'Душевой поддон Cezares 90×90см', slug: 'dushevoy-poddon-cezares-90-90', description: 'Квадратный акриловый душевой поддон 90×90 см. Высота 15 см.', price: 12000, unit: 'sht', qty: 25 },
    { name: 'Шторка для ванны раздвижная 120×140см', slug: 'shtorka-vanny-razdvizhnaya-120-140', description: 'Раздвижная стеклянная шторка для ванны. Каркас хром, стекло 5 мм.', price: 8500, unit: 'sht', qty: 30 },
  ],

  'umyvalniki-i-unitazy': [
    { name: 'Умывальник Cersanit Como 60см (без пьедестала)', slug: 'umyvalnik-cersanit-como-60', description: 'Керамический умывальник шириной 60 см. Подходит для тумб и пьедесталов.', price: 3800, unit: 'sht', qty: 40 },
    { name: 'Умывальник подвесной Roca Debba 60см', slug: 'umyvalnik-podvesnoy-roca-debba-60', description: 'Подвесной умывальник Roca Debba 600×450 мм. Скрытый сифон.', price: 6200, unit: 'sht', qty: 30 },
    { name: 'Унитаз Cersanit Carina напольный', slug: 'unitaz-cersanit-carina-napolnyy', description: 'Напольный унитаз с горизонтальным выпуском. Бачок в комплекте, сиденье дюропласт.', price: 9800, unit: 'kompl', qty: 25 },
    { name: 'Унитаз подвесной Geberit Renova напольный', slug: 'unitaz-podvesnoy-geberit-renova', description: 'Подвесной унитаз Geberit Renova с сиденьем Soft-Close. Безободковый.', price: 18500, unit: 'kompl', qty: 15 },
  ],

  'smesiteli-i-krany': [
    { name: 'Смеситель для ванны Grohe BauClassic', slug: 'smesitel-vanny-grohe-bauclassic', description: 'Однорычажный смеситель для ванны с душем. Переключатель ванна/душ, лейка в комплекте.', price: 8500, unit: 'sht', qty: 40 },
    { name: 'Смеситель для кухни Hansgrohe Focus', slug: 'smesitel-kuhnya-hansgrohe-focus', description: 'Однорычажный кухонный смеситель. Высокий излив 220 мм, керамический картридж.', price: 7200, unit: 'sht', qty: 35 },
    { name: 'Кран шаровой DN25 (1") внутр.×нар.', slug: 'kran-sharovoy-dn25-1-inch', description: 'Шаровый кран 1" для систем водоснабжения. Хромированная латунь, ручка «бабочка».', price: 580, unit: 'sht', qty: 200 },
    { name: 'Смеситель для умывальника Cersanit Virgo', slug: 'smesitel-umyv-cersanit-virgo', description: 'Однорычажный смеситель для умывальника. Встроенный аэратор. Хром.', price: 3200, unit: 'sht', qty: 60 },
  ],

  'installyatsii': [
    { name: 'Инсталляция Geberit Duofix для унитаза', slug: 'installyatsiya-geberit-duofix-unitaz', description: 'Рамная инсталляция Geberit Duofix для подвесного унитаза. Высота 112 см.', price: 18000, unit: 'sht', qty: 20 },
    { name: 'Инсталляция Grohe Rapid SL для унитаза', slug: 'installyatsiya-grohe-rapid-sl-unitaz', description: 'Система инсталляции Grohe с кнопкой смыва. Бачок объём 6/9 л.', price: 16500, unit: 'sht', qty: 18 },
    { name: 'Кнопка смыва Geberit Sigma30 хром', slug: 'knopka-slyva-geberit-sigma30-khrom', description: 'Панель смыва Geberit Sigma30. Двойной смыв 3/6 л, хромированная.', price: 4800, unit: 'sht', qty: 40 },
  ],

  'schyotchiki-i-filtry': [
    { name: 'Счётчик воды VALTEC ХВС 1/2" (одноструйный)', slug: 'schyotchik-vody-valtec-hvs-1-2', description: 'Счётчик холодной воды VALTEC 1/2". Класс C, погрешность ±2%.', price: 980, unit: 'sht', qty: 100 },
    { name: 'Счётчик воды VALTEC ГВС 1/2" (одноструйный)', slug: 'schyotchik-vody-valtec-gvs-1-2', description: 'Счётчик горячей воды VALTEC 1/2". Рабочая температура до 90°С.', price: 1100, unit: 'sht', qty: 100 },
    { name: 'Фильтр грубой очистки 1/2" сетчатый', slug: 'filtr-grubay-ochistki-1-2-setchatyy', description: 'Сетчатый фильтр-грязевик 1/2". Ячейка 90–120 мкм. Со сливным краном.', price: 580, unit: 'sht', qty: 150 },
    { name: 'Магистральный фильтр BWT Infinity 3/4"', slug: 'magistralnyy-filtr-bwt-3-4', description: 'Магистральный фильтр с картриджем 5 мкм. Прозрачная колба для контроля.', price: 2800, unit: 'sht', qty: 50 },
  ],

  // ── Садовые товары и благоустройство ───────────────────────────
  'trotuarnaya-plitka-i-bordyury': [
    { name: 'Тротуарная плитка «Брусчатка» 100×200×60мм (м²)', slug: 'trotuarnaya-plitka-bruschatka-100-200-60', description: 'Вибролитая брусчатка серая. Размер 100×200×60 мм. Морозостойкость F200.', price: 680, unit: 'm2', qty: 500 },
    { name: 'Тротуарная плитка «Катушка» 200×165×60мм (м²)', slug: 'trotuarnaya-plitka-katushka-200-165-60', description: 'Тротуарная плитка фигурная «Катушка» серая. Толщина 60 мм, выдерживает авто.', price: 720, unit: 'm2', qty: 400 },
    { name: 'Бордюр дорожный 500×200×80мм', slug: 'bordyur-dorozhnyy-500-200-80', description: 'Бетонный дорожный бордюр. Длина 500 мм, высота 200 мм, ширина 80 мм.', price: 185, unit: 'sht', qty: 600 },
    { name: 'Бордюр садовый пластиковый (10м)', slug: 'bordyur-sadovyy-plastik-10m', description: 'Гибкий садовый бордюр ПВХ высотой 90 мм. Длина 10 м. Устойчив к морозу.', price: 980, unit: 'rul', qty: 100 },
  ],

  'setki-i-zabory': [
    { name: 'Сетка рабица 50×50×1.6мм (рулон 10×1.5м)', slug: 'setka-rabica-50-50-16-rulon-10x1-5', description: 'Неоцинкованная сетка-рабица. Ячейка 50×50 мм, проволока 1.6 мм, рулон 10×1.5 м.', price: 1800, unit: 'rul', qty: 80 },
    { name: 'Сетка сварная оцинкованная 50×50×2.5мм (рулон 10×1.8м)', slug: 'setka-svarnaya-otsink-50-50-25', description: 'Оцинкованная сварная сетка. Ячейка 50×50 мм, проволока 2.5 мм.', price: 3200, unit: 'rul', qty: 50 },
    { name: 'Профнастил С10 для забора 1.8×2.0м', slug: 'profnastil-s10-zabor-1-8x2', description: 'Профлист для заборов С10, высота 1.8 м, длина 2.0 м. Полиэстер 0.4 мм.', price: 1200, unit: 'sht', qty: 150 },
    { name: 'Столб для забора ø60мм 2.5м', slug: 'stolb-zabor-60mm-2-5m', description: 'Металлическая труба ø60×1.5 мм, длина 2.5 м. Для монтажа секционных заборов.', price: 680, unit: 'sht', qty: 200 },
  ],

  'geotekstil': [
    { name: 'Геотекстиль Typar SF27 150г/м² (рулон 100м²)', slug: 'geotekstil-typar-sf27-150-100m2', description: 'Нетканый иглопробивной геотекстиль 150 г/м². Для дренажа и разделения слоёв.', price: 2800, unit: 'rul', qty: 50 },
    { name: 'Геотекстиль 200г/м² (рулон 50м²)', slug: 'geotekstil-200-50m2', description: 'Геотекстиль плотностью 200 г/м². Для фундаментного дренажа и дорожных работ.', price: 2200, unit: 'rul', qty: 60 },
    { name: 'Агроволокно Агрил 60г/м² чёрное (рулон 1.6×50м)', slug: 'agrovolokno-agril-60-chyornoe', description: 'Чёрное агроволокно для мульчирования и борьбы с сорняками. 60 г/м².', price: 1400, unit: 'rul', qty: 80 },
  ],

  'drenazh': [
    { name: 'Труба дренажная ø110мм перфорированная (м.п.)', slug: 'truba-drenazhnya-110mm-perfor', description: 'Гофрированная дренажная труба ø110 мм с перфорацией и фильтрующим носком.', price: 145, unit: 'mp', qty: 500 },
    { name: 'Труба дренажная ø63мм в фильтре (м.п.)', slug: 'truba-drenazhnya-63mm-filtr', description: 'Дренажная труба ø63 мм в геотекстильном фильтре. Для садового дренажа.', price: 85, unit: 'mp', qty: 700 },
    { name: 'Дренажный колодец ø315мм с крышкой', slug: 'drenazhnyy-kolodets-315mm', description: 'Гофрированный дренажный колодец ø315 мм, высота 600 мм. С чугунной крышкой А15.', price: 2800, unit: 'sht', qty: 40 },
    { name: 'Геосинтетика Секугрид 30/30 (рулон 25м²)', slug: 'geosintettika-secugrid-30-30-25m2', description: 'Геосинтетическая сетка для армирования грунта и насыпей.', price: 4500, unit: 'rul', qty: 20 },
  ],
};

// ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Seed products ===\n');

  // 1. Upsert units
  console.log('📦 Создаю единицы измерения...');
  const unitMap = new Map<string, number>();
  for (const u of UNITS) {
    let unit = await prisma.unit.findFirst({ where: { shortName: u.shortName } });
    if (!unit) {
      unit = await prisma.unit.create({
        data: { name: u.name, shortName: u.shortName, sortOrder: u.sortOrder, isActive: true },
      });
    }
    unitMap.set(u.slug, unit.id);
    console.log(`  ✓ ${u.name} (${u.shortName})`);
  }

  // 2. Load categories
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  // 3. Create products
  console.log('\n🧱 Создаю товары...');
  let created = 0;
  let skipped = 0;

  for (const [catSlug, products] of Object.entries(PRODUCTS)) {
    const categoryId = catMap.get(catSlug);
    if (!categoryId) {
      console.warn(`  ⚠ Категория не найдена: ${catSlug}`);
      continue;
    }

    for (const p of products) {
      const unitId = unitMap.get(p.unit);
      if (!unitId) {
        console.warn(`  ⚠ Единица не найдена: ${p.unit}`);
        continue;
      }

      const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
      if (exists) {
        skipped++;
        continue;
      }

      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          categoryId,
          unitId,
          isActive: true,
          inventory: {
            create: {
              quantity: p.qty,
              status: p.qty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
            },
          },
        },
      });
      created++;
    }
    console.log(`  ✓ [${catSlug}] — ${products.length} товаров`);
  }

  console.log(`\n✅ Создано товаров: ${created}`);
  console.log(`⏭  Пропущено (уже существуют): ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
