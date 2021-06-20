require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt=require('bcryptjs')
const cookieParser=require('cookie-parser')
const auth=require('./middleware/auth')

require("./db/conn");
const Register=require('./models/registers')

const port = process.env.PORT || 2000;

const static_path = path.join(__dirname, "../public" );
const template_path = path.join(__dirname, "../templates/views" );
const partials_path = path.join(__dirname, "../templates/partials" );


app.use(express.urlencoded({extended:false}))
app.use(express.static(static_path));
app.use(express.json());
app.use(cookieParser())

app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY);

app.get("/", auth,(req, res) => {
    res.render("index")
});

app.get("/register", (req, res) =>{
    res.render("register")
})

app.get("/logout",auth,async (req, res) =>{
    try {
        req.user.tokens=req.user.tokens.filter((currElement)=>{
            return currElement.token===req.token 
        })
        res.clearCookie('jwt')
        await req.user.save()
       
        res.render('login')
    } catch (error) {
        res.send(500).send(error)
    }
})

//create a new user in our database

app.post("/register", async(req, res) =>{
    try{
      const password=req.body.password;
      const cpassword=req.body.confirmpassword;
      
      if(password ===cpassword){

         const registerEmployee=new Register({

            firstname: req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            gender:req.body.gender,
            phone:req.body.phone,
            age:req.body.age,
            password:password,
            confirmpassword:cpassword 
         })
         
        const token=await registerEmployee.generateAuthToken(); //function call 

        res.cookie('jwt',token,{
            expires:new Date(Date.now()+500000),
            httpOnly:true  
        })
        console.log(cookie)
         const registered=await registerEmployee.save();
         res.status(201).render('index')
      }
      else{
        res.send('password not matching')
      }
    }
    catch(error){
        res.status(400).send(error)
    }
})


app.get("/login", (req, res) =>{
    res.render("login");
})

//login check
app.post('/login',async(req,res)=>{
    try{
       const email=req.body.email;
       const password=req.body.password;

       const useremail=await Register.findOne({email:email})

       const isMatch=await bcrypt.compare(password,useremail.password)

       const token=await useremail.generateAuthToken();
       console.log(token)
       res.cookie('jwt',token,{
        expires:new Date(Date.now()+50000),
        httpOnly:true  
    }) 

       if(isMatch){
           res.status(201).render('index')
       }
       else{
           res.send('Invalid login details')
       }
    }
    catch(error){
        res.status(400).send('Invalid login details')
    }
})


app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})

