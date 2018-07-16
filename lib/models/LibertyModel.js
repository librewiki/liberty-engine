'use strict';

const Sequelize = require('sequelize');

class LibertyModel extends Sequelize.Model {
  static getAttributes() {
    return {};
  }

  static getOptions() {
    return {};
  }

  static getModelName() {
    return this.name.charAt(0).toLowerCase() + this.name.slice(1);
  }

  static init(sequelize) {
    super.init(
      this.getAttributes(),
      Object.assign(
        {
          sequelize,
          modelName: this.getModelName(),
        },
        this.getOptions(),
      ),
    );
  }

  static async autoTransaction(transaction, fn) {
    const isTransactionGiven = !!transaction;
    let t = transaction;
    if (!isTransactionGiven) {
      t = await this.sequelize.transaction();
    }
    try {
      const res = await fn(t);
      if (!isTransactionGiven) {
        await t.commit();
      }
      return res;
    } catch (err) {
      if (!isTransactionGiven) {
        await t.rollback();
      }
      throw err;
    }
  }

  autoTransaction(...args) {
    return this.constructor.autoTransaction(...args);
  }
}

module.exports = LibertyModel;
