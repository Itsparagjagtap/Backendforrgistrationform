const express = require("express");
const mysql = require("mysql");
const bodyparser = require("body-parser");
const res = require("express/lib/response");
const app = express();

const port = 3001;
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.set("view engine", "ejs");

//1) get root page
app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});

// for connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "forpst",
});

connection.connect(function (err) {
  if (err) throw err;

  console.log("connected");
});

// create user or signup

// app.post("/submit", function (req, res) {
//   var sql = `insert into members (fname,lname,email,mobile,pass,about) values("${req.body.fname}","${req.body.lname}","${req.body.email}","${req.body.mobile}","${req.body.pass}","${req.body.about}")`;

//   connection.query(sql, (err) => {
//     if (err) throw err;
//     res.json({
//       title: "data saved ",
//       message: "Hello new data shown here!",
//       //   console.log(req,body);
//     });
//   });
// });

// 2) for only admin can add user
app.post("/user", function (req, res) {
  console.log(req.headers);

  const loggedinuserid = parseInt(req.headers["loggedinuserid"]);

  // Getadmin details
  var sql = `select * from members order by id limit 1`;
  connection.query(sql, function (error, result) {
    if (error) console.log(error);
    console.log(result);
    if (result.length !== 0) {
      if (result[0].id !== loggedinuserid) {
        res.json({
          error: true,
          message: "Access restricte, allowed to admin only",
        });
      }
    } else {
      var sql = `insert into members (fname,lname,email,mobile,pass,about) values("${req.body.fname}","${req.body.lname}","${req.body.email}","${req.body.mobile}","${req.body.pass}","${req.body.about}")`;

      connection.query(sql, function (err, result) {
        console.log("spdsdn", result);
        if (err) console.log(err);
        res.json({
          title: "data saved ",
          message: "Hello new data shown here!",
          //   console.log(req,body);
        });
      });
    }
  });
});

//3)  only admin can see all users data
app.get("/users", function (req, res) {
  console.log(req.headers);

  const loggedinuserid = parseInt(req.headers["loggedinuserid"]);

  // Getadmin details
  var sql = "select * from members order by id limit 1";
  connection.query(sql, function (error, result) {
    if (error) console.log(error);
    console.log(result);
    if (result[0].id !== loggedinuserid) {
      res.json({
        error: true,
        message: "Access restricte, allowed to admin only",
      });
    } else {
      var sql = "select * from members";
      connection.query(sql, function (error, result) {
        if (error) console.log(error);
        res.json({ data: result });
      });
    }
  });
});

// app.get("/users/:id", function (req, res) {
//   admin();
// });

//5) get user information using id as parameter
app.get("/users/:id", function (req, res) {
  //declare header
  const loggedinuserid = parseInt(req.headers["loggedinuserid"]);

  //check whether user is admin or not
  if (loggedinuserid == req.params.id) {
    var sql = `select * from members where id=${req.params.id}`;
    connection.query(sql, function (error, result) {
      if (error) console.log(error);
      console.log(result);
      res.json({ data: result });
    });
  } else {
    res.json({
      error: true,
      message: "Access restricte,",
    });
  }
});

// 6) for showing admin record
app.get("/admin", function (req, res) {
  var sql = `select * from members order by id limit 1`;
  connection.query(sql, function (error, result) {
    if (error) console.log(error);
    console.log(result);
    res.render("users", { data: result });
  });
});

// 7)  for delete record
app.delete("/delete:id", function (req, res) {
  var sql = "delete from members where id=?";
  let id = req.query.id;
  connection.query(sql, [id], function (error, result) {
    if (error) console.log(error);
    console.log(result);
    // res.redirect("/users");
  });
});

// to update records to get data

//8)  update user record
app.put("/update/:id", function (req, res) {
  let fname = req.body.fname;
  let lname = req.body.lname;
  let email = req.body.email;
  let pass = req.body.pass;
  let mobile = req.body.mobile;
  let about = req.body.about;
  let id = req.params.id;

  let sql =
    "update members set fname=?,lname=?,email=?,mobile=?,pass=?,about=?  where id=?";
  connection.query(
    sql,
    [fname, lname, email, mobile, pass, about, id],
    function (err, result) {
      if (err) throw err;

      res.json({
        error: false,
        message: "update success",
      });
    }
  );
});

//for login

// app.post("/login", (req, res) => {
//   let pass = req.body.pass;
//   let email = req.body.email;
//   let sql = "select * from members where pass = ? and email = ?";
//   connection.query(sql, [pass, email], function (err, result) {
//     if (err) throw err;
//     console.log("pradaaaa", result);
//     if (result.length == 0) {
//       res.json({
//         error: true,
//         message: "invalid credintials",
//       });
//     } else {
//       res.json({ data: result });
//     }

//   });
// });

//  9) for login and check whether loogedin user is admin or not
app.post("/login", (req, res) => {
  let pass = req.body.pass;
  let email = req.body.email;
  let sql = "select * from members where pass = ? and email = ?";
  connection.query(sql, [pass, email], function (err, result) {
    if (err) throw err;
    console.log("pradaaaa", result);
    if (result.length == 0) {
      res.json({
        error: true,
        message: "invalid credintials",
      });
    } else {
      result[0]["admin"] = false;

      // if current  user is admin make above flag true
      // 1 -  get current user id from result
      const currentuserid = result[0].id;
      // 2 - get admin id from db
      var sql = `select * from members order by id limit 1`;
      connection.query(sql, function (error1, result1) {
        if (error1) console.log(error1);
        console.log("myadmin", result1);
        console.log(result1[0].id);
        const adminuserid = result1[0].id;
        if (currentuserid == adminuserid) {
          result[0]["admin"] = true;
        }
        console.log("step1", result);
        res.json({ data: result });
      });

      //*********************************** */
      ////for backup
      // app.post("/login", (req, res) => {
      //   let pass = req.body.pass;
      //   let email = req.body.email;
      //   let sql = "select * from members where pass = ? and email = ?";
      //   connection.query(sql, [pass, email], function (err, result) {
      //     if (err) throw err;
      //     console.log("pradaaaa", result);
      //     if (result.length == 0) {
      //       res.json({
      //         error: true,
      //         message: "invalid credintials",
      //       });
      //     } else {
      //       result[0]["admin"] = false;

      //       // if current  user is admin make above flag true
      //       // 1 -  get current user id from result
      //       const currentuserid = result[0].id;
      //       // 2 - get admin id from db
      //       var sql = `select * from members order by id limit 1`;
      //       connection.query(sql, function (error1, result1) {
      //         if (error1) console.log(error1);
      //         console.log("myadmin", result1);
      //         console.log(result1[0].id);
      //         const adminuserid = result1[0].id;
      //         if (currentuserid == adminuserid) {
      //           result[0]["admin"] = true;
      //         }
      //         console.log("step1", result);
      //         res.json({ data: result });
      //       });

      // 3 compare current user id and admin id

      // console.log(result[0].id);

      // 4 -  if equal then make flag true
      // console.log("step2", result);
    }
  });
});

//listening  port
app.listen(port, () => {
  console.log(`Example App listening on port ${port}`);
});
