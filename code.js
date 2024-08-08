const express = require("express");
const mysql = require("mysql2"); // Updated to mysql2

const app = express();

app.use(express.static("public"));
app.use(express.json());

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "keerthi@2004",
    database: "shorturls"
});

// con.connect(function(error) {
//     if (error) {
//         console.error("Database connection failed:", error);
//         return;  // Ensure you don't proceed if the connection fails
//     }
//     console.log("Connected to the database");
// });
con.connect(function(error) {
    if (error) {
        console.error("Database connection failed:", error);
        return;
    }
    console.log("Connected to the database");
});

app.get("/", function(request, response) {
    response.sendFile(__dirname + "/public/index.html");
});

app.post("/api/create-short-url", function(request, response) {
    let uniqueID = Math.random().toString(36).replace(/[^a-z0-9]/gi, '').substr(2, 10);
    let sql = `INSERT INTO links (longurl, shorturlid) VALUES ('${request.body.longurl}', '${uniqueID}')`;
    con.query(sql, function(error, result) {
        if (error) {
            console.error("Error inserting data:", error);
            response.status(500).json({
                status: "notok",
                message: "Something went wrong"
            });
        } else {
            response.status(200).json({
                status: "ok",
                shorturlid: uniqueID
            });
        }
    });
});

app.get("/api/get-all-short-urls", function(request, response) {
    let sql = `SELECT * FROM links`;
    con.query(sql, function(error, result) {
        if (error) {
            console.error("Error fetching data:", error);
            response.status(500).json({
                status: "notok",
                message: "Something went wrong"
            });
        } else {
            response.status(200).json(result);
        }
    });
});

// app.get("/:shorturlid", function(request, response) {
//     let shorturlid = request.params.shorturlid;
//     let sql = `SELECT * FROM links WHERE shorturlid='${shorturlid}' LIMIT 1`;
//     con.query(sql, function(error, result) {
//         if (error) {
//             console.error("Error fetching URL:", error);
//             response.status(500).json({
//                 status: "notok",
//                 message: "Something went wrong"
//             });
//         } else {
//             sql = `UPDATE links SET count=${result[0].count+1} WHERE id='${result[0].id}' LIMIT 1`;
//             con.query(sql, function(error, result2) {
//                 if (error) {
//                     console.error("Error updating count:", error);
//                     response.status(500).json({
//                         status: "notok",
//                         message: "Something went wrong"
//                     });
//                 } else {
//                     response.redirect(result[0].longurl);
//                 }
//             });
//         }
//     });
// });
app.get("/:shorturlid", function(request, response) {
    let shorturlid = request.params.shorturlid;
    let sql = `SELECT * FROM links WHERE shorturlid='${shorturlid}' LIMIT 1`;

    con.query(sql, function(error, result) {
        if (error) {
            console.error("Error fetching URL:", error);
            response.status(500).json({
                status: "notok",
                message: "Something went wrong"
            });
        } else {
            if (result.length === 0) {
                // No result found
                response.status(404).json({
                    status: "notok",
                    message: "Short URL not found"
                });
                return;
            }

            // Update the count
            let count = (result[0].count || 0) + 1;  // Handle case if count is undefined
            sql = `UPDATE links SET count=${count} WHERE id='${result[0].id}' LIMIT 1`;

            con.query(sql, function(error, result2) {
                if (error) {
                    console.error("Error updating count:", error);
                    response.status(500).json({
                        status: "notok",
                        message: "Something went wrong"
                    });
                } else {
                    // Redirect to the long URL
                    response.redirect(result[0].longurl);
                }
            });
        }
    });
});


app.listen(5000, function() {
    console.log("Server is running on port 5000");
});
