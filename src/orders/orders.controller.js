const path = require("path");

// order the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
const { forEach } = require("../data/dishes-data");

// TODO: Implement the /orders handlers needed to make the tests pass

function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({
          status: 400,
          message: `Must include a ${propertyName}`
      });
    };
  }
  
  function list(req, res) {
    const { orderId } = req.params;
    res.json({ data: orders.filter(orderId ? order => order.id == orderId : () => true) });
  }
  
  function orderExists(req, res, next) {
    const orderId = req.params.orderId;
    const foundorder = orders.find((order) => order.id === orderId);
    if (foundorder) {
      res.locals.foundorder = foundorder;
      return next();
    }
    next({
      status: 404,
      message: `order id not found: ${orderId}`,
    });
  }
  
  function create(req, res) {
    const { data: {deliverTo, mobileNumber,status, dishes } = {} } = req.body;
    if (!Array.isArray(dishes) || dishes.length === 0) {
        res.status(400).json({ error: "dishes can't be empty" });
    }
    const dishQuantitymissing = dishes.some(dish => dish.quantity === undefined);
    if (dishQuantitymissing) {
        res.status(400).json({ error: "dish quantity should be at least 1" });
    }
    const dishQuantityNaN = dishes.some(dish => !Number.isInteger(dish.quantity));
    if (dishQuantityNaN) {
        res.status(400).json({ error: "dish quantity should be at least 2" });
    }
    const dishQuantityZero = dishes.some(dish => dish.quantity === 0);
    if (dishQuantityZero) {
        res.status(400).json({ error: "dish quantity can't be 0" });
    }

    const neworder = {
      id: orders.length + 1,
      deliverTo,
      mobileNumber,
      status,
      dishes,
    };
    orders.push(neworder);
    res.status(201).json({ data: neworder });
  }
  
  function read(req, res) {
    res.json({ data: res.locals.foundorder });
  }
  
  function update(req, res) {
    const { orderId } = req.params;
    const { data: { id, deliverTo, mobileNumber,status, dishes } = {} } = req.body;

    if (id !== undefined && id !== null && id !== "" && id !== orderId) {
      res.status(400).json({ error: `id ${id} does not match ${orderId} in the route` });
    }

    if (!Array.isArray(dishes) || dishes.length === 0) {
      res.status(400).json({ error: "dishes can't be empty" });
    }
    const dishQuantitymissing = dishes.some(dish => dish.quantity === undefined);
    if (dishQuantitymissing) {
      res.status(400).json({ error: "dish quantity should be at least 1" });
    }
    const dishQuantityNaN = dishes.some(dish => !Number.isInteger(dish.quantity));
    if (dishQuantityNaN) {
      res.status(400).json({ error: "dish quantity should be at least 2" });
    }
    const dishQuantityZero = dishes.some(dish => dish.quantity === 0);
    if (dishQuantityZero) {
      res.status(400).json({ error: "dish quantity can't be 0" });
    }
    if (status === "invalid") {
      res.status(400).json({ error: "status can't be invalid" });
    }
    // update the order
    res.locals.foundorder.deliverTo = deliverTo;
    res.locals.foundorder.mobileNumber = mobileNumber;
    res.locals.foundorder.status = status;
    res.locals.foundorder.dishes = dishes;
  
    res.status(200).json({ data: res.locals.foundorder });
  }
  
  function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    // `splice()` returns an array of the deleted elements, even if it is one element
    const deletedorders = orders.splice(index, 1);

    if (deletedorders[0].status !== "pending") {
      res.status(400).json({ error: "status is pending" });
    }
    res.sendStatus(204);
  }
  
  module.exports = {
    create: [bodyDataHas("deliverTo"), bodyDataHas("mobileNumber"), bodyDataHas("dishes"), create],
    list,
    read: [orderExists, read],
    update: [orderExists, bodyDataHas("deliverTo"), bodyDataHas("mobileNumber"), bodyDataHas("status"), update],
    delete: [orderExists, destroy],
  };