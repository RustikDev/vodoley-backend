import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const url = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  connectionLimit: 5,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
});
const prisma = new PrismaClient({ adapter });

// brandSlug → массив slug-ов товаров
const BRAND_PRODUCT_MAP: Record<string, string[]> = {
  // Denzel — инструмент (ручной + электро + измерительный)
  denzel: [
    'molotok-slesarnyy-500g',
    'passatizhi-200mm-knipex',
    'klyuch-razvodnoy-250mm',
    'nozhevka-po-derevu-500mm',
    'shpatel-nerzh-100mm',
    'drel-shurupovert-bosch-gsr-12v',
    'ushm-makita-ga5030-125mm',
    'perforator-bosch-gbh-2-26',
    'lobzik-bosch-gst-150bce',
    'ruletka-stabila-5m-19mm',
    'uroven-stroitelnyy-600mm-sola',
    'ugolnik-stroitelnyy-400mm',
  ],

  // Matrix — расходники и часть инструмента
  matrix: [
    'disk-otreznoj-metall-125x1',
    'sverlo-beton-sds-10x160',
    'nabor-bit-ph-pz-torx-32sht',
    'lezviya-nozha-25mm-10sht',
    'nivelir-lazernyy-bosch-gll3-60',
  ],

  // Минерал Рус — утеплители и пароизоляция
  'mineral-rus': [
    'minvata-rockwool-50mm-up',
    'bazaltovaya-vata-isover-100mm',
    'penofol-tip-a-3mm-rulon',
    'izospan-v-rulon-70m2',
    'izospan-a-rulon-70m2',
    'plyonka-armirovannaya-120-rulon',
    'plyonka-polietilenovaya-200mkm',
  ],

  // Оптимикс — сухие смеси, штукатурки, стяжки, грунтовки
  optimiks: [
    'tsement-m500-d0-50kg',
    'tsement-m400-d20-50kg',
    'shtukaturka-tsementnaya-m150-25kg',
    'peskoбетон-m300-40kg',
    'styazhka-peskotsementnaya-m150-25kg',
    'nalivnoy-pol-bergauf-boden-25kg',
    'nalivnoy-pol-knauf-boden-15-25kg',
    'rovnitel-ceresit-cn88-25kg',
    'gruntovka-akrilovaya-as100-10l',
  ],

  // СК Гефстрой — стройматериалы (кирпич, блоки, тротуарная плитка)
  gefstroy: [
    'kirpich-krasnyy-ryadovoy-m150',
    'kirpich-silikatnyy-belyy-m200',
    'blok-gazobetонный-d500-600-200-300',
    'blok-penobetонный-d600',
    'blok-keramzitobetонный-390-190-188',
    'trotuarnaya-plitka-bruschatka-100-200-60',
    'trotuarnaya-plitka-katushka-200-165-60',
    'bordyur-dorozhnyy-500-200-80',
  ],

  // Сантрек — сантехника, трубы, фитинги, канализация
  suntrek: [
    'truba-pp-pn20-20mm',
    'truba-pp-pn20-25mm',
    'mufta-soedinit-pp-20mm',
    'truba-metalloplastik-16mm-50m',
    'troynik-pp-20-20-20',
    'truba-kanaliz-pvh-110-3000mm',
    'truba-kanaliz-pvh-50-2000mm',
    'troynik-kanaliz-110-45',
    'cifon-dlya-vanny-s-pereliv',
    'zaglushka-kanaliz-110mm',
    'schyotchik-vody-valtec-hvs-1-2',
    'schyotchik-vody-valtec-gvs-1-2',
    'filtr-grubay-ochistki-1-2-setchatyy',
    'kran-sharovoy-dn25-1-inch',
  ],

  // Строй-Транзит — сыпучие материалы, гидро/пароизоляция, кровля
  'stroy-tranzit': [
    'pesok-rechnoy-meshok-50kg',
    'pesok-karyernыy-mytyy-50kg',
    'shcheben-granitnyy-fr5-20-50kg',
    'shcheben-granitnyy-fr20-40-50kg',
    'graviy-fr10-20-50kg',
    'ruberoid-rkp-350-rulon',
    'gidroizol-hpp-rulon',
    'mastika-bitumnaya-18kg',
    'tehnonikol-tehnofleks-rulon',
    'profnastil-ns35-0-7mm',
    'profnastil-s8-0-5mm',
    'konok-krovelnыy-2m',
    'snegoderzhatel-trubchatyy-3m',
    'vetrovaya-planka-levaya-2m',
    'karniznaya-planka-2m',
    'planka-primykaniya-2m',
    'konok-ploskiy-2m',
    'stolb-zabor-60mm-2-5m',
    'profnastil-s10-zabor-1-8x2',
    'setka-rabica-50-50-16-rulon-10x1-5',
    'setka-svarnaya-otsink-50-50-25',
  ],

  // Berloga — крепёж и метизы
  berloga: [
    'samorez-derevo-3-5x35-200sht',
    'samorez-metall-3-5x9-5-1000sht',
    'samorez-gkl-3-5x25-1000sht',
    'shurup-universalnyy-5x50-200sht',
    'dyubel-gvozd-6x60-50sht',
    'anker-klinovoy-m10x100-10sht',
    'anker-khimich-fischer-fis-v-360ml',
    'dyubel-neylonovyy-10x50-100sht',
    'bolt-m10x50-din933-25sht',
    'gayka-m10-din934-50sht',
    'shpilka-rezbovaya-m8x1000mm',
    'shayba-ploskaya-m10-din125-50sht',
    'gvozd-stroitelnyy-70x3-1kg',
    'gvozd-yershyonnyy-80x3-1-1kg',
    'skoba-steppler-53-10mm-1000sht',
    'gvozd-finishnyy-1-6x45-500sht',
  ],
};

async function main() {
  console.log('Привязываю товары к брендам...\n');

  // Загружаем бренды и товары
  const brands = await prisma.brand.findMany({
    select: { id: true, slug: true, name: true },
  });
  const brandBySlug = new Map(brands.map((b) => [b.slug, b]));

  let updated = 0;
  let notFound = 0;

  for (const [brandSlug, productSlugs] of Object.entries(BRAND_PRODUCT_MAP)) {
    const brand = brandBySlug.get(brandSlug);
    if (!brand) {
      console.warn(`  ⚠ Бренд не найден: ${brandSlug}`);
      continue;
    }

    for (const productSlug of productSlugs) {
      const result = await prisma.product.updateMany({
        where: { slug: productSlug },
        data: { brandId: brand.id },
      });

      if (result.count > 0) {
        updated++;
      } else {
        console.warn(`  ⚠ Товар не найден: ${productSlug}`);
        notFound++;
      }
    }

    console.log(`  ✓ ${brand.name} — привязано ${productSlugs.length} товаров`);
  }

  console.log(`\n✅ Обновлено: ${updated}`);
  if (notFound > 0) console.log(`⚠  Не найдено: ${notFound}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
