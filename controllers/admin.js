import prisma from "../config/prisma.js";

export const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;
    console.log("changeOrderStatus", orderId, orderStatus);

    const orderUpdate = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { orderStatus: orderStatus },
    });
    res.status(200).json({ success: true, orderStatus });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error!!" });
  }
};

export const getOrdersAdmin = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
        orderedBy: {
          select: {
            id: true,
            email: true,
            address: true,
          },
        },
      },
    });
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error!!" });
  }
};
