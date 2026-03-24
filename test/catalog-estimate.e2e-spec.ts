import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { ProductController } from '../src/product/product.controller';
import { ProductService } from '../src/product/product.service';
import { EstimateController } from '../src/estimate/estimate.controller';
import { EstimateService } from '../src/estimate/estimate.service';

describe('Catalog + Estimate (e2e)', () => {
  let app: INestApplication<App>;
  const productServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getRecommendations: jest.fn(),
  };
  const estimateServiceMock = {
    preview: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductController, EstimateController],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        { provide: EstimateService, useValue: estimateServiceMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /products parses filters and returns paginated payload', async () => {
    productServiceMock.findAll.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });

    await request(app.getHttpServer())
      .get('/products?categoryId=1&includeChildren=false&page=1&pageSize=20')
      .expect(200)
      .expect({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      });

    expect(productServiceMock.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 1,
        includeChildren: false,
        page: 1,
        pageSize: 20,
      }),
    );
  });

  it('POST /estimate/preview returns calculated estimate payload', async () => {
    estimateServiceMock.preview.mockResolvedValue({
      items: [
        {
          productId: 1,
          name: 'Cement M500',
          unit: 'kg',
          price: 350.5,
          quantity: 2,
          lineTotal: 701,
        },
      ],
      total: 701,
    });

    await request(app.getHttpServer())
      .post('/estimate/preview')
      .send({ items: [{ productId: 1, quantity: 2 }] })
      .expect(201)
      .expect({
        items: [
          {
            productId: 1,
            name: 'Cement M500',
            unit: 'kg',
            price: 350.5,
            quantity: 2,
            lineTotal: 701,
          },
        ],
        total: 701,
      });
  });

  it('POST /estimate/preview validates quantity > 0', async () => {
    await request(app.getHttpServer())
      .post('/estimate/preview')
      .send({ items: [{ productId: 1, quantity: 0 }] })
      .expect(400);
  });
});
