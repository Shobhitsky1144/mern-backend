const mongoose=require('mongoose');
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')

const employeeSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true
    },
    phone: {
        type:Number,
        required:true,
        unique:true
    },
    age: {
        type:Number,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    confirmpassword: {
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

  //generaing tokens
  employeeSchema.methods.generateAuthToken=async function(){
      try{
        const token=jwt.sign({_id:this._id.toString()},"kykkckkcskykkcskykkckkcskykkcsk")
        this.tokens=this.tokens.concat({token:token})
        console.log(token)
        await this.save() //save token
        return token;
      }catch(error){
    res.send(error)
      }
  }

  //converting passowrd into hash
employeeSchema.pre('save',async function(next){
   if(this.isModified('password')){
    this.password=await bcrypt.hash(this.password,10)
    this.confirmpassword=await bcrypt.hash(this.password,10);
   }
  
   next();
})

//create collection

const Register=new mongoose.model("Register",employeeSchema)
module.exports=Register;