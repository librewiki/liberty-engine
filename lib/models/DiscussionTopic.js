'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class DiscussionTopic extends LibertyModel {
  static getAttributes() {
    return {
      /**
       * Primary key.
       *
       * @property id
       * @type Number
       */
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('OPEN', 'PAUSED', 'CLOSED'),
        allowNull: false,
        defaultValue: 'OPEN',
      },
    };
  }

  static getOptions() {
    return {
      paranoid: true,
      scopes: {
        open: {
          where: {
            status: 'OPEN',
          },
        },
        closed: {
          where: {
            status: 'CLOSED',
          },
        },
      },
      indexes: [{
        fields: ['updatedAt'],
      }],
    };
  }

  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    this.belongsTo(models.Article, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    this.hasMany(models.DiscussionComment, {
      as: 'comments',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      foreignKey: 'topicId',
    });
  }

  static createNew({
    article, title, wikitext, ipAddress, author, transaction,
  }) {
    return this.autoTransaction(transaction, async (transaction) => {
      const newTopic = await this.create({
        title: title.trim(),
        articleId: article.id,
      }, { transaction });
      await models.DiscussionComment.createNew({
        topic: newTopic,
        wikitext,
        ipAddress,
        author,
        transaction,
      });
      return newTopic;
    });
  }

  async getFirstComment() {
    return models.DiscussionComment.findOne({
      where: {
        topicId: this.id,
      },
      order: [['id', 'ASC']],
      include: [
        models.DiscussionComment.associations.author,
        models.DiscussionComment.associations.hider,
      ],
    });
  }
}

module.exports = DiscussionTopic;
