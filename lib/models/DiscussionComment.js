'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');
const WikitextParser = require('../LibertyParser/src/Parser/WikitextParser');

class DiscussionComment extends LibertyModel {
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
      topicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wikitext: {
        type: DataTypes.TEXT('medium'),
        allowNull: false,
      },
      ipAddress: DataTypes.ipAddress(),
      status: {
        type: DataTypes.ENUM('PUBLIC', 'HIDDEN'),
        allowNull: false,
        defaultValue: 'PUBLIC',
      },
    };
  }
  static getOptions() {
    return {
      paranoid: true,
    };
  }
  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    this.belongsTo(models.DiscussionTopic, {
      as: 'topic',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    this.belongsTo(models.User, {
      as: 'author',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }

  async parseRender() {
    const parser = new WikitextParser();
    const renderResult = await parser.parseRender({ wikitext: this.wikitext });
    return renderResult;
  }

  // user must be loaded before.
  async getPublicObject() {
    const rendered = await this.parseRender();
    return {
      author: this.author ? this.author.username : null,
      ipAddress: this.author ? null : this.ipAddress,
      html: rendered.html,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static createNew({ topicId, wikitext, ipAddress, author, transaction }) {
    return this.autoTransaction(transaction, async (transaction) => {
      const replacedText = await models.Wikitext.replaceOnSave({
        ipAddress, author, wikitext,
      });
      await models.DiscussionComment.create({
        wikitext: replacedText,
        topicId,
        authorId: author.id,
        ipAddress,
      }, { transaction });
    });
  }
}

module.exports = DiscussionComment;
