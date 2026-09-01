import bcrypt from 'bcryptjs';

// In-Memory Collections
export const db = {
  users: [],
  products: [],
  orders: [],
};

const generateId = () => {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

// --- In-Memory USER Model Helper ---
export class MemoryUser {
  constructor(data) {
    this._id = data._id || generateId();
    this.name = data.name;
    this.email = data.email?.toLowerCase();
    this.password = data.password;
    this.role = data.role || 'customer';
    this.avatar = data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
    this.phone = data.phone || '+91 98765 43210';
    this.address = data.address || { street: '', city: 'Bengaluru', state: 'Karnataka', postalCode: '560001', country: 'India' };
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    if (this.password.startsWith('$2')) {
      return await bcrypt.compare(enteredPassword, this.password);
    }
    return enteredPassword === this.password;
  }

  async save() {
    this.updatedAt = new Date();
    if (this.password && !this.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    const idx = db.users.findIndex((u) => u._id.toString() === this._id.toString());
    if (idx >= 0) {
      db.users[idx] = this;
    } else {
      db.users.push(this);
    }
    return this;
  }

  toObject() {
    return { ...this };
  }

  static async countDocuments(query = {}) {
    return db.users.filter((u) => {
      if (query.role && u.role !== query.role) return false;
      return true;
    }).length;
  }

  static async find(query = {}) {
    let result = db.users.filter((u) => {
      if (query.role && query.role !== 'all' && u.role !== query.role) return false;
      if (query.$or) {
        return query.$or.some((condition) => {
          if (condition.name && condition.name.test(u.name)) return true;
          if (condition.email && condition.email.test(u.email)) return true;
          return false;
        });
      }
      return true;
    });

    return {
      select: () => ({
        sort: () => result.map((u) => new MemoryUser(u)),
      }),
      sort: () => result.map((u) => new MemoryUser(u)),
    };
  }

  static async findOne(query) {
    const user = db.users.find((u) => {
      if (query.email && u.email?.toLowerCase() === query.email?.toLowerCase()) return true;
      return false;
    });
    if (!user) return null;
    const instance = new MemoryUser(user);
    return {
      ...instance,
      select: () => instance,
      matchPassword: (p) => instance.matchPassword(p),
      save: () => instance.save(),
    };
  }

  static async findById(id) {
    const user = db.users.find((u) => u._id.toString() === id.toString());
    if (!user) return null;
    const instance = new MemoryUser(user);
    return {
      ...instance,
      select: () => instance,
      save: () => instance.save(),
    };
  }

  static async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const user = new MemoryUser({ ...data, password: hashedPassword });
    db.users.push(user);
    return user;
  }

  static async deleteMany() {
    db.users = [];
  }

  static async findByIdAndDelete(id) {
    const idx = db.users.findIndex((u) => u._id.toString() === id.toString());
    if (idx >= 0) {
      db.users.splice(idx, 1);
    }
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const idx = db.users.findIndex((u) => u._id.toString() === id.toString());
    if (idx >= 0) {
      const updated = { ...db.users[idx], ...update.$set || update, updatedAt: new Date() };
      db.users[idx] = new MemoryUser(updated);
      return db.users[idx];
    }
    return null;
  }
}

// --- In-Memory PRODUCT Model Helper ---
export class MemoryProduct {
  constructor(data) {
    this._id = data._id || generateId();
    this.name = data.name;
    this.slug = data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    this.description = data.description;
    this.price = Number(data.price);
    this.originalPrice = data.originalPrice ? Number(data.originalPrice) : this.price;
    this.category = data.category;
    this.subcategory = data.subcategory || 'General';
    this.brand = data.brand || 'PanicDrop Bharat';
    this.stock = Number(data.stock) || 0;
    this.images = Array.isArray(data.images) ? data.images : [data.images || ''];
    this.rating = Number(data.rating) || 4.8;
    this.numReviews = Number(data.numReviews) || 0;
    this.reviews = data.reviews || [];
    this.featured = Boolean(data.featured);
    this.badge = data.badge || '';
    this.specs = data.specs || {};
    this.tags = data.tags || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const idx = db.products.findIndex((p) => p._id.toString() === this._id.toString());
    if (idx >= 0) {
      db.products[idx] = this;
    } else {
      db.products.push(this);
    }
    return this;
  }

  static async countDocuments(query = {}) {
    return db.products.filter((p) => {
      if (query.isActive !== undefined && p.isActive !== query.isActive) return false;
      if (query.stock !== undefined && query.stock.$gt !== undefined && p.stock <= query.stock.$gt) return false;
      if (query.stock === 0 && p.stock !== 0) return false;
      return true;
    }).length;
  }

  static async find(query = {}) {
    let result = db.products.filter((p) => {
      if (query.isActive !== undefined && p.isActive !== query.isActive) return false;
      if (query.featured && !p.featured) return false;
      if (query.stock && query.stock.$gt !== undefined && p.stock <= query.stock.$gt) return false;
      if (query.stock && query.stock.$lte !== undefined && p.stock > query.stock.$lte) return false;

      if (query.category) {
        if (typeof query.category === 'object' && query.category.$regex) {
          if (!query.category.$regex.test(p.category)) return false;
        } else if (p.category.toLowerCase() !== query.category.toLowerCase()) {
          return false;
        }
      }

      if (query.price) {
        if (query.price.$gte !== undefined && p.price < query.price.$gte) return false;
        if (query.price.$lte !== undefined && p.price > query.price.$lte) return false;
      }

      if (query.$or) {
        const matches = query.$or.some((cond) => {
          if (cond.name && cond.name.test(p.name)) return true;
          if (cond.description && cond.description.test(p.description)) return true;
          if (cond.category && cond.category.test(p.category)) return true;
          if (cond.brand && cond.brand.test(p.brand)) return true;
          return false;
        });
        if (!matches) return false;
      }

      return true;
    });

    const chain = {
      _data: result,
      sort: function (sortOpts) {
        if (sortOpts?.price === 1) this._data.sort((a, b) => a.price - b.price);
        else if (sortOpts?.price === -1) this._data.sort((a, b) => b.price - a.price);
        else if (sortOpts?.rating === -1) this._data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        else if (sortOpts?.name === 1) this._data.sort((a, b) => a.name.localeCompare(b.name));
        return this;
      },
      skip: function (num) {
        this._data = this._data.slice(num);
        return this;
      },
      limit: function (num) {
        this._data = this._data.slice(0, num);
        return this;
      },
      select: function () {
        return this;
      },
      then: function (resolve) {
        resolve(this._data.map((p) => new MemoryProduct(p)));
      },
    };

    return chain;
  }

  static async findById(id) {
    const prod = db.products.find((p) => p._id.toString() === id.toString());
    if (!prod) return null;
    const instance = new MemoryProduct(prod);
    instance.populate = () => instance;
    return instance;
  }

  static async findOne(query) {
    const prod = db.products.find((p) => {
      if (query.slug && p.slug === query.slug) return true;
      return false;
    });
    if (!prod) return null;
    const instance = new MemoryProduct(prod);
    instance.populate = () => instance;
    return instance;
  }

  static async distinct(field, query = {}) {
    const list = db.products.filter((p) => (query.isActive ? p.isActive : true)).map((p) => p[field]);
    return [...new Set(list)];
  }

  static async aggregate(pipeline) {
    const categoriesMap = {};
    db.products.forEach((p) => {
      if (!p.isActive) return;
      if (!categoriesMap[p.category]) {
        categoriesMap[p.category] = { _id: p.category, count: 0, totalPrice: 0, image: p.images?.[0] };
      }
      categoriesMap[p.category].count += 1;
      categoriesMap[p.category].totalPrice += p.price;
    });

    return Object.values(categoriesMap).map((c) => ({
      _id: c._id,
      count: c.count,
      avgPrice: c.totalPrice / c.count,
      image: c.image,
    }));
  }

  static async create(data) {
    const prod = new MemoryProduct(data);
    db.products.push(prod);
    return prod;
  }

  static async insertMany(list) {
    const prods = list.map((item) => new MemoryProduct(item));
    db.products.push(...prods);
    return prods;
  }

  static async deleteMany() {
    db.products = [];
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const idx = db.products.findIndex((p) => p._id.toString() === id.toString());
    if (idx >= 0) {
      const data = update.$set || update;
      const updated = new MemoryProduct({ ...db.products[idx], ...data, updatedAt: new Date() });
      db.products[idx] = updated;
      return updated;
    }
    return null;
  }

  static async findByIdAndDelete(id) {
    const idx = db.products.findIndex((p) => p._id.toString() === id.toString());
    if (idx >= 0) {
      db.products.splice(idx, 1);
    }
  }
}

// --- In-Memory ORDER Model Helper ---
export class MemoryOrder {
  constructor(data) {
    this._id = data._id || generateId();
    this.user = data.user;
    this.orderItems = data.orderItems || [];
    this.shippingAddress = data.shippingAddress;
    this.paymentMethod = data.paymentMethod || 'UPI (Google Pay / PhonePe)';
    this.itemsPrice = Number(data.itemsPrice) || 0;
    this.taxPrice = Number(data.taxPrice) || 0;
    this.shippingPrice = Number(data.shippingPrice) || 0;
    this.totalAmount = Number(data.totalAmount) || 0;
    this.isPaid = data.isPaid !== undefined ? data.isPaid : true;
    this.paidAt = data.paidAt || new Date();
    this.orderStatus = data.orderStatus || 'processing';
    this.trackingNumber = data.trackingNumber || 'BLUEDART-IND-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    this.deliveredAt = data.deliveredAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const idx = db.orders.findIndex((o) => o._id.toString() === this._id.toString());
    if (idx >= 0) {
      db.orders[idx] = this;
    } else {
      db.orders.push(this);
    }
    return this;
  }

  static async countDocuments(query = {}) {
    return db.orders.filter((o) => {
      if (query.orderStatus && o.orderStatus !== query.orderStatus) return false;
      if (query.user && o.user?._id?.toString() !== query.user.toString() && o.user?.toString() !== query.user.toString()) return false;
      return true;
    }).length;
  }

  static async find(query = {}) {
    let result = db.orders.filter((o) => {
      if (query.user && o.user?._id?.toString() !== query.user.toString() && o.user?.toString() !== query.user.toString()) {
        return false;
      }
      if (query.orderStatus && o.orderStatus !== query.orderStatus) {
        return false;
      }
      if (query.isPaid !== undefined && o.isPaid !== query.isPaid) {
        return false;
      }
      return true;
    });

    const chain = {
      _data: result,
      populate: function () {
        this._data = this._data.map((o) => {
          const userObj = db.users.find((u) => u._id.toString() === (o.user?._id || o.user)?.toString());
          return {
            ...o,
            user: userObj ? { _id: userObj._id, name: userObj.name, email: userObj.email, avatar: userObj.avatar } : o.user,
          };
        });
        return this;
      },
      sort: function () {
        this._data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return this;
      },
      skip: function (num) {
        this._data = this._data.slice(num);
        return this;
      },
      limit: function (num) {
        this._data = this._data.slice(0, num);
        return this;
      },
      then: function (resolve) {
        resolve(this._data.map((o) => new MemoryOrder(o)));
      },
    };

    return chain;
  }

  static async findById(id) {
    const ord = db.orders.find((o) => o._id.toString() === id.toString());
    if (!ord) return null;
    const instance = new MemoryOrder(ord);
    instance.populate = (field, select) => {
      const userObj = db.users.find((u) => u._id.toString() === (instance.user?._id || instance.user)?.toString());
      if (userObj) {
        instance.user = { _id: userObj._id, name: userObj.name, email: userObj.email, avatar: userObj.avatar };
      }
      return instance;
    };
    return instance;
  }

  static async deleteMany() {
    db.orders = [];
  }

  static async create(data) {
    const ord = new MemoryOrder(data);
    db.orders.push(ord);
    return ord;
  }
}
