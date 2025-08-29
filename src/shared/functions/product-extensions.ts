import {
  ProductExtendV1Dto,
  ProductExtendV2Dto,
} from "../../model/dto/product/product.dto";
import { ProductModel } from "../../model/entities/product.entities";
import { S3Service } from "../../services/helper-services/s3.service";
import {
  createSlug,
  isNullOrEmpty,
} from "../../services/helper-services/sp-service";
import { autoMap, autoMapWithClass } from "../utils/autoMap-untility";
import { getUrlImgProduct } from "../utils/img-untity";
import { v4 as uuidv4 } from "uuid";
import { generateCode } from "../utils/mgo.utility";
import { ProductDetailsModel } from "../../model/entities/product-detail.entities";
import { ProductDtExtendV1Dto } from "../../model/dto/product-detail/product-detail.dto";

const organization: string = "chothongminh";

export class ProductExtension {
  private readonly _s3Service = new S3Service();

  async prepareMainProduct(productData: any, listGallery: any) {
    const productCode = await generateCode("P");
    const slugTrim =
      (productData.name.trim() || "") + "-" + (productData.title.trim() || "");

    const slug = createSlug(slugTrim);

    const uploadResult = await this._s3Service.uploadMultipleFilesAsync(
      listGallery,
      "product",
      productCode
    );

    const fileNames = JSON.parse(uploadResult.fileNames);

    return new ProductModel({
      ...productData,
      id: uuidv4(),
      productCode,
      slug,
      // product_extend: "",
      gallery_product: uploadResult.fileNames,
      image_url: getUrlImgProduct("[baseUrl]", productCode, fileNames[0]),
    });
  }

  async prepareVariants(
    productExtend: any,
    listImgVariant: any,
    sourceProduct: any
  ) {
    if (isNullOrEmpty(productExtend) || productExtend === "null") return [];
    const variantList = JSON.parse(productExtend)?.productListExtend || [];
    productExtend = JSON.parse(productExtend);
    const variants = await Promise.all(
      variantList.map(async (variant: any, index: number) => {
        const variantCode = await generateCode("PE");
        const imgFile = listImgVariant?.[index];
        const base = autoMap(sourceProduct, variant.extend);

        base._id = undefined;
        const slugTrim = `${base.name.trim()}-${base.title.trim()}`;
        const variantData = {
          ...base,
          id: uuidv4(),
          productCode: variantCode,
          //    product_extend: "",
          productType: "product-extend",
          slug: createSlug(slugTrim),
          meta_slug: createSlug(`${base.name}-${base.title}`),
          gallery_product: sourceProduct.gallery_product,
        };
        let uploadResult;
        if (imgFile) {
          uploadResult = await this._s3Service.uploadSingleFileAsync(
            [imgFile],
            "product",
            variantCode
          );
          variantData.image_url = getUrlImgProduct(
            "[baseUrl]",
            variantCode,
            uploadResult.fileName
          );
        }
        if (!productExtend?.gallery_productExtend) {
          productExtend.gallery_productExtend = [];
          productExtend.productListExtend[index].extend.productCode =
            variantCode;
        }
        productExtend.gallery_productExtend.push(uploadResult.fileName);
        return new ProductModel(variantData);
      })
    );

    return { variantDocs: variants, productExtend };
  }

  async prepareMainProductV1(productData: any, listGallery: any) {
    const productCode = await generateCode("P");
    const slugTrim =
      (productData.name.trim() || "") + "-" + (productData.title.trim() || "");

    const slug = createSlug(slugTrim);

    const uploadResult = await this._s3Service.uploadMultipleFilesAsync(
      listGallery,
      "productTest",
      productCode
    );

    let fileNames = JSON.parse(uploadResult.fileNames);

    fileNames = fileNames.map((file: string) =>
      getUrlImgProduct("[baseUrl]", productCode, file)
    );
    return new ProductModel({
      ...productData,
      id: uuidv4(),
      productCode,
      slug,
      // product_extend: "",
      gallery_product: fileNames,
      image_url: getUrlImgProduct("[baseUrl]", productCode, fileNames[0]),
    });
  }

  async prepareVariantsV1(
    productExtend: any,
    listImgVariant: any,
    sourceProduct: any
  ): Promise<{ variantDocs: any[]; productExtend: any }> {
    if (isNullOrEmpty(productExtend) || productExtend === "null") {
      return { variantDocs: [], productExtend: null };
    }

    const variantList = JSON.parse(productExtend)?.productListExtend || [];
    productExtend = JSON.parse(productExtend);

    const variants = await Promise.all(
      variantList.map(async (variant: any, index: number) => {
        const variantCode = await generateCode("PE");
        const imgFile = listImgVariant?.[index];
        const base = autoMap(sourceProduct, variant.extend);

        base._id = undefined;
        const slugTrim = `${base.name.trim()}-${base.title.trim()}`;
        const variantData = {
          ...base,
          id: uuidv4(),
          productCode: variantCode,
          product_extend: "",
          productType: "product-extend",
          slug: createSlug(slugTrim),
          meta_slug: createSlug(`${base.name}-${base.title}`),
          gallery_product: [],
        };

        let uploadResult;
        if (imgFile) {
          uploadResult = await this._s3Service.uploadSingleFileAsync(
            imgFile,
            "productTest",
            variantCode
          );
          variantData.image_url = getUrlImgProduct(
            "[baseUrl]",
            variantCode,
            uploadResult.fileName
          );
        }

        if (!productExtend?.gallery_productExtend) {
          productExtend.gallery_productExtend = [];
          productExtend.productListExtend[index].extend.productCode =
            variantCode;
        }
        productExtend.gallery_productExtend.push(uploadResult?.fileName);

        return new ProductModel(variantData);
      })
    );

    return { variantDocs: variants, productExtend };
  }

  async updateMainProduct(productInDb: any, newData: any, newGallery: any) {
    let galleryFiles = productInDb.gallery_product;
    let imageUrl = productInDb.image_url;

    if (newGallery?.length > 0) {
      const uploadResult = await this._s3Service.uploadMultipleFilesAsync(
        newGallery,
        "productTest",
        productInDb.productCode
      );

      let fileNames = JSON.parse(uploadResult.fileNames);

      fileNames = fileNames.map((file: string) =>
        getUrlImgProduct("[baseUrl]", productInDb.productCode, file)
      );

      galleryFiles = fileNames;
      imageUrl = fileNames[0];
    }
    const slugTrim =
      productInDb.name.trim() || "" + "-" + (productInDb.title.trim() || "");
    const slug = createSlug(slugTrim);

    return {
      ...productInDb,
      ...newData,
      slug,
      gallery_product: galleryFiles,
      image_url: imageUrl,
      updateDate: new Date(),
    };
  }

  async syncVariants(
    productExtend: any,
    listImgVariant: any,
    sourceProduct: any
  ) {
    if (isNullOrEmpty(productExtend) || productExtend === "null") {
      return { updatedVariants: [], createdVariants: [] };
    }

    const variantList = JSON.parse(productExtend)?.productListExtend || [];
    const updatedVariants = [];
    const createdVariants = [];

    for (let index = 0; index < variantList.length; index++) {
      const variant = variantList[index];
      const imgFile = listImgVariant?.[index];
      const variantId = variant.extend?.id;

      if (variantId) {
        const existing = await ProductModel.findOne({
          productId: variantId,
          isDeleted: false,
        });
        if (existing) {
          const updateData = await this.buildUpdateVariant(
            existing,
            variant,
            index,
            sourceProduct,
            imgFile
          );
          updatedVariants.push({
            id: existing.productId,
            updateData,
            productCode: existing.productCode,
          });
          continue;
        }
      }

      const createData = await this.buildCreateVariant(
        variant,
        index,
        sourceProduct,
        imgFile
      );
      createdVariants.push({
        id: createData.id,
        updateData: createData,
        productCode: createData.productCode,
      });
    }

    return { updatedVariants, createdVariants };
  }
  async buildCreateVariant(
    variant: any,
    index: number,
    sourceProduct: any,
    imgFile: any
  ) {
    const variantCode = await generateCode("PE"); // PE = Product Extend
    const base = autoMap(sourceProduct, variant.extend);
    base._id = undefined;

    const slug = createSlug(
      `${base.name.trim() || ""}-${base.title.trim() || ""}`
    );

    const variantData = {
      ...base,
      productId: uuidv4(),
      productCode: variantCode,
      product_extend: "",
      referenceKey: sourceProduct.referenceKey,
      productType: "product-extend",
      slug,
      meta_slug: slug,
      gallery_product: sourceProduct.gallery_product,
      createDate: new Date(),
      updateDate: new Date(),
    };

    if (imgFile) {
      const uploadResult = await this._s3Service.uploadSingleFileAsync(
        imgFile,
        "product",
        variantCode
      );
      variantData.image_url = getUrlImgProduct(
        "[baseUrl]",
        variantCode,
        uploadResult.fileName
      );
      variantData.gallery_product = [variantData.image_url];
    }

    return variantData;
  }
  async buildUpdateVariant(
    variantInDb: any,
    variant: any,
    index: number,
    sourceProduct: any,
    imgFile: any
  ) {
    const base = autoMap(sourceProduct, variant.extend);
    base._id = undefined;

    const variantCode =
      variant?.extend?.productCode ||
      variantInDb.productCode ||
      `${sourceProduct.productCode}-V${index + 1}`;
    const slug = createSlug(
      `${base.name.trim() || ""}-${base.title.trim() || ""}`
    );

    let imageUrl = variantInDb.image_url;
    let galleryFiles = variantInDb.gallery_product;

    if (imgFile) {
      const uploadResult = await this._s3Service.uploadSingleFileAsync(
        imgFile,
        "productTest",
        variantCode
      );
      imageUrl = getUrlImgProduct(
        "[baseUrl]",
        variantCode,
        uploadResult.fileName
      );
      galleryFiles = [imageUrl];
    }

    return {
      ...variantInDb.toObject(),
      ...base,
      slug,
      product_extend: "",
      productType: "product-extend",
      meta_slug: slug,
      gallery_product: galleryFiles,
      image_url: imageUrl,
      updateDate: new Date(),
    };
  }

  async mapProductListV1(sources: any) {
    const referenceKeys = sources.map((p: any) => p.referenceKey);

    // B2: Lấy toàn bộ biến thể theo referenceKey
    const variants = await ProductModel.find({
      productType: "product-extend",
      isDeleted: false,
      referenceKey: { $in: referenceKeys },
    }).lean();

    // B3: Gộp dữ liệu
    const variantMap = variants.reduce((map: any, v: any) => {
      const key = v.referenceKey;
      if (!map[key]) map[key] = [];
      map[key].push(v);
      return map;
    }, {});

    const finalData = sources.map((source: any) => {
      const extendsList = variantMap[source.referenceKey] || [];

      const productListExtend = extendsList.map((item: any, index: number) => ({
        extendIndex: index + 1,
        extend: autoMapWithClass(item, ProductExtendV1Dto),
      }));

      // ✅ gallery_productExtend từ image_url của từng biến thể
      const gallery_productExtend = [
        ...new Set(
          extendsList
            .map((v: any) => v.image_url?.split("/").pop()) // cắt tên file ảnh
            .filter(Boolean)
        ),
      ];

      // Nếu cả 2 đều rỗng thì trả về ""
      const product_extend =
        productListExtend.length === 0 && gallery_productExtend.length === 0
          ? ""
          : JSON.stringify({
              gallery_productExtend: JSON.stringify(gallery_productExtend),
              productListExtend,
            });

      return {
        ...source,
        categoryId: parseInt(source.categoryId),
        product_extend,
      };
    });

    return finalData;
  }

  async mapProductListV2(sources: any) {
    const referenceKeys = sources.map((p: any) => p.referenceKey);

    // Lấy toàn bộ biến thể theo referenceKey
    const variants = await ProductModel.find({
      productType: "product-extend",
      isDeleted: false,
      referenceKey: { $in: referenceKeys },
    }).lean();

    // Gom nhóm biến thể theo referenceKey
    const variantMap = variants.reduce((map: any, v: any) => {
      const key = v.referenceKey;
      if (!map[key]) map[key] = [];
      map[key].push(v);
      return map;
    }, {});

    // Gộp dữ liệu vào source
    const finalData = sources.map((source: any) => {
      const extendsList = variantMap[source.referenceKey] || [];

      // Ánh xạ mỗi biến thể qua class ProductExtendV1Dto
      const product_extend = extendsList.map((item: any) =>
        autoMapWithClass(item, ProductExtendV2Dto)
      );

      return {
        ...source,
        product_extend,
      };
    });

    return finalData;
  }

  async mapProductListV1Async(sources: any) {
    const referenceKeys = sources.map((p: any) => p.referenceKey);

    // B2: Lấy toàn bộ biến thể theo referenceKey
    const variants = await ProductDetailsModel.find({
      productType: "product-extend",
      isDeleted: false,
      referenceKey: { $in: referenceKeys },
    }).lean();

    // B3: Gộp dữ liệu theo referenceKey
    const variantMap = variants.reduce((map: Record<string, any>, v) => {
      const key = v.referenceKey;
      if (!map[key]) map[key] = [];
      map[key].push(v);
      return map;
    }, {});

    const finalData = sources.map((source: any) => {
      const extendsList = variantMap[source.referenceKey] || [];

      const productListExtend = extendsList.map((item: any, index: number) => ({
        extendIndex: index + 1,
        extend: ProductDtExtendV1Dto.init(item),
      }));

      const product_extend =
        productListExtend.length === 0 ? "" : JSON.stringify(productListExtend);

      const product_extend_ids = extendsList.map((item: any) => item.id);

      return {
        ...source,
        categoryId: parseInt(source.categoryId),
        product_extend,
        product_extend_ids,
      };
    });

    return finalData;
  }
}
