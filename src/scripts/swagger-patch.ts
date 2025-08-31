import fs from "fs";
import path from "path";

const swaggerPath = path.join(
  __dirname,
  "..",
  "routes",
  "admin",
  "swagger.json"
);
const swagger = JSON.parse(fs.readFileSync(swaggerPath, "utf-8"));

interface PatchOptions {
  endpoint: string; // ví dụ: "/v1/admin/product"
  examples: Record<string, any>; // object chứa dữ liệu example
  pathParamExample?: Record<string, any>; // ví dụ: { productId: "..." }
}

/**
 * Gán example cho POST và PUT
 */
function patchSwaggerExample({
  endpoint,
  examples,
  pathParamExample,
}: PatchOptions) {
  const postPath = swagger.paths[endpoint]?.post;
  const putPath =
    swagger.paths[endpoint + "/{id}"]?.put ||
    swagger.paths[endpoint + "/{productId}"]?.put ||
    swagger.paths[endpoint + "/{categoryId}"]?.put ||
    swagger.paths[endpoint + "/{promotionId}"]?.put;

  // POST
  if (
    postPath?.requestBody?.content?.["multipart/form-data"]?.schema?.properties
  ) {
    const props =
      postPath.requestBody.content["multipart/form-data"].schema.properties;
    for (const key in examples) {
      props[key] = props[key] || {};
      props[key].example = examples[key];
    }
  }

  // PUT
  if (
    putPath?.requestBody?.content?.["multipart/form-data"]?.schema?.properties
  ) {
    const props =
      putPath.requestBody.content["multipart/form-data"].schema.properties;
    for (const key in examples) {
      props[key] = props[key] || {};
      props[key].example = examples[key];
    }

    // Thêm example cho path parameter
    if (pathParamExample && putPath.parameters) {
      for (const [paramName, exampleValue] of Object.entries(
        pathParamExample
      )) {
        const pathParam = putPath.parameters.find(
          (p: any) => p.name === paramName
        );
        if (pathParam) {
          pathParam.example = exampleValue;
        }
      }
    }
  }
}

/**
 * Gán example cho GET có search và pagination
 */
function patchSwaggerGetExamples({
  endpoint,
  queryExamples,
}: {
  endpoint: string; // ví dụ: "/v1/admin/product"
  queryExamples: Record<string, any>;
}) {
  const getPath = swagger.paths[endpoint]?.get;
  if (!getPath || !getPath.parameters) return;

  for (const [paramName, exampleValue] of Object.entries(queryExamples)) {
    const queryParam = getPath.parameters.find(
      (p: any) => p.name === paramName && p.in === "query"
    );
    if (queryParam) {
      queryParam.example = exampleValue;
    }
  }
}

const examples: Record<string, any> = {
  name: "Bánh bao nhân thịt heo trứng muối Thọ Phát abc",
  title: "Bịt bánh bao nhân thịt heo trứng muối Thọ Phát 6 cái ddd",
  slug: "banh-bao-nhan-thit-heo-trung-muoi-tho-phat-abc-bit-banh-bao-nhan-thit",
  meta_slug:
    "banh-bao-nhan-thit-heo-trung-muoi-tho-phat-abc-bit-banh-bao-nhan-thit",
  productType: "product-extend",
  description: "Bánh bao nhân thịt heo trứng muối Thọ Phát abc",
  short_description: "Bánh bao nhân thịt heo trứng muối Thọ Phát abc",
  price: 65000,
  product_extend: JSON.stringify({
    gallery_productExtend: [
      "[baseUrl]/chothongminh/product/PE000202/03dae44b-6d02-4491-adbd-0faff4ed8bb3.webp",
      "[baseUrl]/chothongminh/product/PE000203/72fe6a5e-e748-42c1-a655-910dcb89c064.webp",
      "[baseUrl]/chothongminh/product/PE000036/486ca6c2-98dd-43a8-aa48-04e12ecf007b.webp",
    ],
    productListExtend: [
      {
        extendIndex: 1,
        extend: {
          id: "9f138199-b8c5-4b44-bcf3-27e8a8882d65",
          title: "Bịt bánh bao nhân thịt heo trứng muối Thọ Phát 8 cái ddd",
          unit: "Bịt 8 cái",
          price: 95000,
          sale: 0,
          priceSale: 85000,
          productCode: "PE000202",
        },
      },
      {
        extendIndex: 2,
        extend: {
          id: "2a95808b-0e09-4c98-9d73-5b49cd15b6d9",
          title: "Bịt bánh bao nhân thịt heo trứng muối Thọ Phát 6 cái ddd",
          unit: "Bịt 6 cái",
          price: 65000,
          sale: 0,
          priceSale: 55000,
          productCode: "PE000203",
        },
      },
      {
        extendIndex: 3,
        extend: {
          title: "Bịt bánh bao nhân thịt heo trứng muối Thọ Phát 12 cái ddd",
          unit: "Bịt 12 cái",
          price: 125000,
          sale: 0,
          priceSale: 115000,
          productCode: "PE000036",
        },
      },
    ],
  }),
  unit: "Bịt 6 cái",
  availability: true,
  rating: 5,
  review_count: 33,
  meta_title: "Bánh bao nhân thịt heo trứng muối Thọ Phát abc",
  meta_keywords: "Bánh bao nhân thịt heo trứng muối Thọ Phát abc",
  meta_description: "Bánh bao nhân thịt heo trứng muối Thọ Phát abc",
  affiliateLinks: "https://affiliate.shopee.com",
  status: "Approve",
  categoryId: "141",
  referenceKey: "ed4c2798-0f34-4839-8662-9399f6c70b32",
  userUpdate: "ed4c2798-0f34-4839-8662-9399f6c70b32",
  userCreate: "ed4c2798-0f34-4839-8662-9399f6c70b32",
  isDeleted: false,
};

const exampleCategory = {
  name: "Thực phẩm",
  slug: "thuc-pham",
  description: "Danh mục chứa các sản phẩm thực phẩm",
  meta_title: "Danh mục Thực phẩm",
  meta_keywords: "thực phẩm, đồ ăn, đồ uống",
  meta_description: "Các sản phẩm thuộc danh mục thực phẩm",
  meta_slug: "thuc-pham",
  parentId: 0,
  index: 1,
  order: 1,
  createUser: 1,
  folderPath: "categories",
};

const examplePromotion = {
  name: "Flash Sale 2025",
  description: "Giảm giá lớn đầu năm cho tất cả sản phẩm điện tử.",
  type: "FLASH_SALE",
  color_code: "#FF5733",
  background_color_code: "#FFFFFF",
  background_color_promotion_code: "#FFE4B5",
  start_time: "2025-09-01T00:00:00.000Z",
  end_time: "2025-09-07T23:59:59.000Z",
  tenantId: 101,
  is_recurring: "false",
  recurring_config: "",
  status: true,
  userUpdate: "admin-uuid-12345",
  codeName: "FLASH2025",
  index: 1,
  value1: "Giảm 50% cho đơn hàng trên 1 triệu",
  value2: "Miễn phí vận chuyển",
  value3: "Áp dụng cho 1000 khách hàng đầu tiên",
  number1: 50,
  number2: 1000000,
  number3: 1000,
  bool1: true,
  bool2: false,
  bool3: false,
  limit_items: 500,
  folderPath: "promotionTest",
  distinctive:
    "tinh-khanh-hoa-thanh-pho-nha-trang-phuong-phuong-sai-52-quang-trung/da/type",
};

patchSwaggerExample({
  endpoint: "/v1/admin/product",
  examples: examples,
  pathParamExample: { productId: "3afbf496-2601-410a-8bcf-2ba6109cf121" },
});

patchSwaggerExample({
  endpoint: "/v1/admin/categories",
  examples: exampleCategory,
  pathParamExample: { productId: "3afbf496-2601-410a-8bcf-2ba6109cf121" },
});

patchSwaggerExample({
  endpoint: "/v1/admin/promotion",
  examples: examplePromotion,
  pathParamExample: { promotionId: "3afbf496-2601-410a-8bcf-2ba6109cf121" },
});

const getExample = {
  search: "",
  pageCurrent: 1,
  pageSize: 10,
  sortList: JSON.stringify([{ key: "createDate", value: "desc" }]),
  conditions: JSON.stringify([{ key: "tenantId", value: 3 }]),
};

patchSwaggerGetExamples({
  endpoint: "/v1/admin/product",
  queryExamples: getExample,
});
patchSwaggerGetExamples({
  endpoint: "/v1/admin/categories",
  queryExamples: getExample,
});
patchSwaggerGetExamples({
  endpoint: "/v1/admin/categories/getCategoryWithoutParentId",
  queryExamples: getExample,
});
patchSwaggerGetExamples({
  endpoint: "/v1/admin/product-detail",
  queryExamples: getExample,
});
patchSwaggerGetExamples({
  endpoint: "/v1/admin/product-detail/getProductDetailsCMSWithPromotion/data",
  queryExamples: getExample,
});
patchSwaggerGetExamples({
  endpoint: "/v1/admin/product-detail/getRevenueStatistic/getData/data",
  queryExamples: getExample,
});
fs.writeFileSync(swaggerPath, JSON.stringify(swagger, null, 2));
console.log("✅ Swagger.json đã được patch xong với dynamic function!");
