'use strict';
const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = (sequelize) => {
    class Book extends Sequelize.Model {
        publishedAt() {
            const date = moment(this.createdAt).format('MMMM D, YYYY, h:mma');
            return date;
        }

    }

    Book.init({
        title: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: '"Title" is required'
                }
            }
        },
        author: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: '"Author" is required'
                }
            }
        },
        genre: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: '"Genre" is required'
                }
            }
        },
        year: {
            type: Sequelize.INTEGER,
            isNumeric: true, //year input must be a number
            validate: {
                notEmpty: {
                    msg: '"Year" is required'
                },
                isNumeric: {
                    msg:'"Year" must be a number' 
                }
            }
        } 
    },  { sequelize });

    return Book;
}