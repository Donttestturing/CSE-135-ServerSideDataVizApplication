const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');


const port = 3000;


const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


function authAdmin(req, res, next) {
	const token = req.header("auth-token");

  const adminToken = req.header("admin-token");
  
  //console.log("in authAdmin", adminToken);

	if (!token || !adminToken || adminToken != 1){
		return res.status(401).json({ msg: "No token in header" });
	} 	
	try {
		const decoded = jwt.verify(token, 'secret-key');
		req.user = decoded.user;
		next();
	} catch (err) {
		res.status(500).json({
			msg : err.message
		});
	}
}
function auth(req, res, next) {
	const token = req.header("auth-token");

	if (!token){
		return res.status(401).json({ msg: "No token in header" });
	} 	
	try {
		const decoded = jwt.verify(token, 'secret-key');
		req.user = decoded.user;
		next();
	} catch (err) {
		res.status(500).json({
			msg : err.message
		});
	}
}










//DB CONFIG                         
const mysql = require('mysql2')
const connection = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Apple135Slug',
    database: 'user_data'
});
// connection.connect(function (err) {
//   if (err) throw err
//   console.log('MySQL Database Connected!')
// });

setInterval(()=> {
    
  const connection = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Apple135Slug',
    database: 'user_data'
  });

}, 1000000 ); //About every 15 min, make a new pool

// ------ DB Configuration ------- //




const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cors())


//ROUTES 
app.post("/user/register", async(req,res) =>{
  const {username, email, password, admin} = req.body;
  //console.log(req.body);

  //will need to first check if user exists
  //otherwise, add it
  
  const queryUserCheck = `SELECT * FROM users_table where username = ? or email = ?`;

  const valuesUserCheck = [
    username,
    email,
  ];

  connection.query(queryUserCheck, valuesUserCheck, async function (err, result, fields){
      if (err) throw err;
      res.set('Access-Control-Allow-Origin', ['https://www.reporting.ucsociallydead.com']);
      //console.log(result);
      if(result[0] != undefined){
        res.send({msg: "User Already Exists"});
        console.log("User Already Exists");
      } else {
        const s = await bcrypt.genSalt(10);
        userPassword = await bcrypt.hash(password, s);


        const cquery = `select count(*) from users_table;`;

   
        connection.query(cquery, [], function (err, result2, fields) {
            if (err) throw err;
      
            //res.send(result);   result2[0]['count(*)']

            const query = `INSERT IGNORE INTO users_table (id, username, email, password, admin) 
            VALUES (?, ?, ?, ?, ?)`;

            const values = [
              result2[0]['count(*)'] + 1,
              username,
              email,
              userPassword,
              0
            ];

            connection.query(query, values, function (err, result3, fields) {
                if (err) throw err;
           
                res.send(result3);

            });

        });





      }
      
  });



});

app.post("/user/login", async (req, res) => {
  const { emailOrName, password } = req.body;

  res.set('Access-Control-Allow-Origin', ['https://www.reporting.ucsociallydead.com']);
  let user = {}
  connection.query(`SELECT * FROM users_table where username = ? or email = ?`,[emailOrName, emailOrName], async function (err, result, fields) {  		
    if (err) throw err
    console.log(result[0], "logged in");
    user = result[0];    

    if(user == undefined){   //USER or EMAIL DNE
      console.log("DNE");
      res.send({msg:"User or Email does not exist."});

    }
    else {
      const flag = await bcrypt.compare(password, user.password);
      //console.log(password, user.password, flag);
      if (!flag) {
        console.log("Invalid Password");
        res.send({msg:"Invalid Password"});
      }
      else {
          jwt.sign(user, 'secret-key' ,{ expiresIn: 10000,}, (err, token) => {
            if (err) {
              throw err; console.log(err);
            }
            //console.log(token);
            const toReturn = {token: token, admin: user.admin};

            res.send(toReturn);
    
          });

      }
    }

  });

});


app.get('/user', authAdmin, (req, res) => {    //authAdmin

  connection.query("SELECT * FROM users_table", function (err, result, fields) {  		//for testing ONLY, need to make secure
      if (err) throw err
      //console.log("yayay"+result);
      res.set('Access-Control-Allow-Origin', ['https://www.reporting.ucsociallydead.com']);
      res.set('Content-Type', 'application/json');
      
      res.send(result);
    
  });
  
});
app.delete('/user/:id', authAdmin, (req, res) => {   

  //console.log(req._eventsCount); 
  //console.log(req.params.id); 

  res.set('Access-Control-Allow-Origin', ['https://www.reporting.ucsociallydead.com']);
 
  connection.query("delete from users_table where id = ?",[req.params.id], function (err, result, fields) {  		
      if (err) throw err
      //console.log("yayay"+result);

      res.set('Content-Type', 'application/json');
      

      res.send({"msg":`#${req.params.id} row deleted`});
      console.log({"msg":`#${req.params.id} row deleted`});
  });
  
});

app.patch('/user/:id', authAdmin, (req, res) => {    //auth authAdmin

  //console.log(req.params.id); 
  //console.log(Object.keys(req.body)[0]); 

  let fieldToPatch = Object.keys(req.body)[0];
  let valueToPatch = Object.values(req.body)[0];
  if(valueToPatch == ''){                         //error protection for admin not entering a value, yet hitting enter
    res.set('Access-Control-Allow-Origin', ['https://www.reporting.ucsociallydead.com']);
    res.set('Content-Type', 'application/json');
    res.send({"msg":` no row patched, invalid update value`});

  }  else {

    //let test = `update users_table set ${fieldToPatch} = ? where id = ?;`;
   // console.log(`update users_table set ${fieldToPatch} = ${valueToPatch} where id = ${Number(req.params.id)};`);

    if(fieldToPatch === 'password'){  //if password, need to encrypt password
      
      encodePswd(valueToPatch).then((returnVal) => {
        //console.log(returnVal);
        //valueToPatch = returnVal;
        connection.query(`update users_table set ${fieldToPatch} = ? where id = ?;`,[returnVal, Number(req.params.id)], function (err, result, fields) {  		
          if (err) throw err;
    
          res.set('Access-Control-Allow-Origin', ['https://www.reporting.ucsociallydead.com']);
          res.set('Content-Type', 'application/json');
          res.send({"msg":` ${req.params.id} row patched`});

        });
        
      });
    } else {
        //console.log(valueToPatch);

        connection.query(`update users_table set ${fieldToPatch} = ? where id = ?;`,[valueToPatch, Number(req.params.id)], function (err, result, fields) {  		
          if (err) throw err;
    
          res.set('Access-Control-Allow-Origin', ['https://www.reporting.ucsociallydead.com']);
          res.set('Content-Type', 'application/json');
          res.send({"msg":` #${req.params.id} row patched`});
          console.log({"msg":`#${req.params.id} row patched`});

        });
    }


  }
});

async function encodePswd(password){
  const s = await bcrypt.genSalt(10);
  userPassword = await bcrypt.hash(password, s);

  return userPassword;
}

app.put('/user/:id', authAdmin, (req, res) => {    


  let fieldToPatch = Object.keys(req.body)[0];
  let valueToPatch = Object.values(req.body)[0];
  //console.log(Object.values(req.body)); 


  if(valueToPatch == ''){                         //error protection for admin not entering a value, yet hitting enter
    res.set('Access-Control-Allow-Origin', ['https://www.reporting.ucsociallydead.com']);
    res.set('Content-Type', 'application/json');
    res.send({"msg":` no row patched, invalid update value`});

  }  else {

    //let test = `update users_table set ${fieldToPatch} = ? where id = ?;`;
    //console.log(`update users_table set ${fieldToPatch} = ${valueToPatch} where id = ${Number(req.params.id)};`);
    values = Object.values(req.body);
    values.push(Object.values(req.body)[0]);

    connection.query(`update users_table set id = ?, username = ?, email = ?, password = ?, admin = ? where id = ?;`, values, function (err, result, fields) {  		
      if (err) throw err;
      
      res.set('Access-Control-Allow-Origin', ['https://www.reporting.ucsociallydead.com']);
      res.set('Content-Type', 'application/json');
      res.send({"msg":` #${req.params.id} row updated`});
      console.log({"msg":` #${req.params.id} row updated`});

    });
    


  }

});

app.post("/user", authAdmin,  async(req,res) => {
  const {id, username, email, password, admin} = req.body;
  console.log(req.body);

  //will need to first check if user exists
  //otherwise, add it
  res.set('Access-Control-Allow-Origin', ['https://www.reporting.ucsociallydead.com']);

  const queryUserCheck = `SELECT * FROM users_table where username = ? or email = ?`;

  const valuesUserCheck = [
    username,
    email,
  ];

  connection.query(queryUserCheck, valuesUserCheck, async function (err, result, fields){
      if (err) throw err;

      //console.log(result);
      if(result[0] != undefined){
        res.send({msg: "User Already Exists"});
        console.log("User Already Exists");
        //need pop up here

      } else {
        connection.query("select count(*) from users_table;", [], async function (err, result3, fields) {
            if (err) throw err;
            //console.log(result3);
            //console.log(result3[0]['count(*)']);
            //res.send(result3);

      
            const s = await bcrypt.genSalt(10);
            userPassword = await bcrypt.hash(password, s);

            const query = `INSERT IGNORE INTO users_table (id, username, email, password, admin) 
                      VALUES (?, ?, ?, ?, ?)`;

            const values = [
              id,
              username,
              email,
              userPassword,
              admin
            ];

            connection.query(query, values, function (err, result2, fields) {
                if (err) throw err;
                //console.log(result2);

                let idval = result3[0]['count(*)'] + 1;
                res.send({id: idval});        //ZING GRID was the row number as a response

            });

      });

      }
      
  });
});

app.get('/user/check', auth, (req, res) => {     //used to verify a user on the reporting dashboard

  const token = req.header("auth-token");
  res.set('Access-Control-Allow-Origin', ['https://www.reporting.ucsociallydead.com']);
 
  try {
    res.json({
        msg : 'user checked'
    });
  } catch (e) {
    res.send({ msg: "Error in Fetching user" });
  }
  
});




//Previous version below
/*
HTTP Method:    GET
Example Route:  /user
Description:    Retrieve every entry logged in the user table
*/
//app.options('/user', cors());
/*
app.get('/user/secure-api', auth, (req, res) => {     //authAdmin
  //console.log(req.headers);
  // res.set('Access-Control-Allow-Origin', ['reporting.ucsociallydead.com']);

  const token = req.header("auth-token");
  //console.log("here", req.headers);
 
 
  connection.query("SELECT * FROM users_table", function (err, result, fields) {  		//for testing ONLY, need to make secure
      if (err) throw err
      //console.log("yayay"+result);
      res.set('Access-Control-Allow-Origin', ['https://www.reporting.ucsociallydead.com']);
      res.set('Content-Type', 'application/json');
      
      res.send(result);
      //res.json({ data: result })
  })
  
});

app.post("/user/secure-api", auth, async(req,res) => {
  const {username, email, password, admin} = req.body;
  console.log(req.body);

  //will need to first check if user exists
  //otherwise, add it
  
  const queryUserCheck = `SELECT * FROM users_table where username = ? or email = ?`;

  const valuesUserCheck = [
    username,
    email,
  ];

  connection.query(queryUserCheck, valuesUserCheck, async function (err, result, fields){
      if (err) throw err;

      //console.log(result);
      if(result[0] != undefined){
        res.send({msg: "User Already Exists"});
        console.log("User Already Exists");
        //need pop up here

      } else {
        const s = await bcrypt.genSalt(10);
        userPassword = await bcrypt.hash(password, s);

        const query = `INSERT IGNORE INTO users_table (username, email, password, admin) 
                  VALUES (?, ?, ?, ?)`;

        const values = [
          username,
          email,
          userPassword,
          admin
        ];

        connection.query(query, values, function (err, result, fields) {
            if (err) throw err;
            //console.log(result);
            //result.id = 
            res.send(result);

        });
      }
      
  });
});

app.delete("/user/secure-api/", auth, async(req,res) => {      //TODO
  const {username, email, password, admin} = req.body;
  console.log(req.body);

  //will need to first check if user exists
  //otherwise, add it
  
  const queryUserCheck = `delete FROM users_table where username = ? or email = ?`;

  const valuesUserCheck = [
    username,
    email,
  ];

  connection.query(queryUserCheck, valuesUserCheck, async function (err, result, fields){
      if (err) throw err;

      //console.log(result);
      if(result[0] != undefined){
        res.send({msg: "User Already Exists"});
        console.log("User Already Exists");
        //need pop up here

      } 
      
  });

});
*/


// app.options("/user/secure-api", (req, res) => {        //TODO add more routes for our reporting display portion

//   console.log("HERE");

//   res.set('Access-Control-Allow-', ['']);     //NOT working
//   res.send();


// });
// app.put('/user/:username', (req, res) => {
//   const username = req.params.username;

//   const query = `UPDATE users_table SET 
//                       username = ?,
//                       email = ?, 
//                       password = ?, 
//                       admin = ? 
//                   WHERE username = ?`;

//   const values = [
//       username,
//       req.body.email,
//       req.body.password,
//       req.body.admin,
//       username
//   ];

//   connection.query(query, values, function (err, result, fields) {
//       if (err) throw err;
//       console.log(result);
//       res.send(result);
//       //res.json({ data: req.body });
//   });

// });


// app.patch('/user/:username', (req, res) => {
//   const username = req.params.username;

//   const query = `UPDATE users_table SET 
//                       username = ?,
//                       email = ?, 
//                       password = ?, 
//                       admin = ? 
//                   WHERE username = ?`;

//   const values = [
//       username,
//       req.body.email,
//       req.body.password,
//       req.body.admin,
//       username
//   ];

//   connection.query(query, values, function (err, result, fields) {
//       if (err) throw err;
//       console.log(result);
//       res.send(result);
//       //res.json({ data: req.body });
//   });
  
// });











/*
Start server
*/
app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});


