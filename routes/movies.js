var express = require('express');
var routes = express.Router();
var neo4j = require('neo4j-driver').v1;

var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j","gekkehenk21"));
var session = driver.session();

routes.post('/add/:id',function (req,res) {
    const mongoId = req.params.id;
    const genres = req.body.genres;

    session
        .run("MERGE(n:Movie {mongoId:{mongoIdParam}}) RETURN n.mongoId", {mongoIdParam: mongoId})
        .then(function (result) {
            session.close();
            res.status(200).json({"status": "Done"});

            session
                .run("MATCH(n:Movie {mongoId:{mongoIdParam}})-[r:GENRES]-(b:Genre) DELETE r", {mongoIdParam: mongoId})
                .then(function (result) {
                    session.close();
                    res.status(200).json({"status": "Done"});
                })

            for (let genre of genres) {
                console.log(genre.genre);
                console.log(mongoId);
                session
                    .run("MERGE (n:Genre {genre:{genreParam}}) RETURN n;", {genreParam: genre.genre})
                    .then(function (result) {
                        session.close();
                        res.status(200).json({"status": "Done"});
                    })
                    .catch(function (error) {
                        console.log(error)
                    })

                session
                    .run("MATCH(a:Movie {mongoId:{mongoId}}),(b:Genre {genre:{genre}}) MERGE(a)-[r:GENRES]->(b) RETURN a,b", {
                        mongoId: mongoId,
                        genre: genre.genre
                    })
                    .then(function (result) {
                        session.close();
                        res.status(200).json({"status": "Done"});
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            }
        })
        .catch(function (error) {
            console.log(error)
        })
});

routes.delete('/delete/:id',function(req,res) {
    const mongoId = req.params.id;

    session
        .run("MATCH(a: Movie {mongoId:mongoIdParam}}) DETACH DELETE a", {mongoIdParam: mongoId})
        .then(function (result) {
            session.close()
            res.status(200).json({"status":"Done"});
        })
        .catch(function(error) {
            console.log(error)
        })
})

routes.put('/update/',function (req,res) {
    const genre = req.body.genre;
    const mongoId = req.body._id;

    session
        .run("CREATE(n:Genre {genre:{genreParam}}) RETURN n.genre", {genreParam: genre})
        .then(function(result){
            session.close()
            res.status(200).json({"status":"Done"});
        })
        .catch(function(error) {
            console.log(error)
        })
})

module.exports = routes;