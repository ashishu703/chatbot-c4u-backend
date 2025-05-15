'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Testimonial extends Model {
    static associate(models) {
      // define associations if needed
    }
  }

  Testimonial.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    reviewer_name: DataTypes.STRING,
    reviewer_position: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Testimonial',
    tableName: 'testimonials',
    timestamps: true,        
  });

  return Testimonial;
};
