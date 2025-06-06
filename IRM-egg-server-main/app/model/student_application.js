'use strict';

module.exports = app => {
  const { STRING, INTEGER, ENUM, DATE, TEXT } = app.Sequelize;

  const StudentApplication = app.model.define(
    'student_application',
    {
      application_id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      app_user_id: { type: INTEGER, allowNull: false },

      name: STRING(255),
      wintec_id: STRING(20),
      gender: ENUM('Male', 'Female'),
      student_type: ENUM('Domestic Student', 'International Student'),
      personal_email: STRING(255),
      student_email: STRING(255),
      phone_number: STRING(255),
      personal_statement: TEXT,
      cv_link: STRING(255),
      linkedin_link: STRING(255),
      portfolio_link: STRING(255),
      github_link: STRING(255),
      average_grade: STRING(10),
      programme_of_study: STRING(255),
      area_of_study: STRING(255),

      internship_options: TEXT, // stored as JSON string
      preferred_companies: TEXT, // stored as JSON string
      first_preference: STRING(255),
      second_preference: STRING(255),

      skills: TEXT,
      favourite_courses: TEXT,
      reference: STRING(255),

      submission_date: { type: DATE, defaultValue: app.Sequelize.NOW },
      review_status: STRING(50),
      interview_readiness: ENUM('TRUE', 'FALSE'),
      app_status: INTEGER,
      intern_status: INTEGER,
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return StudentApplication;
};
