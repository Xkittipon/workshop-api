import prisma from "../config/prisma.js";

export const listUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enabled: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    res.json({
      ok: true,
      users: users,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error!!" });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const { id, enabled } = req.body;
    console.log("changeStatus", id, enabled);
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { enabled: enabled },
    });

    res.json({
      ok: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error!!" });
  }
};

export const changeRole = async (req, res) => {
  try {
    const { id, role } = req.body;
    console.log("changeRole", id, role);
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role: role },
    });

    res.json({
      ok: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error!!" });
  }
};

export const userCart = async (req, res) => {
  try {
    const { cart } = req.body;

    const user = await prisma.user.findFirst({
      where: { id: Number(req.user.id) },
    });
    //delete old cart items
    await prisma.productOnCart.deleteMany({
      where: { cart: { orderedById: user.id } },
    });

    // check quantity of products
    for (const item of cart) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { quantity: true, title: true },
      });
      if (!product || product.quantity < item.count) {
        return res.status(400).json({
          ok: false,
          message: `Product ${product.title} is out of stock or insufficient quantity`,
        });
      }
    }

    // delete old cart
    await prisma.cart.deleteMany({
      where: { orderedById: user.id },
    });

    const products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price,
    }));

    let cartTotal = products.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );

    // find summary of cart items
    const newCart = await prisma.cart.create({
      data: {
        cartTotal: cartTotal,
        orderedById: user.id,
        products: {
          create: products,
        },
      },
    });

    res.json({
      ok: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error!!" });
  }
};

export const getUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!req.user?.id) {
      return res.status(401).json({
        ok: false,
        message: "ไม่พบข้อมูลผู้ใช้",
      });
    }

    if (!cart) {
      return res.status(404).json({
        ok: false,
        message: "Cart not found",
        products: [],
        cartTotal: 0,
      });
    }

    res.json({
      products: cart.products,
      cartTotal: cart.cartTotal,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { orderedById: Number(req.user.id) },
    });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    await prisma.productOnCart.deleteMany({
      where: { cartId: cart.id },
    });

    await prisma.cart.deleteMany({
      where: { orderedById: Number(req.user.id) },
    });

    res.json({
      message: "Cart deleted successfully",
      deletedCount: result.count,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error!!" });
  }
};

export const saveAddress = async (req, res) => {
  try {
    const { address } = req.body;
    console.log(address);
    const addressUser = await prisma.user.update({
      where: { id: Number(req.user.id) },
      data: {
        address: address,
      },
    });

    res.json({ ok: true, message: "user address updated!!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error!!" });
  }
};
export const saveOrder = async (req, res) => {
  try {
    // get user cart
    const { id, amount, status, currency } = req.body.paymentIntent;
    const userCart = await prisma.cart.findFirst({
      where: {
        orderedById: Number(req.user.id),
      },
      include: { products: true },
    });

    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({ ok: false, message: "Cart is empty" });
    }

    const amountTHB = Number(amount) / 100;

    // create order
    const order = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,
            count: item.count,
            price: item.price,
          })),
        },
        orderedBy: {
          connect: {
            id: Number(req.user.id),
          },
        },
        cartTotal: userCart.cartTotal,
        stripePaymentId: id,
        amount: amountTHB,
        status: status,
        currency: currency,
      },
    });

    // update product quantity
    const update = userCart.products.map((item) => ({
      where: { id: item.productId },
      data: {
        quantity: { decrement: item.count },
        sold: { increment: item.count },
      },
    }));

    await Promise.all(update.map((updated) => prisma.product.update(updated)));

    await prisma.cart.deleteMany({
      where: { orderedById: Number(req.user.id) },
    });

    res.send("user order");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error!!" });
  }
};
export const getOrder = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { orderedById: Number(req.user.id) },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ ok: false, message: "No orders found" });
    }

    res.json({ ok: true, orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error!!" });
  }
};
