const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const data = require("./modules/collegeData.js");

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

// Set up handlebars engine
app.engine('.hbs', exphbs.engine({ 
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }        
    }
}));

app.set('view engine', '.hbs');

// Serve static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Middleware to set active route
app.use(function(req, res, next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});

// Define routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/htmlDemo", (req, res) => {
    res.render("htmlDemo");
});

app.get("/students", (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(req.query.course).then((students) => {
            res.render("students", { students });
        }).catch((err) => {
            res.render("students", { message: "no results" });
        });
    } else {
        data.getAllStudents().then((students) => {
            res.render("students", { students });
        }).catch((err) => {
            res.render("students", { message: "no results" });
        });
    }
});

app.get("/students/add", (req, res) => {
    res.render("addStudent");
});

app.post("/students/add", (req, res) => {
    data.addStudent(req.body).then(() => {
        res.redirect("/students");
    });
});

app.get("/student/:studentNum", (req, res) => {
    data.getStudentByNum(req.params.studentNum).then((student) => {
        res.render("student", { student }); 
    }).catch((err) => {
        res.render("student", { message: "no results" });
    });
});

app.post("/student/update", (req, res) => {
    data.updateStudent(req.body).then(() => {
        res.redirect("/students");
    });
});

app.get("/courses", (req, res) => {
    data.getCourses().then((courses) => {
        res.render("courses", { courses });
    }).catch((err) => {
        res.render("courses", { message: "no results" });
    });
});

app.get("/course/:id", (req, res) => {
    data.getCourseById(req.params.id).then((course) => {
        res.render("course", { course }); 
    }).catch((err) => {
        res.render("course", { message: "no results" });
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize data and start server
data.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server listening on port ${HTTP_PORT}`);
    });
}).catch((err) => {
    console.log("Unable to start server: " + err);
});
