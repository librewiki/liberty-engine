'use strict';

const Sequelize = require('sequelize');

class LibertyModel extends Sequelize.Model {
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
