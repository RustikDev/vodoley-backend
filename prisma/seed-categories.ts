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

const categories: { name: string; slug: string; children: { name: string; slug: string }[] }[] = [
  {
    name: 'Строительные материалы',
    slug: 'stroitelnye-materialy',
    children: [
      { name: 'Цемент, смеси, штукатурка', slug: 'tsement-smesi-shtukaturka' },
      { name: 'Кирпич, блоки, камень', slug: 'kirpich-bloki-kamen' },
      { name: 'Песок, щебень, гравий', slug: 'pesok-shcheben-graviy' },
      { name: 'Утеплители', slug: 'utepliteli' },
      { name: 'Гидроизоляция', slug: 'gidroizolyatsiya' },
      { name: 'Пароизоляция и плёнки', slug: 'paroizolyatsiya-i-plyonki' },
    ],
  },
  {
    name: 'Кровля и фасад',
    slug: 'krovlya-i-fasad',
    children: [
      { name: 'Металлочерепица и профнастил', slug: 'metallocherepitsa-i-profnastil' },
      { name: 'Мягкая кровля (битумная черепица)', slug: 'myagkaya-krovlya' },
      { name: 'Водосточные системы', slug: 'vodostochnye-sistemy' },
      { name: 'Сайдинг и облицовка', slug: 'sayding-i-oblitsovka' },
      { name: 'Доборные элементы', slug: 'dobornye-elementy' },
    ],
  },
  {
    name: 'Стены и перегородки',
    slug: 'steny-i-peregorodki',
    children: [
      { name: 'Гипсокартон', slug: 'gipsokarton' },
      { name: 'Профиль для ГКЛ', slug: 'profil-dlya-gkl' },
      { name: 'Пазогребневые плиты', slug: 'pazogrebneve-plity' },
      { name: 'Панели и вагонка', slug: 'paneli-i-vagonka' },
    ],
  },
  {
    name: 'Полы',
    slug: 'poly',
    children: [
      { name: 'Ламинат', slug: 'laminat' },
      { name: 'Паркетная доска', slug: 'parketnaya-doska' },
      { name: 'Плитка и керамогранит', slug: 'plitka-i-keramogranit' },
      { name: 'Стяжка и наливные полы', slug: 'styazhka-i-nalivnye-poly' },
      { name: 'Подложка и изоляция', slug: 'podlozhka-i-izolyatsiya' },
    ],
  },
  {
    name: 'Двери и окна',
    slug: 'dveri-i-okna',
    children: [
      { name: 'Межкомнатные двери', slug: 'mezhkomnatnye-dveri' },
      { name: 'Входные двери', slug: 'vkhodnye-dveri' },
      { name: 'Оконные профили и фурнитура', slug: 'okonnye-profili-i-furnitura' },
      { name: 'Подоконники и откосы', slug: 'podokonniki-i-otkosy' },
    ],
  },
  {
    name: 'Инженерные системы',
    slug: 'inzhenernye-sistemy',
    children: [
      { name: 'Трубы и фитинги', slug: 'truby-i-fitingi' },
      { name: 'Отопление (радиаторы, котлы)', slug: 'otoplenie-radiatory-kotly' },
      { name: 'Тёплый пол', slug: 'tyoplyy-pol' },
      { name: 'Вентиляция и кондиционирование', slug: 'ventilyatsiya-i-konditsionirovaniye' },
      { name: 'Канализация', slug: 'kanalizatsiya' },
    ],
  },
  {
    name: 'Электрика',
    slug: 'elektrika',
    children: [
      { name: 'Кабель и провод', slug: 'kabel-i-provod' },
      { name: 'Розетки и выключатели', slug: 'rozetki-i-vyklyuchateli' },
      { name: 'Щиты, автоматы, УЗО', slug: 'shchity-avtomaty-uzo' },
      { name: 'Лотки и гофра', slug: 'lotki-i-gofra' },
      { name: 'Освещение', slug: 'osveshchenie' },
    ],
  },
  {
    name: 'Инструмент',
    slug: 'instrument',
    children: [
      { name: 'Ручной инструмент', slug: 'ruchnoy-instrument' },
      { name: 'Электроинструмент', slug: 'elektroinstrument' },
      { name: 'Измерительный инструмент', slug: 'izmeritelnyy-instrument' },
      { name: 'Расходники (диски, свёрла, биты)', slug: 'raskhodniki-diski-svyorla-bity' },
    ],
  },
  {
    name: 'Крепёж и метизы',
    slug: 'krepezh-i-metizy',
    children: [
      { name: 'Саморезы и шурупы', slug: 'samorezy-i-shurupy' },
      { name: 'Анкеры и дюбели', slug: 'ankery-i-dyubeli' },
      { name: 'Болты, гайки, шпильки', slug: 'bolty-gayki-shpilki' },
      { name: 'Гвозди и скобы', slug: 'gvozdi-i-skoby' },
    ],
  },
  {
    name: 'Лакокрасочные материалы',
    slug: 'lakokrasochnye-materialy',
    children: [
      { name: 'Краски (фасадные, интерьерные)', slug: 'kraski-fasadnye-interyernye' },
      { name: 'Грунтовки', slug: 'gruntovki' },
      { name: 'Лаки и пропитки', slug: 'laki-i-propitki' },
      { name: 'Клеи (плиточный, обойный, монтажный)', slug: 'klei-plitochnyy-oboynyy-montazhnyy' },
      { name: 'Герметики и пены', slug: 'germetiki-i-peny' },
    ],
  },
  {
    name: 'Сантехника',
    slug: 'santehnika',
    children: [
      { name: 'Ванны и душевые', slug: 'vanny-i-dushevye' },
      { name: 'Умывальники и унитазы', slug: 'umyvalniki-i-unitazy' },
      { name: 'Смесители и краны', slug: 'smesiteli-i-krany' },
      { name: 'Инсталляции', slug: 'installyatsii' },
      { name: 'Счётчики и фильтры', slug: 'schyotchiki-i-filtry' },
    ],
  },
  {
    name: 'Садовые товары и благоустройство',
    slug: 'sadovye-tovary-i-blagoustroystvo',
    children: [
      { name: 'Тротуарная плитка и бордюры', slug: 'trotuarnaya-plitka-i-bordyury' },
      { name: 'Сетки и заборы', slug: 'setki-i-zabory' },
      { name: 'Геотекстиль', slug: 'geotekstil' },
      { name: 'Дренаж', slug: 'drenazh' },
    ],
  },
];

async function main() {
  console.log('Seeding categories...');

  let rootOrder = 0;
  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        isActive: true,
        sortOrder: rootOrder++,
      },
    });

    let childOrder = 0;
    for (const child of cat.children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {},
        create: {
          name: child.name,
          slug: child.slug,
          parentId: parent.id,
          isActive: true,
          sortOrder: childOrder++,
        },
      });
    }

    console.log(`  ✓ ${cat.name} (${cat.children.length} подкатегорий)`);
  }

  console.log('\nДобавлено категорий:', categories.length, 'корневых');
  console.log('Добавлено подкатегорий:', categories.reduce((s, c) => s + c.children.length, 0));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
