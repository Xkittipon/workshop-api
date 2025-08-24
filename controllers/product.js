import prisma from "../config/prisma.js";
import { v2 as cloudinary } from "cloudinary";

export const addProduct = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;
    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),

        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.asset_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });

    res.send("add Product!!");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const listProduct = async (req, res) => {
  try {
    const { count } = req.params;
    const products = await prisma.product.findMany({
      take: parseInt(count),
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: true,
      },
    });

    res.send(products);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const readProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        category: true,
        images: true,
      },
    });

    res.send(products);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;

    await prisma.image.deleteMany({
      where: {
        productId: Number(req.params.id),
      },
    });

    const product = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),

        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.asset_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });

    res.send("update product");
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });

    res.send("remove product!!");
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const listby = async (req, res) => {
  try {
    const { sort, order, limit } = req.body;
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { [sort]: order },
      include: { category: true, images: true },
    });

    res.send(products);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

const handleQuery = async (req, res, query) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).send("Search Error");
  }
};
const handlePrice = async (req, res, priceRange) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0],
          lte: priceRange[1],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    return res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error!!" });
  }
};
const handleCategory = async (req, res, category) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: category.map((id) => Number(id)),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    return res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server Error!!" });
  }
};
export const searchFilters = async (req, res) => {
  try {
    const { query, category, price } = req.body;

    if (query) {
      console.log("query!!", query);
      await handleQuery(req, res, query);
    }
    if (category) {
      console.log("category!!");
      await handleCategory(req, res, category);
    }
    if (price) {
      console.log("price!!", price);
      await handlePrice(req, res, price);
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const addImages = async (req, res) => {
  try {
    console.log("req.body.image", req.body);
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `${Date.now()}`,
      result_type: "auto",
      folder: "ecommerce",
    });
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const removeImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    console.log("public_id", public_id);
    cloudinary.uploader.destroy(public_id, (result) => {
      res.send("Image removed successfully");
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
