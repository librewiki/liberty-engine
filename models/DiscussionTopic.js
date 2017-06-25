'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class DiscussionTopic extends LibertyModel {
  static init(sequelize) {
    super.init({
      /**
       * Primary key.
       *
       * @property id
       * @type Number
       */
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      articleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'PAUSED', 'CLOSED'),
        allowNull: false,
        defaultValue: 'OPEN',
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: 'discussionTopic',
    });
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
    });
  }

  static createNew({
    article, title, wikitext, ipAddress, author, transaction,
  }) {
    return this.autoTransaction(transaction, async (transaction) => {
      const replacedText = await models.Wikitext.replaceOnSave({ ipAddress, author, wikitext });
      const newTopic = await this.create({
        title: title.trim(),
        articleId: article.id,
      }, { transaction });
      await models.DiscussionComment.create({
        wikitext: replacedText,
        topicId: newTopic.id,
        authorId: author.id,
        ipAddress,
      }, { transaction });
      return newTopic;
    });
  }

  async getFirstComment() {
    return models.DiscussionComment.findOne({
      where: {
        topicId: this.id,
      },
      order: [['id', 'ASC']],
      includes: [models.DiscussionComment.associations.author],
    });
  }
}

module.exports = DiscussionTopic;
