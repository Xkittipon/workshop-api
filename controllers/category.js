import prisma from "../config/prisma.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({
      data: {
        name: name,
      },
    });

    res.send(category);
  } catch (err) {
    console.log(err);
    res.status(500).send("createCategory server error");
  }
};
export const listCategory = async (req, res) => {
  try {
    const category = await prisma.category.findMany();

    res.send(category);
  } catch (err) {
    console.log(err);
    res.status(500).send("list server error");
  }
};
export const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.delete({
      where: {
        id: Number(id),
      },
    });

    console.log(category);
    res.send("Remove category successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("removeCategory server error");
  }
};
