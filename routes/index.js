//expecting from database
const Data = require('../data');

//expecting from login
const configPassport = require('./passportconfig');

const passport = require('passport');
configPassport(passport);

// const recursiveGetCommentsFromAnswers = (answers, index, dict) => {
//     if (index >= answers.length) {
//         return 
//     }
//     Data.database.getCommentsByAnwersId(answers[index]._id)
//     .then((comments) => {
//         dict[answers[index]._id] = comments;
//         recursiveGetCommentsFromAnswers(answers, index + 1, dict);
//     })
// }

let single_post_result = {
            post: {
                title: 'post title',
                vote: 123,
                body: 'post  body,post  body,post  body',
                username: 'Lei Duan',
                userpoints: 3456,
                date: '11/03/1989'
            },
            answer: [{
                username: 'Lei Diuan',
                userpoints: 4,
                vote: 12312,
                date: '11/03/1989',
                body: 'ans bodyans bodyans bodyans body',
                comments: [{
                        body: 'lei lei is gpood',
                        username: 'lei'
                    }, {
                        body: 'heihei',
                        username: 'name_123'
                    }

                ]

            }, {
                username: 4,
                userpoints: 43,
                vote: 2,
                date: 'ahh',
                body: 'b5678765678909765789',
                comments: [{
                        body: 'ffa',
                        username: 'faasa'
                    }, {
                        body: 'fda',
                        username: 'dsfa'
                    }

                ]
            }]
        }
function signupcheck(email) {

    return Data.database.getUserByEmail(email).then(() => {
        console.log('check: existing')
        return Promise.reject("Duplicated Email");
    }).catch(() => {
        console.log('check: no existing')
        return Promise.resolve("haha");
    });
}

function edituser(id, body) {

    return new Promise((resolve, reject) => {

        Data.database.getUserByEmail(body.email)
            .then(() => {
                reject("Email exists");
            }).catch((res) => {
                console.log(res);
                Data.database.updateUser(id, "name", body.name)
                    .then(user => {
                        return Data.database.updateUser(id, "email", body.email)
                    })
                    .then((user) => {
                        return Data.database.updateUser(id, "pasword", body.password);
                    })
                    .then(user => {
                        resolve("success");
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
    })
}

let getpostinfo = function(id) {
    console.log('getpostinfo called, id: '+ id);


    let single_post_result = {}
    let db = Data.database;

    return new Promise((res, rej) => {
        db.getPostById(id)
            .then((post) => {
                single_post_result.post = post;
                return db.getAnswersByPostId(post._id)
            })
            .then(answers => {
                let commentsPromises = [];
                single_post_result.answer = answers;
                answers.forEach(function(element, index) {
                    commentsPromises.push(db.getCommentsByAnwersId(element._id));
                });
                return Promise.all(commentsPromises);
            })
            .then(comments => {
                for (let i = 0; i < comments.length; ++i) {
                    single_post_result.answer[i].comments = comments[i];
                }
                console.log('number of answers in single_post_result: ' + single_post_result.answer.length)
                    // single_post_result is done
                    // be aware of answers and answer, no s !!!!
                res(single_post_result);
            })
            .catch(err => {
                console.log('err when getpostinfo:');
                console.log(err);
                rej(err);
            })


    });


    /*

        

        */
    //   return Promise.resolve(single_post_result);

}

function getuserinfo(id) {

    console.log("in getuserinfo: id is " + id);

    let res = {
        post: [{
                _id: 122,
                title: 'post title',
                vote: 123,
                body: 'post  body,post  body,post  body',
                date: '11/03/1989'
            }, {
                _id: 123,
                title: 'post title',
                vote: 123,
                body: 'post  heihie body,post  body,post  body',
                date: '12/03/1989'
            }

        ],
        answer: [{

            postid: 122,
            userid: 8,
            title: 'This is a esay question',
            body: 'I am a answer boyd, my id is 12, I belong to post 122, hahahah',
            vote: 10


        }, {

            postid: 121,
            userid: 7,
            title: 'This is a very esay question',
            body: 'I am anothoer answer boyd, my id is 11, I belong to post 121, hei hei hei',
            vote: 10

        }]

    }
    return Promise.resolve(res);
}


const constructorMethod = (app) => {

    app.use(passport.initialize());
    app.use(passport.session());

    //http://stackoverflow.com/questions/26859349/can-you-authenticate-with-passport-without-redirecting

    // app.post('/login',
    //     passport.authenticate('local'),
    //     function(req, res) {
    //         // If this function gets called, authentication was successful.
    //         // `req.user` contains the authenticated user.
    //         res.json({"status":"success","user":req.user});
    //     });


    //form page for creating a new post(quesiton)
    app.get('/posting', (req, res) => {
        console.log('app.get posting called');
        res.render('partials/posting')
    });


    app.post('/login',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/',
            failureFlash: true
        })
    );


    app.get('/test', (req, res) => {
        Data.database.getUsers().then(ur => {

            res.json(ur);
        })
    });


    app.get('/login', (req, res) => {
        res.redirect('/');

    });

    app.get('/logout',
        function(req, res) {
            req.logout();
            res.redirect('/');
        });


    app.post('/signup', (req, res) => {

        signupcheck(req.body.email).then(() => {

            Data.database.createUser(req.body).then(user => {
                console.log("createUser successed:"); //e.g.  sign up successed, usrname: pasword:
                console.log(user);
                /* refer from
                http://code.runnable.com/VKHrGJKvwo55gHL7/express-passport-js-login-and-register-for-node-js-and-hello-world            
                */
                passport.authenticate('local')(req, res, function() {
                    res.json({
                        "status": "success"
                    });
                });

            }).catch(err => {

                console.log('\n in route createUser falied:');
                console.log(err.errmsg.toString());
                res.json({
                    "status": err.errmsg
                });
            });

        }).catch(err => {
            res.json({
                "status": err
            });

        })
    });



    app.get('/profile',
        require('connect-ensure-login').ensureLoggedIn(),
        function(req, res) {
            getuserinfo(req.user._id).then(userinfo => {
                res.render('partials/profile_working', {
                    user: req.user,
                    postList: userinfo.post,
                    answerList: userinfo.answer
                })
            });


        });

    app.get('/profile/:id', (req, res) => {
        if (req.user && req.params.id == req.user._id) {
            res.redirect('/profile');
            return;
        }
        getuserinfo(req.params.id).then(userinfo => {
            res.render('partials/profile', {
                user: req.user,
                postList: userinfo.post,
                answerList: userinfo.answer
            })
        });

    })

    app.get('/', (req, res) => {

        // expecting from database
        // get user setting and prefer 
        // in order to display the homepage postlist
        // it will always work even user is undefined
        Data.DefaultSearch(req.user).then(postlist => {
            console.log('SearchPost give me:');
            console.log(postlist);
            // console.log(postlist[0]._id);

            if (req.user) {
                console.log('req.user is true');
                console.log(req.user);
                res.render('partials/home', {
                    postList: postlist,
                    user: req.user
                        // a: "what the fuck"
                });
            } else {
                res.render('partials/home', {
                    postList: postlist
                        // a: "what the fuck"
                });
            }

        }).catch(err => {
            res.render('partials/home', {
                user: req.user,
                listerrormessage: err
            })
        });
    });

    // when search cliked with a 'post' dropdown tag
    app.get('/:searchpost', (req, res) => {
        //excepting searching ULR like :
        // :3000/search?q=java
        // then i got java
        console.log('get searchpost called')
        Data.SearchPost(req.query.q).then(postlist => {

            if (req.user) {
                res.render('partials/home', {
                    postList: postlist,
                    user: req.user
                });
            } else {
                res.render('partials/home', {
                    postList: postlist,
                });

            }
        }).catch(err => {
            res.render('partials/home', {
                user: req.user,
                listerrormessage: err
            })
        });
    });

    // when search cliked with a 'user' dropdown tag
    // search user ???  not sure
    app.get('/searchuser', (req, res) => {
        //excepting searching ULR like :
        // :3000/search?q=java
        // then i got java
        Data.user.Search(req.query.q).then(userlist => {
            res.render('partials/userlist', {
                list: userlist,
                user: req.user //logged in user
            })
        }).catch(err => {
            res.render('partials/home', {
                user: req.user,
                listerrormessage: err
            })
        });
    });

    //the single post page
    app.get('/post/:id', (req, res) => {
        getpostinfo(req.params.id).then(postinfo => {
            console.log('\npostinfo.post is');
            console.log(postinfo.post);

            console.log('\npostinfo.answer is');
            console.log(postinfo.answer);   

            res.render('partials/singlepost', {
                post: single_post_result.post,
                answer: single_post_result.answer

            });

        }).catch(err => {
            res.render('partials/singlepost', {
                message: err
            });
        });
    });


    //post method to create a new post(quesiton)
    app.post('/posting', (req, res) => {

        console.log('in route post posting callde');
        console.log('req.body:');
        console.log(req.body);
        console.log('user id:');
        console.log(req.user._id);

        Data.database.createPost(req.body, req.user._id).then(newpost => {
            console.log('createPost successed');
            res.redirect('/post/' + newpost._id);
        }).catch(err => {
            console.log('createPost falied, err:');
            console.log(err);
            res.render('partials/posting', {
                message: err
            });
        });

    });

    //post method to create a new anster, 
    //no single page for answer, the form is on the bottom 
    app.post('/answering', (req, res) => {
        console.log('in route answering post called');

        // the postid that this comment belongs to is included in the req.body
        console.log('req.user._id is ');
        console.log(req.user._id);

        Data.database.createAnswer(req.body, req.user._id, req.body.postid).then(ans => {
            console.log('in route ans success, ans:');
            console.log(ans);
            // answer successed, go to the new answer location of the same post page
            res.redirect('/post/' + req.body.postid);
        }).catch(err => {
            // answer falied, stay on the post page
            res.redirect('/post/' + req.body.postid);

        });

    });

    app.post('/editprofile', (req, res) => {
        edituser(req.user._id, req.body).then(info => {
            res.json({
                "status": info
            });
        }).catch(err => {
            console.log('in editprofile route : err:');
            console.log(err);
            res.json({
                "status": "falied",
                msg: err
            })
        });

    });

    //post method to create a new comment, 
    //no single page for comment, the form is inside the postpage 
    app.post('/commenting', (req, res) => {

        if (!req.isAuthenticated()) {

            res.render('partials/postform', {
                loginerrormessage: 'Please login'
            });
        } else {

            // the answer that this comment belongs to is included in the req.body
            // the post id that the answer belongs to is included in the req.body too
            Data.cmoments.create(req.user, req.body).then(locationhash => {

                // comment successed, go to the new comment location of the same post page
                res.redirect('/post/' + req.body.postid + '#' + locationhash);
            }).catch(err => {

                // comment falied, stay on the post page
                res.redirect('/post/' + req.body.postid);

            });
        }
    });


    app.use("*", (req, res) => {
        res.sendStatus(404);
    });
};

module.exports = constructorMethod;