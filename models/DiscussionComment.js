/**
 * Provides DiscussionComment model.
 *
 * @module models
 * @submodule DiscussionComment
 */

'use strict';

const CustomDataTypes = require('../src/CustomDataTypes');
const WikitextParser = require(global.rootdir + '/src/LibertyParser/src/Parser/WikitextParser');

/**
 * Model representing topic of discussion.
 *
 * @class DiscussionComment
 */
module.exports = function(sequelize, DataTypes) {
  const DiscussionComment = sequelize.define('discussionComment', {
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
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    wikitext: {
      type: DataTypes.TEXT('medium'),
      allowNull: false
    },
    ipAddress: CustomDataTypes.ipAddress(),
    status: {
      type: DataTypes.ENUM('PUBLIC', 'HIDDEN'),
      allowNull: false,
      defaultValue: 'PUBLIC',
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
        DiscussionComment.belongsTo(models.DiscussionTopic, {
          as: 'topic',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
        DiscussionComment.belongsTo(models.User, {
          as: 'author',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      }
    },
    instanceMethods: {
      async parseRender() {
        const parser = new WikitextParser();
        const renderResult = await parser.parseRender({ wikitext: this.wikitext });
        return renderResult;
      },
    },
  });
  return DiscussionComment;
};
