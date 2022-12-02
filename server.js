/*********************************************************************************
 * WEB700 – Assignment 06
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
 * assignment has been copied manually or electronically from any other source (including web sites) or
 * distributed to other students.
 *
 * Name: Feiliang Zhou Student ID: 102661220 Date: December 1, 2022
 *
 * Online (Cyclic) Link:
 *
 ********************************************************************************/
const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require("path");
const exphbs = require("express-handlebars");

const db = require("./modules/collegeData");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute
            ? ' class="nav-item active"'
            : ' class="nav-item"') +
          '><a class="nav-link" href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3) {
          throw new Error("handlebars Helper equal needs 2 parameters");
        }
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);

app.set("view engine", ".hbs");

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo");
});

app.get("/students/add", (req, res) => {
  db.getCourses()
    .then((data) => {
      res.render("addStudent", { courses: data });
    })
    .catch((err) => {
      res.render("addStudent", { courses: [] });
    });
});

app.get("/students", function (req, res) {
  if (req.query.course != undefined) {
    db.getStudentsByCourse(req.query.course)
      .then((studnetsByCourse) => {
        res.render("students", {
          students: studnetsByCourse,
        });
      })
      .catch((err) => {
        res.render("students", {
          message: "no results",
        });
      });
  } else {
    db.getAllStudents()
      .then((data) => {
        if (data.length > 0) {
          res.render("students", {
            students: data,
          });
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render({
          message: "no results",
        });
      });
  }
});

app.post("/students/add", (req, res) => {
  req.body.TA = req.body.TA ? true : false;
  req.body.status = req.body.status ? req.body.status : "Full Time";

  db.addStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.get("/courses", (req, res) => {
  db.getCourses()
    .then((data) => {
      if (data.length > 0) {
        res.render("courses", {
          courses: data,
        });
      } else {
        res.render("courses", {
          message: "no results",
        });
      }
    })
    .catch((err) => {
      res.render({ message: "no results" });
    });
});

app.get("/courses/add", (req, res) => {
  res.render("addCourse");
});

app.post("/courses/add", (req, res) => {
  db.addCourse(req.body)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((err) => {
      res.json({ message: "add new course failed" });
    });
});

app.post("/course/update", (req, res) => {
  db.updateCourse(req.body)
    .then((data) => {
      res.redirect("/courses");
    })
    .catch((err) => {
      res.json({ message: "update course failed" });
    });
});

app.get("/course/:id", (req, res) => {
  db.getCourseById(req.params.id)
    .then((data) => {
      if (data != undefined) {
        res.render("course", {
          course: data,
        });
      } else {
        res.status(404).send("Course Not Found");
      }
    })
    .catch((err) => {
      res.render("course", { message: "${err}" });
    });
});

app.get("/course/delete/:id", (req, res) => {
  db.deleteCourseById(req.params.id)
    .then((data) => {
      res.redirect("/courses");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Course / Course not found)");
    });
});

// app.get("/student/:num", (req, res) => {
//   db.getStudentByNum(req.params.num)
//     .then((data) => {
//       res.render("student", {
//         student: data,
//       });
//     })
//     .catch((err) => {
//       res.render("student", { message: "no results" });
//     });
// });

app.get("/student/:studentNum", (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};
  db.getStudentByNum(req.params.studentNum)
    .then((data) => {
      if (data) {
        viewData.student = data; //store student data in the "viewData" object as "student"
      } else {
        viewData.student = null; // set student to null if none were returned
      }
    })
    .catch(() => {
      viewData.student = null; // set student to null if there was an error
    })
    .then(db.getCourses)
    .then((data) => {
      viewData.courses = data; // store course data in the "viewData" object as "courses"
      // loop through viewData.courses and once we have found the courseId that matches
      // the student's "course" value, add a "selected" property to the matching
      // viewData.courses object
      for (let i = 0; i < viewData.courses.length; i++) {
        if (viewData.courses[i].courseId == viewData.student.course) {
          viewData.courses[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.courses = []; // set courses to empty if there was an error
    })
    .then(() => {
      if (viewData.student == null) {
        // if no student - return an error
        res.status(404).send("Student Not Found");
      } else {
        console.log("zhou________");
        console.log(viewData);
        console.log("zhou________");
        res.render("student", { viewData: viewData }); // render the "student" view
      }
    });
});

app.post("/student/update", (req, res) => {
  req.body.TA = req.body.TA ? true : false;
  // console.log(req.body);

  db.updateStudent(req.body)
    .then((data) => {
      res.redirect("/students");
    })
    .catch((err) => {
      res.json({ message: "update student failed" });
    });
});

app.get("/students/delete/:studentNum", (req, res) => {
  db.deleteStudentByNum(req.params.studentNum)
    .then((data) => {
      res.redirect("/students");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Student / Student not found)");
    });
});

app.use((req, res, next) => {
  res.status(404).send("Page Not Found");
});

db.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Express http server listening on: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.log("db is not loaded successfully: " + err.message);
  });
