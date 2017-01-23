var express = require("express");
var path = require("path");
var sessions = require("express-session");
var bodyparser = require("body-parser");
var http = require("http");
var querystring = require("querystring");
var app = express();
var jsonServer = require("json-server");
var url = require("url");
var fs = require("fs");
var formidable = require("formidable");
var request = require("request");
var database = jsonServer.create();
var util = require("util");
app.set("views", "./views");
app.set('view engine', "jade");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(sessions({
    secret: "ghdfhj4u5k45u4li4hg5nm:klopl54g4f",
    resave: true
}));
var databasePort = 8997;
var baseUrl = "http://localhost:" + databasePort + "/";

app.get("/createprestation", function(req, res) {
    res.render("createprestation");
})

app.get("/createoffer", function(req, res) {
    res.render("CreateOffer");
});
app.post("/createoffer", function(req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "/public/uploads");
    form.parse(req, function(err, fields, files) {
        var file = files.photo;
        var name = "offer" + Date.now() + "." + file.type.split("/")[1];
        fs.rename(file.path, path.join(form.uploadDir, name));
        var obj = {};
        obj.quantity = fields.quantity;
        obj.unitPrice = fields.unitPrice;
        obj.chickenKind = fields.chickenKind;
        obj.size = fields.size;
        obj.imageLink = "/uploads/" + name;
        obj.PublicationDate = new Date().toLocaleDateString();
        obj.description = fields.description;
        if (req.session.uniqueID) {
            obj.userId = req.session.userId
        } else {
            obj.userId = 1;
        }
        request({
            url: baseUrl + "offers",
            method: 'POST',
            form: obj
        }, function(error, resp, body) {
            if (error) {
                console.log(error);
                res.json(false);
            } else {
                var reductions = JSON.parse(fields.reductions);
                var offerId = JSON.parse(body).id
                for (var i = 0; i < reductions.length; i++) {
                    reductions[i].offerId = offerId;
                    request({
                        url: baseUrl + "reductions",
                        method: "POST",
                        form: reductions[i],
                        "Content-Type": "application/json"
                    }, function(error, resp, body) {
                        if (error) {
                            console.log("Erreur", error);
                            return;
                        }
                    })
                }
                var prestations = fields.prestations.split(",");
                for (var i = 0; i < prestations.length; i++) {
                    var obj = {
                        "offerId": offerId,
                        "prestationId": prestations[i]
                    };
                    request({
                        url: baseUrl + "bindprestoffer",
                        method: 'POST',
                        form: obj
                    }, function(error, response, body) {
                        if (error) {
                            console.log("Erreur", error);
                            return;
                        }
                    })
                }
                res.json(offerId);
            }

        });
    });
})
app.get("/allprestation", function(req, res) {

    request.get(baseUrl + "prestations", function(error, response, body) {
        if (error) {
            console.log("Erreur", error);
            return;
        }
        res.json(JSON.parse(body));
    })
})

app.post("/createprestation", function(req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "/public/uploads");
    form.parse(req, function(err, fields, files) {
        var file = files.photo;
        var name = "prestation" + Date.now() + "." + file.type.split("/")[1];
        fs.rename(file.path, path.join(form.uploadDir, name));
        var obj = {};
        obj.name = fields.name;
        obj.Unitprice = fields.Unitprice;
        obj.time = fields.time;
        obj.imageLink = "/uploads/" + name;
        obj.creation_date = new Date().toLocaleDateString();
        request({
            url: baseUrl + "prestations",
            method: 'POST',
            form: obj,
        }, function(error, resp, body) {
            if (error) {
                console.log(error);
                res.json(false);
            } else {
                res.json(body);
            }
        });
    });
})

//récupération des prestations d'une offre
app.get("/prestoffer/:id", function(req, res) {
    var url = baseUrl + "bindprestoffer?offerId=" + req.params.id;
    request.get(url, function(error, response, body) {
        if (error) {
            return console.log('Error:', error);
        }
        var prestation = JSON.parse(body);
        OfferData.prestations = prestations;
        res.json(OfferData);
    })
});
// creer une offre
app.get("/createoffer", function(req, res) {
    res.render("CreateOffer");
})
// photo de profil
app.get("/avatar", function(req, res) {
    if (req.session.uniqueID) {
        res.sendFile(req.session.clientID + ".jpg", {
            root: path.join(__dirname, "/avatar")
        });
    } else {
        res.send("Error");
    }
})
app.get("/avatar/:id", function(req, res) {
    res.sendFile(req.params.id + ".jpg", {
        root: path.join(__dirname, "/avatar")
    });
});


// Modification des Demandes
app.patch("/service/myDemands/:id", function(req, response) {
    if (!req.session.uniqueID) {
        response.setHeader("Content-Type", "application/json");
        response.json(false);
        return;
    }
    var data = {};
    data.chickenKind = req.body.chickenKind;
    data.size = req.body.size;
    data.quantity = req.body.quantity;
    data = querystring.stringify(data);
    var options = {
        host: 'localhost',
        port: 8997,
        path: "/requests/" + req.params.id,
        method: 'patch',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(data),
        },
    };
    var request = http.request(options, function(res) {
        var body = '';
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
            body += chunk;
        });
        res.on("end", function() {
            response.send(JSON.parse(body));
        });
    });
    request.write(data);
    request.end();
});


// Sauvegarde des données
app.post("/service/:val", function(req, response) {
    if (!req.session.uniqueID) {
        response.setHeader("Content-Type", "application/json");
        response.json(false);
        return;
    }
    if (req.params.val == "myDemands") {
        var data = {};
        data.chickenKind = req.body.chickenKind;
        data.size = req.body.size;
        data.quantity = req.body.quantity;
        data.userId = req.session.clientID;
        data.publicationDate = new Date().toLocaleString();
        data = querystring.stringify(data);
        var options = {
            host: 'localhost',
            port: 8997,
            path: "/requests",
            method: 'post',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(data),
            },
        };
        var reque = http.request(options, function(res) {
            var body = '';
            res.setEncoding("utf8");
            res.on("data", function(chunk) {
                body += chunk;
            });
            res.on("end", function() {
                response.send(JSON.parse(body));
            });
        });
        reque.write(data);
        reque.end();
    }
    if (req.params.val == "commands") {
        request.get(baseUrl + "reductions?offerId=" + req.body.offerId, function(error, respons, body) {
            if (error) {
                return console.log('Error:', error);
            }
            var reductions = JSON.parse(body);
            request(baseUrl + "offers/" + req.body.offerId, function(error, respons, body) {
                var obj = JSON.parse(body);
                var uprice = obj.unitPrice;
                var kind = obj.chickenKind;
                var red = 0;
                redid = null;
                for (var i = 0; i < reductions.length; i++) {
                    if (reductions[i].quantity <= req.body.quantity) {
                        red = reductions[i].rate;
                        redid = i;
                    }
                }
                var price = (100 - red) * req.body.quantity * uprice / 100;
                var prestation = 0;
                var pt = price;
                var state = false;
                var prestname = "Aucune"
                request.get(baseUrl + "prestations/" + req.body.prestationId, function(error, respons, body) {
                    var resp = JSON.parse(body);
                    if (resp) {
                        prestation = resp.Unitprice;
                        prestname = resp.name;
                        pt = price + prestation * req.body.quantity;
                    }
                    var data = {
                        chickenKind: kind,
                        Prestationname: prestname,
                        reduction: red,
                        unitPrice: uprice,
                        reductionId: redid,
                        "prestation": prestation,
                        tprice: pt,
                        userId: req.session.clientID,
                        quantity: req.body.quantity,
                        offerId: req.body.offerId,
                        validate: state
                    };
                    if (req.body.prestationId != null) {
                        data.prestationId = req.body.prestationId
                    }
                    request({
                        url: 'http://localhost:8997/commands',
                        method: 'POST',
                        form: data
                    }, function(error, resp, body) {
                        if (error) {
                            console.log(error);
                            response.json(false);
                        } else {
                            response.json(body);
                        }
                    });
                })
            })
        })
    }
});


//Suppression des Données
app.delete("/service/myDemands/:id", function(req, res) {
    if (!req.session.uniqueID) {
        res.setHeader("Content-Type", "application/json");
        res.json(false);
        return;
    }
    request.del("http://localhost:8997/requests/" + req.params.id, function(error, response, body) {
        if (error) {
            console.log(error);
        } else {
            res.json(true);
        }
    });

});

// Validation d'une commande
app.post("/validatecommand/:id", function(req, res) {
    if (!req.session.uniqueID) {
        res.json(false);
        return;
    }
    request.get(baseUrl + 'pouletmoney/' + req.session.clientID,
        function(error, response, body) {
            if (error) {
                console.log(error);
            } else {
                var money = JSON.parse(body).solde;
                request({
                    url: baseUrl + 'commands',
                    qs: {
                        id: req.params.id,
                        userId: req.session.clientID
                    },
                    method: 'GET'
                }, function(error, response, body) {
                    if (error) {
                        console.log(error);
                    } else {
                        var data = JSON.parse(body)[0];
                        var topay = data.tprice;
                        var offerid = data.offerId;
                        var quantity = data.quantity;
                        if (topay > money) {
                            res.json({
                                solde: false
                            });
                            return;
                        }
                        request({
                            headers: {
                                'content-type': 'application/json',
                            },
                            url: baseUrl + 'commands/' + req.params.id,
                            method: 'PATCH',
                            body: {
                                validate: 'true',
                            },
                            json:true
                        }, function(error, response, body) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(body);
                                request.get(baseUrl + "offers/" + offerid, function(error, reponse, body) {
                                    var basequantity = JSON.parse(body).quantity;
                                    if (basequantity < quantity) {
                                        res.json({
                                            quantity: false
                                        });
                                        return;
                                    }
                                    request({
                                        headers: {
                                            'content-type': 'application/json',
                                        },
                                        url: baseUrl + 'offers/' + offerid,
                                        method: 'PATCH',
                                        body: {
                                            quantity: (basequantity - quantity),
                                        },
                                        json:true
                                    }, function(error, response, body) {
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log(body);
                                            request({
                                                headers: {
                                                    'content-type': 'application/json',
                                                },
                                                url: baseUrl + 'pouletmoney/'+req.session.clientID,
                                                method: 'PATCH',
                                                body: {
                                                    solde: (money - topay),
                                                },
                                                json:true
                                            }, function(error, response, body) {
                                                if (error) {
                                                    console.log(error);
                                                } else {
                                                    console.log(body);
                                                    res.json(true);
                                                    console.log("commande validée");
                                                }
                                            })
                                        }
                                    })
                                })


                            }
                        })
                    }

                })
            }
        })
});



//Envoie des Données
app.get("/service/:val", function(req, res) {
    if (!req.session.uniqueID) {
        res.setHeader("Content-Type", "application/json");
        res.json(false);
        return;
    }
    if (req.params.val == "myDemands") {
        var url = "http://localhost:8997/requests?userId=" + req.session.clientID;
        http.get(url, function(response) {
            var body = '';
            response.setEncoding("utf8");
            response.on("data", function(chunk) {
                body += chunk;
            });
            response.on("end", function() {
                var requests = JSON.parse(body);
                res.setHeader("Content-Type", "application/json");
                res.send(JSON.stringify(requests));
            });
        });
    }
});

app.get("/solde",function(req,res){
    request.get(baseUrl+"pouletmoney/"+req.session.clientID,function(error,resp,body){
        res.json({solde:JSON.parse(body).solde});
    })
})
// Enregistrer un Commentaire
app.post("/comments", function(req, res) {
    if (!req.session.uniqueID) {
        res.setHeader("Content-Type", "application/json");
        res.json(false);
        return;
    }
    request({
        url: baseUrl + "comments",
        method: 'POST',
        form: {
            userId: req.session.clientID,
            comment: req.body.comment,
            offerId: req.body.offerId,
            date: new Date().toLocaleDateString()
        }
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(false);
        } else {
            res.json(body);
        }
    });
});

// Enregistrer une Question
app.post("/questions", function(req, res) {
    if (!req.session.uniqueID) {
        res.setHeader("Content-Type", "application/json");
        res.json(false);
        return;
    }
    request({
        url: baseUrl + "questions",
        method: 'POST',
        form: {
            userId: req.session.clientID,
            question: req.body.question,
            offerId: req.body.offerId,
            date: new Date().toLocaleDateString()
        }
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(false);
        } else {
            res.json(body);
        }
    });
});
app.get("/content/pouletmoney",function(req,res){
    res.sendFile("compte.html", {
        root: path.join(__dirname, "/views")
    })
})
// Contenu Utilisateur Connecté
app.get("/content/demand", function(req, res) {
    res.sendFile("demandLayout.html", {
        root: path.join(__dirname, "/views")
    })
});
app.get("/content/command", function(req, res) {
    res.sendFile("mycommands.html", {
        root: path.join(__dirname, "/views")
    })
});

app.delete("/commands/:id", function(req, res) {
    if (!req.session.uniqueID) {
        res.json(false);
        return;
    }
    request.delete(baseUrl + "commands/" + req.params.id, function(error, response, body) {
        res.json(JSON.parse(body));
    })
})
app.get("/commands", function(req, res) {
    if (!req.session.uniqueID) {
        res.json(false);
        return;
    }
    request.get(baseUrl + "commands?userId=" + req.session.clientID, function(error, response, body) {
        if (error) {
            console.log("Erreur", error);
            return;
        }
        var commands = JSON.parse(body);
        res.json(commands);
        console.log(commands);

    })
})


// Verification des informations de connexion
app.post("/checklog", function(req, resp) {
    var url = "http://localhost:8997/users?email=" + req.body.email;
    http.get(url, function(res) {
        var body = '';
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
            body += chunk;
        });
        res.on("end", function() {
            var client = JSON.parse(body)[0];
            if ((client != null) && (req.body.email == client.email) && (req.body.passwd.localeCompare(client.password) == 0)) {
                req.session.uniqueID = req.body.email;
                req.session.clientID = client.id;
            }
            resp.redirect("/connection");
        });
    });
});


// Enregistrement d'un Utilisateur
app.post("/signin", function(req, res) {
    var data = {};
    data.name = req.body.name;
    data.surname = req.body.surname;
    data.email = req.body.email;
    data.password = req.body.password;
    data.phone = req.body.phone;
    data.address = {};
    data.city = req.body.city;
    data.district = req.body.district;
    data.sector = req.body.sector;
    data.register_date = new Date().toLocaleString();
    data = querystring.stringify(data);
    var options = {
        host: 'localhost',
        port: 8997,
        path: "/users",
        method: 'post',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(data),
        },
    };
    var request = http.request(options, function(res) {
        var body = '';
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
            body += chunk;
        });
        res.on("end", function() {});
    });
    request.write(data);
    request.end();
    res.redirect("/login");
});




app.get("/infoOffers", function(req, res) {
    var obj = {
        Limit: 15,
        records: 100
    };
})

app.get("/allOffers", function(req, res) {
    var admins;
    var url = "http://localhost:8997/users?admin=true";
    request.get(url, function(error, response, body) {
        if (error) {
            return console.log(error);
        }
        admins = JSON.parse(body);
        var url1 = "http://localhost:8997/offers";
        request.get(url1, function(error, response, body) {
            var result = JSON.parse(body);
            for (var i = 0; i < result.length; i++) {
                for (var k = 0; k < admins.length; k++) {
                    if (admins[k].id == result[i].userId) {
                        result[i].name = admins[k].name;
                        result[i].avatarLink = "/avatar/" + admins[k].id;
                        break;
                    }
                }
            }
            res.json(result);

        })
    })
})




// Info sur une offre particuliere
app.get("/offerdata/:id", function(req, res) {
    var OfferData = {};
    var url1 = "http://localhost:8997/offers/" + req.params.id;
    var url2 = "http://localhost:8997/reductions?offerId=" + req.params.id;
    var url3 = "http://localhost:8997/bindprestoffer?offerId=" + req.params.id;
    var url5 = baseUrl + "comments?offerId=" + req.params.id;
    request.get(url1, function(error, response, body) {
        if (error) {
            return console.log('Error:', error);
        }

        var offer = JSON.parse(body);
        OfferData.offer = offer;
        var url4 = "http://localhost:8997/users/" + OfferData.offer.userId;
        request.get(url4, function(error, response, body) {
            if (error) {
                return console.log('Error:', error);
            }
            var user = JSON.parse(body);
            OfferData.user = {};
            OfferData.user.name = user.name;
            OfferData.user.avatar = "/avatar/" + user.id;
            request.get(url2, function(error, response, body) {
                if (error) {
                    return console.log('Error:', error);
                }
                var reductions = JSON.parse(body);
                OfferData.reductions = reductions;
                request.get(url3, function(error, response, body) {
                    if (error) {
                        return console.log('Error:', error);
                    }
                    var bindprestations = JSON.parse(body);
                    var data = "";
                    if (bindprestations.length > 0) {
                        data += ("id=" + bindprestations[0].prestationId)
                    }
                    for (var i = 1; i < bindprestations.length; i++) {
                        data += ("&id=" + bindprestations[i].prestationId);
                    }
                    request.get(baseUrl + "prestations?" + data, function(error, reponse, body) {
                        OfferData.prestations = JSON.parse(body);
                    })
                    request.get(url5, function(error, response, body) {
                        if (error) {
                            return console.log('Error:', error);
                        }
                        var comments = JSON.parse(body);
                        OfferData.comments = [];
                        if (comments.length == 0) {
                            res.json(OfferData);
                            return;
                        }
                        var data = "id=" + comments[0].userId;
                        for (var i = 1; i < comments.length; i++) {
                            data += ("&id=" + comments[i].userId);
                        }
                        var requsers = baseUrl + "users?" + data;
                        request(requsers, function(error, response, body) {
                            if (error) {
                                return console.log('Error:', error);
                            }
                            var users = JSON.parse(body);
                            for (var i = 0; i < users.length; i++) {
                                var obj = {};
                                obj.name = users[i].name;
                                obj.surname = users[i].surname;
                                obj.userId = users[i].id;
                                for (var j = 0; j < comments.length; j++) {
                                    if (comments[j].userId == obj.userId) {
                                        obj.comment = comments[j].comment;
                                        obj.date = comments[j].date;
                                        OfferData.comments.push(obj)
                                    }
                                }
                            }
                            res.json(OfferData);
                        })
                    })

                });
            });
        });
    });

})

app.get("/prestations", function(req, res) {
    res.render("prestations");
})
// Vue d'une Offre
app.get("/offer/:id", function(req, res) {
    res.render("singleOfferLayout", {
        id: req.params.id,
        connected: (req.session.uniqueID != null)
    });
});
app.get("/offers", function(req, res) {
    res.render("OffersLayout", {
        connected: (req.session.uniqueID != null),
        panel: false
    });
});
app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect("/");
});
app.get("/connection", function(req, res) {
    if (req.session.uniqueID) {
        res.render("panelLayout", {
            "newOffers": "4",
            panel: true
        });
    } else {
        res.redirect("/");
    }

});
app.get("/login", function(req, res) {
    res.render('loginLayout');
});
app.get("/register", function(req, res) {
    res.render("registerLayout");
});
app.get("/", function(req, res) {
    res.render("Acceuil", {
        connected: (req.session.uniqueID != null),
        panel: false
    });
});
app.use("/", express.static(__dirname + "/public"));
app.use(function(req, res) {
    res.sendFile("404.html", {
        root: path.join(__dirname, "/public")
    });
});
app.listen(3000, function() {});
// database.use(jsonServer.defaults);
database.use(jsonServer.router("db.json"));
database.listen(8997);
