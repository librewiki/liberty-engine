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
      hiderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
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
    this.belongsTo(models.User, {
      as: 'hider',
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
    const html = this.status === 'PUBLIC' ? (await this.parseRender()).html : null;
    return {
      id: this.id,
      status: this.status,
      authorName: this.author ? this.author.username : null,
      ipAddress: this.author ? null : this.ipAddress,
      html,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      hiderName: this.hider ? this.hider.username : null,
    };
  }

  static createNew({
    topic, wikitext, ipAddress, author, transaction,
  }) {
    return this.autoTransaction(transaction, async (transaction) => {
      const replacedText = await models.Wikitext.replaceOnSave({
        ipAddress, author, wikitext,
      });
      await models.DiscussionComment.create({
        wikitext: replacedText,
        topicId: topic.id,
        authorId: author.id,
        ipAddress,
      }, { transaction });
      await models.DiscussionTopic.update(
        {
          updatedAt: this.sequelize.fn('NOW'),
        },
        {
          where: {
            id: topic.id,
          },
          transaction,
        },
      );
    });
  }

  hide({ hider, transaction } = {}) {
    return this.autoTransaction(transaction, async (transaction) => {
      await this.update(
        {
          status: 'HIDDEN',
          hiderId: hider.id,
        },
        {
          transaction,
        },
      );
    });
  }

  unhide({ transaction } = {}) {
    return this.autoTransaction(transaction, async (transaction) => {
      await this.update(
        {
          status: 'PUBLIC',
          hiderId: null,
        },
        {
          transaction,
        },
      );
    });
  }
}

module.exports = DiscussionComment;
