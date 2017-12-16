var express = require('express');
var routes = express.Router();
var neo4j = require('neo4j-driver').v1;

var driver = neo4j.driver("bolt://hobby-gkomkckeehocgbkeapcnljal.dbs.graphenedb.com:24786", neo4j.auth.basic("movie","b.lh506p7aAWxB.dwlM2RFL23wZVjp3"));
var session = driver.session();

routes.post('/add/:user',function (req,res) {
    const user = req.params.user;

    session
        .run("CREATE(n:User {user:{userParam}}) RETURN n.user", {userParam: user})
        .then(function(result){
            session.close()
            res.status(200).json({"status":"Done"});
        })
        .catch(function(error) {
            console.log(error)
        })
})

routes.put('/movieswatched/',function (req,res) {
    const movies = req.body.watchedmovies;
    const user = req.body._id;

    session
        .run("MATCH(a:User {user:{userParam}})-[r:WATCHED]-(b:Movie) DELETE r", {userParam:user})
        .then(function (result) {
            session.close();
            res.status(200).json({"status": "Done"});
        })

    for(let mongoId of movies){
        session
            .run("MATCH(a:Movie {mongoId:{mongoId}}),(b:User {user:{user}}) MERGE(b)-[r:WATCHED]->(a) RETURN a,b",{mongoId: mongoId, user: user})
            .then(function(result){
                session.close()
                res.status(200).json({"status":"Done"});
            })
            .catch(function(error) {
                console.log(error)
            })
    }
})

module.exports = routes;