const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "izvzzwgw",
  "izvzzwgw",
  "j4TaTCbhgxapBnSL2jWGfsqgMyM8n2Ja",
  {
    host: "peanut.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

var Student = sequelize.define("Student", {
  studentNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressProvince: Sequelize.STRING,
  TA: Sequelize.BOOLEAN,
  status: Sequelize.STRING,
});

var Course = sequelize.define("Course", {
  courseId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courseCode: Sequelize.STRING,
  courseDescription: Sequelize.STRING,
});

Course.hasMany(Student, { foreignKey: "course" });

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(function () {
        resolve("database synchronized successfully!");
      })
      .catch(function (error) {
        reject("unable to sync the database");
      });
  });
};

module.exports.getAllStudents = function () {
  return new Promise((resolve, reject) => {
    Student.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getStudentsByCourse = (course) => {
  return new Promise((resolve, reject) => {
    Student.findAll({
      where: {
        course: course,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getStudentByNum = (num) => {
  return new Promise((resolve, reject) => {
    Student.findAll({
      where: {
        studentNum: num,
      },
    })
      .then((data) => {
        resolve(data[0]);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getCourses = function () {
  return new Promise((resolve, reject) => {
    Course.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.getCourseById = function (id) {
  return new Promise((resolve, reject) => {
    Course.findAll({
      where: {
        courseId: id,
      },
    })
      .then((data) => {
        resolve(data[0]);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

module.exports.addStudent = function (studentData) {
  return new Promise((resolve, reject) => {
    studentData.TA = studentData.TA ? true : false;
    for (prop in studentData) {
      if (prop == "" && prop != TA) {
        studentData.prop = null;
      }
    }
    Student.create(studentData)
      .then((newStudent) => {
        resolve(newStudent);
      })
      .catch((err) => {
        reject("unable to create student");
      });
  });
};

module.exports.updateStudent = (studentNum, studentData) => {
  return new Promise((resolve, reject) => {
    studentData.TA = studentData.TA ? true : false;
    for (prop in studentData) {
      if (prop == "" && prop != TA) {
        studentData.prop = null;
      }
    }
    studentNum = Number(studentNum);
    delete studentData.studentNum;

    Student.update(studentData, {
      where: {
        studentNum: Number(studentNum),
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("unable to update student");
      });
  });
};

module.exports.addCourse = function (courseData) {
  return new Promise((resolve, reject) => {
    for (prop in courseData) {
      if (prop == "") {
        courseData.prop = null;
      }
    }
    Course.create(courseData)
      .then((newCourse) => {
        resolve(newCourse);
      })
      .catch((err) => {
        reject("unable to create course");
      });
  });
};

module.exports.updateCourse = (courseId, courseData) => {
  return new Promise((resolve, reject) => {
    for (prop in courseData) {
      if (prop == "") {
        courseData.prop = null;
      }
    }

    Course.update(courseData, {
      where: {
        courseId: courseId,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("unable to update course");
      });
  });
};

module.exports.deleteCourseById = (courseId) => {
  return new Promise((resolve, reject) => {
    Course.destroy({
      where: {
        courseId: courseId,
      },
    })
      .then(() => {
        resolve("destroyed");
      })
      .catch((err) => {
        reject("unable to delete course");
      });
  });
};

module.exports.deleteStudentByNum = (studentNum) => {
  return new Promise((resolve, reject) => {
    Student.destroy({
      where: {
        studentNum: studentNum,
      },
    })
      .then(() => {
        resolve("destroyed");
      })
      .catch((err) => {
        reject("unable to delete student");
      });
  });
};
