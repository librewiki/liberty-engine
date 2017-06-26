'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');
const CustomDataTypes = require('../src/CustomDataTypes');
const models = require('./');
const WikitextParser = require('../src/LibertyParser/src/Parser/WikitextParser');

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
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      topicId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      wikitext: {
        type: Sequelize.TEXT('medium'),
        allowNull: false,
      },
      ipAddress: CustomDataTypes.ipAddress(),
      status: {
        type: Sequelize.ENUM('PUBLIC', 'HIDDEN'),
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
}

module.exports = DiscussionComment;
