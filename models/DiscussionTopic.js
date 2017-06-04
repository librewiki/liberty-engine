/**
 * Provides DiscussionTopic model.
 *
 * @module models
 * @submodule DiscussionTopic
 */

'use strict';

const models = require('./');

/**
 * Model representing topic of discussion.
 *
 * @class DiscussionTopic
 */
module.exports = function(sequelize, DataTypes) {
  const DiscussionTopic = sequelize.define('discussionTopic', {
    /**
     * Primary key.
     *
     * @property id
     * @type Number
     */
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
  }, {
    paranoid: true,
    classMethods: {
      /**
       * Describes associations.
       * @method associate
       * @static
       * @param {Object} models
       */
      associate(models) {
        DiscussionTopic.belongsTo(models.Article, {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
        DiscussionTopic.hasMany(models.DiscussionComment, {
          as: 'comments',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      },
      async createNew({ article, title, wikitext, ipAddress, author, transaction }) {
        const replacedText = await models.Wikitext.replaceOnSave({ ipAddress, author, wikitext });
        let isTransactionGiven = !!transaction;
        let t = transaction;
        if (!isTransactionGiven) {
          t = await sequelize.transaction();
        }
        try {
          const newTopic = await this.create({
            title: title.trim(),
            articleId: article.id,
          }, { transaction: t });
          await models.DiscussionComment.create({
            wikitext: replacedText,
            topicId: newTopic.id,
            authorId: author.id,
            ipAddress,
          }, { transaction: t });
          if (!isTransactionGiven) {
            await t.commit();
          }
          return newTopic;
        } catch (err) {
          if (!isTransactionGiven) {
            await t.rollback();
          }
          throw err;
        }
      }
    },
    instanceMethods: {
      async getFirstComment() {
        return models.DiscussionComment.findOne({
          where: {
            topicId: this.id,
          },
          order: [['id', 'ASC']],
          includes: [models.DiscussionComment.associations.author]
        });
      },
    },
  });
  return DiscussionTopic;
};
